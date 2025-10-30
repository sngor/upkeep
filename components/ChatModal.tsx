import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type, Chat, Content, GenerateContentResponse } from '@google/genai';
import { type SavedAppliance, type ChatMessage } from '../types';
import { MessageSquareIcon, XIcon, SendIcon, BotIcon, LinkIcon, CopyIcon, CheckIcon } from './Icons';
import { MarkdownRenderer } from './Card';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface ChatModalProps {
  appliance: SavedAppliance;
  onClose: () => void;
  onSaveHistory: (id: string, history: ChatMessage[]) => void;
}

const MAX_CHAR_LIMIT = 1000;

const suggestionSchema = {
    type: Type.ARRAY,
    items: { type: Type.STRING }
};

export const ChatModal: React.FC<ChatModalProps> = ({ appliance, onClose, onSaveHistory }) => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(Array.isArray(appliance.chatHistory) ? appliance.chatHistory : []);
  const [input, setInput] = useState('');
  // FIX: Corrected state declarations and component structure.
  // The original code had a syntax error and invalid hook calls that created a scope issue,
  // making state variables and handlers inaccessible to each other.
  const [isSending, setIsSending] = useState(false);
  const [isSuggestingFor, setIsSuggestingFor] = useState<number | null>(null);
  const [copiedMessageIndex, setCopiedMessageIndex] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { make, model, type } = appliance.response.applianceDetails;
  const systemInstruction = `You are a helpful AI assistant for home maintenance, from the app Upkeep AI. You are chatting with a user about their ${make} ${model} ${type}. Be concise and helpful. When asked about troubleshooting, specific parts, or error codes, you MUST use your search tool to find the most accurate and up-to-date information.`;

  useEffect(() => {
      const chatHistory = Array.isArray(appliance.chatHistory) ? appliance.chatHistory : [];
      const chatInstance = ai.chats.create({
          model: 'gemini-2.5-flash',
          config: {
              systemInstruction: systemInstruction,
              tools: [{googleSearch: {}}]
          },
          history: chatHistory.map(({sources, suggestions, ...rest}) => rest) as Content[],
      });
      setChat(chatInstance);
  // We only want to re-initialize chat if the core appliance or its history changes, not on every systemInstruction change.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliance.id, appliance.chatHistory]);

  useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  const generateSuggestions = async (userQuery: string, modelResponse: string, messageIndex: number) => {
      setIsSuggestingFor(messageIndex);
      try {
          const prompt = `
You are a helpful home maintenance expert guiding a user. Your goal is to anticipate their next logical steps and provide helpful, varied follow-up questions.

Analyze the user's question and the AI's response below:
- User Question: "${userQuery}"
- AI Response: "${modelResponse}"

Based on this exchange, generate 2-3 distinct and actionable follow-up questions. The questions should help the user explore the topic further. Aim for a mix of question types.

Consider these categories for inspiration:
- **Clarification:** "Can you explain what a 'capacitor' is?"
- **Troubleshooting:** "What should I do if I see sparks?"
- **Cost/Sourcing:** "How much does that part typically cost?"
- **Prevention:** "Is there a way to prevent this from happening again?"
- **Alternative Solutions:** "Are there any DIY alternatives to this repair?"

Return the questions as a simple JSON array of strings. Do not include category names in the output.
`;
          
          const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: [{ parts: [{ text: prompt }] }],
              config: {
                  responseMimeType: 'application/json',
                  responseSchema: suggestionSchema,
              }
          });

          const jsonText = response.text.trim();
          const suggestions: string[] = JSON.parse(jsonText);

          if (suggestions.length > 0) {
              setMessages(prev => {
                  const newMessages = [...prev];
                  if (newMessages[messageIndex] && newMessages[messageIndex].role === 'model') {
                      newMessages[messageIndex].suggestions = suggestions;
                  }
                  return newMessages;
              });
          }
      } catch (error) {
          console.error("Failed to generate suggestions:", error);
      } finally {
          setIsSuggestingFor(null);
      }
  };

  const sendMessage = async (messageText: string) => {
      if (!messageText.trim() || !chat || isSending) return;
  
      const userMessage: ChatMessage = { role: 'user', parts: [{ text: messageText }] };
      setMessages(prev => [...prev, userMessage]);
      setIsSending(true);
      setInput('');
  
      try {
          const resultStream = await chat.sendMessageStream({ message: messageText });
          
          let modelResponseText = '';
          let finalChunk: GenerateContentResponse | null = null;
          let isFirstChunk = true;
          let streamingMessageIndex = -1;
  
          for await (const chunk of resultStream) {
              if (isFirstChunk) {
                  isFirstChunk = false;
                  // After first chunk, we are no longer "sending", but "receiving".
                  // We clear the top-level sending state to re-enable the input,
                  // but the UI will show the bot "typing".
                  setIsSending(false); 
                  setMessages(prev => {
                      streamingMessageIndex = prev.length;
                      return [...prev, { role: 'model', parts: [{ text: '' }] }];
                  });
              }
  
              modelResponseText += chunk.text;
              finalChunk = chunk;
              
              setMessages(prev => prev.map((msg, index) => 
                  index === streamingMessageIndex ? { ...msg, parts: [{ text: modelResponseText }] } : msg
              ));
          }
          
          if (finalChunk) {
              const groundingChunks = finalChunk.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
              const sources = groundingChunks
                  .filter((c: any) => c.web && c.web.uri)
                  .map((c: any) => ({ title: c.web.title || new URL(c.web.uri).hostname, uri: c.web.uri }))
                  .filter((source, index, self) => index === self.findIndex((s) => s.uri === source.uri));
              
              let finalMessages: ChatMessage[] = [];
              setMessages(prev => {
                  finalMessages = prev.map((msg, index) => {
                      if (index === streamingMessageIndex) {
                          return { ...msg, sources: sources.length > 0 ? sources : undefined };
                      }
                      return msg;
                  });
                  return finalMessages;
              });
              
              // Perform side effects with the guaranteed final state.
              onSaveHistory(appliance.id, finalMessages);
              if (streamingMessageIndex > -1) {
                  generateSuggestions(messageText, modelResponseText, streamingMessageIndex);
              }
          }
  
      } catch (error) {
          console.error("Error sending message:", error);
          const finalMessages = [...messages, userMessage, { role: 'model', parts: [{ text: "Sorry, I encountered an error. Please try again." }] }];
          setMessages(finalMessages);
          onSaveHistory(appliance.id, finalMessages);
      } finally {
          setIsSending(false);
      }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (input.length > MAX_CHAR_LIMIT) return;
      sendMessage(input);
  };
  
  const handleSuggestionClick = (suggestionText: string, messageIndex: number) => {
      if (isSending) return;
      
      // Remove suggestions from the UI immediately for better UX
      setMessages(prev => prev.map((msg, index) => {
          if (index === messageIndex) {
              const { suggestions, ...rest } = msg;
              return rest;
          }
          return msg;
      }));

      sendMessage(suggestionText);
  };

  const handleClose = () => {
      const originalHistory = Array.isArray(appliance.chatHistory) ? appliance.chatHistory : [];
      if (JSON.stringify(messages) !== JSON.stringify(originalHistory)) {
          onSaveHistory(appliance.id, messages);
      }
      onClose();
  };

  const handleClearInput = () => {
      setInput('');
      inputRef.current?.focus();
  };

  const handleCopy = (textToCopy: string, index: number) => {
      if (!textToCopy) return;
      navigator.clipboard.writeText(textToCopy).then(() => {
          setCopiedMessageIndex(index);
          setTimeout(() => {
              setCopiedMessageIndex(null);
          }, 2000);
      }).catch(err => {
          console.error('Failed to copy text: ', err);
      });
  };

  return (
      <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center"
          onClick={handleClose}
      >
          <div 
              className="bg-slate-800 rounded-t-lg shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col transform transition-all animate-slide-up border-t border-slate-700"
              onClick={(e) => e.stopPropagation()}
          >
              <div className="p-4 border-b border-slate-700 flex items-center justify-between flex-shrink-0">
                  {/* Header */}
                  <div className="flex items-center">
                      <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-indigo-900/50">
                          <MessageSquareIcon className="h-6 w-6 text-indigo-400" />
                      </div>
                      <div className="ml-4">
                          <h3 className="text-lg leading-6 font-medium text-white">AI Assistant</h3>
                          <p className="text-sm text-slate-400">{make} {model}</p>
                      </div>
                  </div>
                  <button onClick={handleClose} className="text-slate-500 hover:text-slate-300">
                      <XIcon className="h-6 w-6" /><span className="sr-only">Close</span>
                  </button>
              </div>
              
              <div className="flex-grow p-4 overflow-y-auto">
                  <div className="space-y-4">
                      {messages.map((msg, index) => (
                          <div key={index} className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-fade-in`}>
                              <div className={`flex items-start gap-3 w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                  {msg.role === 'model' && (
                                      <div className="relative h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                                          <BotIcon className="h-5 w-5 text-indigo-300"/>
                                          <div className="absolute inset-0 rounded-full animate-pulse-glow" style={{'--glow-color': 'rgba(129, 140, 248, 0.5)', '--glow-spread': '2px'} as React.CSSProperties}></div>
                                      </div>
                                  )}
                                  <div className={`relative group px-4 py-2 rounded-lg max-w-lg ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
                                      <MarkdownRenderer content={msg.parts[0].text} />
                                      {msg.role === 'model' && msg.sources && msg.sources.length > 0 && (
                                          <div className="mt-4 pt-3 border-t border-slate-600/50">
                                              <h4 className="text-xs font-semibold text-slate-400 mb-2 flex items-center">
                                                  <LinkIcon className="h-4 w-4 mr-2"/><span>Sources Consulted by AI</span>
                                              </h4>
                                              <ul className="space-y-1">
                                                  {msg.sources.map((source, sourceIdx) => (
                                                      <li key={sourceIdx}>
                                                          <a href={source.uri} target="_blank" rel="noopener noreferrer" className="flex items-start text-xs text-indigo-400 hover:text-indigo-300 group">
                                                              <span className="font-mono mr-2 text-slate-500">{sourceIdx + 1}.</span>
                                                              <span className="truncate group-hover:underline" title={source.title}>{source.title}</span>
                                                          </a>
                                                      </li>
                                                  ))}
                                              </ul>
                                          </div>
                                      )}
                                      {msg.role === 'model' && msg.parts[0].text && (
                                          <button
                                              onClick={() => handleCopy(msg.parts[0].text, index)}
                                              className="absolute top-2 right-2 p-1.5 bg-slate-800/60 rounded-md text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-700 hover:text-white"
                                              aria-label="Copy message"
                                              title="Copy message"
                                          >
                                              {copiedMessageIndex === index ? (
                                                  <CheckIcon className="h-4 w-4 text-green-400" />
                                              ) : (
                                                  <CopyIcon className="h-4 w-4" />
                                              )}
                                          </button>
                                      )}
                                  </div>
                              </div>

                              {msg.role === 'model' && msg.suggestions && msg.suggestions.length > 0 && (
                                  <div className="flex flex-wrap gap-2 ml-11">
                                      {msg.suggestions.map((suggestion, sIdx) => (
                                          <button
                                              key={sIdx}
                                              onClick={() => handleSuggestionClick(suggestion, index)}
                                              className="px-3 py-1 bg-slate-700 text-slate-200 text-sm rounded-full hover:bg-slate-600 transition-colors"
                                          >
                                              {suggestion}
                                          </button>
                                      ))}
                                  </div>
                              )}
                              {isSuggestingFor === index && (
                                  <div className="flex items-center gap-2 ml-11 text-sm text-slate-400">
                                      <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse" style={{animationDelay: '0s'}}></div>
                                      <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                                      <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                                  </div>
                              )}
                          </div>
                      ))}
                      {isSending && (
                           <div className="flex items-start gap-3 justify-start">
                               <div className="relative h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                                   <BotIcon className="h-5 w-5 text-indigo-300"/>
                               </div>
                               <div className="px-4 py-3 bg-slate-700 rounded-lg rounded-bl-none">
                                   <div className="flex items-center gap-2 text-sm text-slate-400">
                                       <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse" style={{animationDelay: '0s'}}></div>
                                       <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                                       <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                                   </div>
                               </div>
                           </div>
                      )}
                      <div ref={messagesEndRef} />
                  </div>
              </div>
              
              <div className="p-4 border-t border-slate-700 flex-shrink-0">
                  <form onSubmit={handleFormSubmit} className="relative">
                      <input
                          ref={inputRef}
                          type="text"
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          placeholder="Ask a follow-up question..."
                          className={`block w-full rounded-md border-slate-600 bg-slate-900 py-3 pl-4 pr-24 text-sm placeholder-slate-400 focus:border-indigo-500 focus:ring-indigo-500 ${input.length > MAX_CHAR_LIMIT ? 'border-red-500 ring-red-500' : ''}`}
                          disabled={isSending}
                      />
                       <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                           {input && (
                              <button type="button" onClick={handleClearInput} className="p-1 text-slate-400 hover:text-slate-200 mr-2">
                                  <XIcon className="h-4 w-4" />
                              </button>
                           )}
                          <span className={`text-xs mr-2 ${input.length > MAX_CHAR_LIMIT ? 'text-red-400' : 'text-slate-500'}`}>
                              {input.length}/{MAX_CHAR_LIMIT}
                          </span>
                          <button type="submit" disabled={!input.trim() || isSending || input.length > MAX_CHAR_LIMIT} className="p-2 bg-indigo-600 text-white rounded-full disabled:bg-slate-600 disabled:opacity-50 transition-colors">
                              <SendIcon className="h-5 w-5" />
                          </button>
                       </div>
                  </form>
              </div>
          </div>
      </div>
  );
};
