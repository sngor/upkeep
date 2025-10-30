export interface ApplianceDetails {
    make: string;
    model: string;
    type: string;
    serialNumber?: string;
    dueDate?: string;
}

export interface CareTask {
    task: string;
    description: string;
    frequency: string;
    instructions?: string[];
    youtubeLink?: string;
    reminder?: string;
    lastCompleted?: string;
    sources?: { title: string; uri: string }[];
}

export interface LocalService {
    name: string;
    address: string;
    phone?: string;
    website?: string;
    recommendation?: string;
}

export interface SavedService extends LocalService {
    savedAt: string;
}

export interface GeminiResponse {
    applianceDetails: ApplianceDetails;
    careSchedule: CareTask[];
    localServices: LocalService[];
}

export interface ChatMessage {
    role: 'user' | 'model';
    parts: { text: string }[];
    sources?: { title: string; uri: string }[];
    suggestions?: string[];
}

export interface ExtractedDocInfo {
    store?: string;
    purchaseDate?: string;
    totalPrice?: string;
    warrantyEndDate?: string;
}

export interface WarrantyInfo extends ExtractedDocInfo {
    scannedAt: string;
}

export interface Document {
    id: string;
    name: string;
    fileUrl: string;
    fileType: string;
    uploadedAt: string;
    scanStatus: 'scanning' | 'complete' | 'error';
    warrantyInfo?: WarrantyInfo;
}

export interface ResearchReport {
    id: string;
    topic: string;
    status: 'pending' | 'complete' | 'error';
    content?: string;
    sources?: { title: string; uri: string }[];
    createdAt: string;
    error?: string;
}

export interface SavedAppliance {
    id: string;
    imageUrl: string;
    response: GeminiResponse;
    modelVersion?: string;
    chatHistory?: ChatMessage[];
    documents?: Document[];
    researchReports?: ResearchReport[];
}

export interface GeneralTask {
    id: string;
    task: string;
}

export interface KnowledgeBaseItem {
    id: string;
    question: string;
    answer: string;
    sources: { title: string; uri: string }[];
}