

import React, { useRef, useState, useEffect } from 'react';
import { type Document, type GeneralTask } from '../types';
import { Card } from './Card';
import { FileTextIcon, UploadCloudIcon, EyeIcon, Trash2Icon, CheckCircleIcon } from './Icons';

interface DocumentsTabProps {
  documents: Document[];
  onSaveDocument: (doc: Omit<Document, 'id'>, file: File) => void;
  onDeleteDocument: (docId: string) => void;
  onSaveGeneralTask: (task: Omit<GeneralTask, 'id'>) => void;
  isNew: boolean;
}

const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const getWarrantyStatus = (endDateString?: string) => {
    if (!endDateString) return { status: 'none', text: 'No Warranty Found', color: '' };
    const endDate = new Date(endDateString);
    const now = new Date();
    endDate.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);
    thirtyDaysFromNow.setHours(0, 0, 0, 0);

    const diffTime = endDate.getTime() - now.getTime();
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (endDate < now) {
        return { status: 'expired', text: 'Expired', color: 'bg-red-500/10 text-red-400 border-red-500/20' };
    }
    if (endDate <= thirtyDaysFromNow) {
        return { status: 'expiring', text: `${daysLeft}d left`, color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
    }
    return { status: 'active', text: 'Active', color: 'bg-green-500/10 text-green-400 border-green-500/20' };
};

const WarrantyStatusDisplay: React.FC<{ doc: Document }> = ({ doc }) => {
    const { scanStatus, warrantyInfo } = doc;

    if (scanStatus === 'scanning') {
        return <span className="text-xs text-slate-400 italic">Scanning...</span>;
    }
    
    if (scanStatus === 'error') {
        return <span className="text-xs text-red-400 italic">Scan failed</span>;
    }

    if (!warrantyInfo?.warrantyEndDate && !warrantyInfo?.purchaseDate) {
        return null;
    }

    const status = getWarrantyStatus(warrantyInfo.warrantyEndDate);
    const details = `Store: ${warrantyInfo.store || 'N/A'}\nPurchase: ${warrantyInfo.purchaseDate ? new Date(warrantyInfo.purchaseDate).toLocaleDateString(undefined, { timeZone: 'UTC' }) : 'N/A'}\nExpires: ${warrantyInfo.warrantyEndDate ? new Date(warrantyInfo.warrantyEndDate).toLocaleDateString(undefined, { timeZone: 'UTC' }) : 'N/A'}`;

    return (
        <div className="group relative">
            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${status.color}`}>
                {status.text}
            </span>
            <div className="absolute bottom-full mb-2 right-0 w-48 bg-slate-900 text-white text-xs rounded-md p-2 border border-slate-600 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-pre-wrap text-center z-10">
                {details}
            </div>
        </div>
    );
};


export const DocumentsTab: React.FC<DocumentsTabProps> = ({ documents, onSaveDocument, onDeleteDocument, onSaveGeneralTask, isNew }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const confirmationTimerRef = useRef<number | null>(null);

  useEffect(() => {
    // Cleanup timer on unmount
    return () => {
      if (confirmationTimerRef.current) {
        clearTimeout(confirmationTimerRef.current);
      }
    };
  }, []);


  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
        const fileUrl = await fileToDataUrl(file);
        // Ensure new documents have a scanStatus to satisfy the Document type.
        const newDoc: Omit<Document, 'id'> = {
            name: file.name,
            fileUrl,
            fileType: file.type,
            uploadedAt: new Date().toISOString(),
            scanStatus: 'scanning', // Initialize status for background processing
        };
        onSaveDocument(newDoc, file);
        
        // Clear any existing timer
        if (confirmationTimerRef.current) {
            clearTimeout(confirmationTimerRef.current);
        }

        setConfirmationMessage(`"${file.name}" uploaded successfully.`);
        setShowConfirmation(true);
        confirmationTimerRef.current = window.setTimeout(() => {
            setShowConfirmation(false);
        }, 3000);

    } catch (error) {
        console.error("Error reading file:", error);
    }

    // Reset input value to allow re-uploading the same file
    event.target.value = '';
  };

  return (
    <>
        <Card title="Digital Vault">
            <div className="space-y-4">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="image/*,application/pdf"
                    disabled={isNew}
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isNew}
                    className="w-full flex justify-center items-center px-6 py-4 border-2 border-dashed border-slate-600 rounded-lg text-slate-400 hover:text-indigo-400 hover:border-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <UploadCloudIcon className="h-6 w-6 mr-2" />
                    <span>{isNew ? 'Save appliance to upload documents' : 'Upload a document (manual, receipt, etc.)'}</span>
                </button>
                
                 {showConfirmation && (
                    <div className="bg-green-800/30 text-green-300 border border-green-600/40 text-sm rounded-md p-3 flex items-start animate-fade-in" role="alert">
                         <CheckCircleIcon className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
                         <div>
                            <p className="font-semibold">{confirmationMessage}</p>
                            <p className="text-xs text-green-400">An AI scan for warranty details will begin in the background if applicable.</p>
                         </div>
                    </div>
                )}

                {documents.length > 0 ? (
                    <ul className="divide-y divide-slate-700/50">
                        {documents.map(doc => (
                            <li key={doc.id} className="py-3 flex items-center justify-between">
                                <div className="flex items-center min-w-0">
                                    <FileTextIcon className="h-8 w-8 text-slate-500 flex-shrink-0" />
                                    <div className="ml-3 min-w-0">
                                        <p className="text-sm font-medium text-white truncate">{doc.name}</p>
                                        <p className="text-xs text-slate-400">{new Date(doc.uploadedAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                                    <WarrantyStatusDisplay doc={doc} />
                                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-slate-400 hover:text-indigo-400" title="View Document"><EyeIcon className="h-5 w-5"/></a>
                                    <button onClick={() => onDeleteDocument(doc.id)} className="p-2 text-slate-400 hover:text-red-400" title="Delete Document"><Trash2Icon className="h-5 w-5"/></button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-slate-400 py-8">No documents uploaded yet.</p>
                )}
            </div>
        </Card>
    </>
  );
};