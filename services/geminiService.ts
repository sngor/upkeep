import { GoogleGenAI, Type, GenerateContentResponse } from '@google/genai';
import { ApplianceDetails, GeminiResponse, ExtractedDocInfo, CareTask, LocalService } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

const applianceDetailsSchema = {
  type: Type.OBJECT,
  properties: {
    make: { type: Type.STRING, description: 'The brand or manufacturer of the appliance.' },
    model: { type: Type.STRING, description: 'The model number or name of the appliance.' },
    type: { type: Type.STRING, description: 'The general type of the appliance (e.g., Refrigerator, Washing Machine, Dishwasher).' },
    serialNumber: { type: Type.STRING, description: 'The serial number of the appliance, if visible.' },
  },
  required: ['make', 'model', 'type'],
};

export const analyzeImageForApplianceDetails = async (file: File): Promise<ApplianceDetails> => {
  const imagePart = await fileToGenerativePart(file);
  const prompt = "Analyze the image of the appliance label and extract the make, model, type, and serial number. The type should be a common name like 'Refrigerator' or 'Washing Machine'.";
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{ parts: [imagePart, { text: prompt }] }],
    config: {
      responseMimeType: 'application/json',
      responseSchema: applianceDetailsSchema,
    },
  });

  try {
    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as ApplianceDetails;
  } catch (e) {
      console.error("Failed to parse JSON from analyzeImageForApplianceDetails:", response.text);
      throw new Error("AI returned invalid data. Please try again with a clearer image.");
  }
};

export const generateApplianceInfo = async (details: ApplianceDetails, location?: { latitude: number; longitude: number }): Promise<{ response: GeminiResponse, modelVersion: string }> => {
  const modelName = 'gemini-2.5-pro';
  
  const prompt = `
    Generate a complete maintenance profile for a ${details.make} ${details.model} (${details.type}).
    
    You MUST use your search and maps tools to find the following information:
    1. A detailed care schedule with specific tasks, frequencies, and instructions. Find how-to guides or YouTube links if possible.
    2. At least three reputable, local repair services. For each service, provide its name, address, phone number, and website.
    
    Your entire response must be a single, raw JSON object. Do not wrap it in markdown like \`\`\`json. Do not add any introductory or concluding text.
    The JSON object must contain the following top-level keys: "applianceDetails", "careSchedule", and "localServices".
    The 'applianceDetails' in the JSON should be an exact copy of the details provided below.
  `;

  const config: any = {
      tools: [
        { googleSearch: {} }, 
        { googleMaps: {} },
      ],
  };

  if (location) {
      config.toolConfig = {
          retrievalConfig: {
              latLng: {
                  latitude: location.latitude,
                  longitude: location.longitude,
              }
          }
      };
  }
  
  const contents = [
      { 
          parts: [
              { text: prompt },
              { text: `Appliance Details to use: ${JSON.stringify(details)}` }
          ] 
      }
  ];

  const response = await ai.models.generateContent({
      model: modelName,
      contents: contents,
      config: config,
  });
  
  try {
    let jsonText = response.text.trim();
    
    // The model might wrap the JSON in ```json ... ``` despite instructions, so extract it.
    const jsonMatch = jsonText.match(/```(json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[2]) {
        jsonText = jsonMatch[2];
    }

    const parsedResponse = JSON.parse(jsonText) as GeminiResponse;
    
    // Simple validation
    if (!parsedResponse.applianceDetails || !parsedResponse.careSchedule || !parsedResponse.localServices) {
        console.error("AI returned an incomplete data structure:", parsedResponse);
        throw new Error("AI returned an incomplete data structure.");
    }
    
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
      .filter((c: any) => c.web && c.web.uri)
      .map((c: any) => ({ title: c.web.title || new URL(c.web.uri).hostname, uri: c.web.uri }))
      .filter((source, index, self) => index === self.findIndex((s) => s.uri === source.uri));

    if (sources.length > 0 && Array.isArray(parsedResponse.careSchedule) && parsedResponse.careSchedule.length > 0) {
        parsedResponse.careSchedule.forEach(task => {
            task.sources = sources;
        });
    }

    return { response: parsedResponse, modelVersion: modelName };
  } catch (e) {
      console.error("Failed to parse JSON or invalid structure from generateApplianceInfo:", response.text, e);
      throw new Error("The AI couldn't generate a profile for this appliance. Please try again.");
  }
};

export const getCostEstimate = async (job: string, location: string): Promise<{ text: string; sources: { title: string; uri: string }[] }> => {
    const prompt = `
      Provide a detailed cost estimate for the following home repair job: "${job}" in the location: "${location}".
      
      Instructions:
      1.  Use your search tool to find current, localized pricing information.
      2.  Break down the estimated costs into materials and labor.
      3.  Provide a low, average, and high price range for the total job.
      4.  Conclude with a brief paragraph explaining the key factors that can influence the final cost, such as the specific brand of the appliance, the extent of the damage, and regional labor rates. This helps manage user expectations.
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            tools: [{googleSearch: {}}],
        },
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
        .filter((c: any) => c.web && c.web.uri)
        .map((c: any) => ({ title: c.web.title || new URL(c.web.uri).hostname, uri: c.web.uri }))
        .filter((source, index, self) => index === self.findIndex((s) => s.uri === source.uri));

    return { text: response.text, sources };
};

const extractedDocInfoSchema = {
    type: Type.OBJECT,
    properties: {
        store: { type: Type.STRING, description: 'The name of the store where the item was purchased.' },
        purchaseDate: { type: Type.STRING, description: 'The date of purchase in ISO 8601 format (YYYY-MM-DD).' },
        totalPrice: { type: Type.STRING, description: 'The total price paid, including currency symbol.' },
        warrantyEndDate: { type: Type.STRING, description: 'The date the warranty expires in ISO 8601 format (YYYY-MM-DD), if mentioned.' },
    },
};

export const extractDetailsFromDocument = async (file: File): Promise<ExtractedDocInfo> => {
    const imagePart = await fileToGenerativePart(file);
    const prompt = "Analyze the provided receipt or document image. Extract the store name, purchase date, total price, and warranty expiration date. Format dates as YYYY-MM-DD.";
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ parts: [imagePart, { text: prompt }] }],
        config: {
            responseMimeType: 'application/json',
            responseSchema: extractedDocInfoSchema,
        },
    });
    
    try {
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as ExtractedDocInfo;
    } catch(e) {
        console.error("Failed to parse JSON from extractDetailsFromDocument:", response.text);
        throw new Error("AI returned invalid data from the document scan.");
    }
};

export const getProTip = async (): Promise<string> => {
    const prompt = "Provide a concise, actionable home maintenance pro-tip that is not specific to any single appliance. The tip should be interesting and easy for a homeowner to understand. Max 2-3 sentences. Do not use markdown formatting.";

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ parts: [{ text: prompt }] }],
    });

    return response.text.trim();
};

export const getKnowledgeBaseAnswer = async (question: string, applianceContext?: ApplianceDetails): Promise<{ text: string; sources: { title: string; uri: string }[] }> => {
    let prompt = `
      As an expert home maintenance AI, answer the following question clearly and concisely: "${question}".
      
      Instructions:
      1.  Use your search tool to find the most accurate and reliable information.
      2.  If the answer involves steps, format it as a step-by-step guide with clear headings and bullet points or a numbered list for easy readability.
      3.  If the answer is informational, structure it with brief paragraphs.
      4.  Always aim to provide actionable, easy-to-understand advice for a homeowner.
    `;
    if (applianceContext) {
        prompt += `\n\nThe user is asking in the context of the following appliance, so tailor your answer accordingly:
- Type: ${applianceContext.type}
- Make: ${applianceContext.make}
- Model: ${applianceContext.model}`;
    }

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            tools: [{googleSearch: {}}],
        },
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
        .filter((c: any) => c.web && c.web.uri)
        .map((c: any) => ({ title: c.web.title || new URL(c.web.uri).hostname, uri: c.web.uri }))
        .filter((source, index, self) => index === self.findIndex((s) => s.uri === source.uri));

    return { text: response.text, sources };
};

export const getSuggestedRepairs = async (applianceType: string): Promise<string[]> => {
    const prompt = `For a "${applianceType}", list 3 common repair jobs. Examples: "Not cooling", "Leaking water", "Making a loud noise". Return the list as a simple JSON array of strings.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ parts: [{ text: prompt }] }],
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
            },
        },
    });
    try {
        const jsonText = response.text.trim();
        const parsed = JSON.parse(jsonText);
        return Array.isArray(parsed) ? parsed : [];
    } catch(e) {
        console.error("Failed to parse JSON from getSuggestedRepairs:", response.text);
        return [];
    }
};

export const generateDeepResearchReport = async (topic: string, applianceContext: ApplianceDetails): Promise<{ text: string; sources: { title: string; uri: string }[] }> => {
    const prompt = `
        As an expert home maintenance researcher AI, generate a comprehensive, in-depth research report on the following topic: "${topic}".
        This report is for a homeowner with a "${applianceContext.make} ${applianceContext.model}" (${applianceContext.type}).

        **Report Requirements:**
        1.  **Synthesize Information:** Use your search tool extensively. Do not rely on a single source. Synthesize findings from manufacturer documentation, professional repair forums, user manuals, and trusted DIY websites to create a complete picture.
        2.  **Structured Output:** Format the entire response using Markdown. Use headings (##), subheadings (###), bullet points (*), and bold text (**) to create a well-organized and easily scannable document.
        3.  **Comprehensive Coverage:** The report MUST include the following sections where applicable:
            - **## Overview:** A brief introduction to the topic.
            - **## Common Symptoms:** A list of signs that this issue is occurring.
            - **## Diagnostic Steps:** A step-by-step guide to confirm the problem. Be specific and safe.
            - **## Tools & Parts:** A list of necessary tools and potential replacement parts (include part numbers if you can find them).
            - **## Step-by-Step Repair Guide:** Detailed, numbered instructions for the repair or maintenance task. Include safety warnings.
            - **## Cost Analysis:** An estimated cost breakdown for both a DIY approach (parts only) and a professional repair (parts + labor).
            - **## Pro-Tips & Prevention:** Expert advice to make the job easier and prevent future issues.
        4.  **Action-Oriented Tone:** Write in a clear, direct, and encouraging tone suitable for a homeowner.

        Begin the report now.
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: "gemini-2.5-pro", // Use a more powerful model for in-depth tasks
        contents: prompt,
        config: {
            tools: [{googleSearch: {}}],
        },
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
        .filter((c: any) => c.web && c.web.uri)
        .map((c: any) => ({ title: c.web.title || new URL(c.web.uri).hostname, uri: c.web.uri }))
        .filter((source, index, self) => index === self.findIndex((s) => s.uri === source.uri));

    return { text: response.text, sources };
};