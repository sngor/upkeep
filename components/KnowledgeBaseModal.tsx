
import React, { useState } from 'react';
import { getKnowledgeBaseAnswer } from '../services/geminiService';
import { KnowledgeBaseIcon, XIcon, LinkIcon, SparklesIcon, Trash2Icon, ChevronDownIcon, ChevronUpIcon, SearchIcon } from './Icons';
import { LoadingSpinner } from './LoadingSpinner';
import { ApplianceDetails, KnowledgeBaseItem } from '../types';
import { MarkdownRenderer } from './Card';

interface KnowledgeBaseModalProps {
    onClose: () => void;
    applianceContext?: ApplianceDetails;
    savedItems: KnowledgeBaseItem[];
    setSavedItems: (items: KnowledgeBaseItem[]) => void;
}

const FAQItem: React.FC<{ item: KnowledgeBaseItem; onDelete: () => void }> = ({ item, onDelete }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <div className="bg-slate-700/50 rounded-lg border border-slate-600">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex justify-between items-center p-3 text-left"
            >
                <p className="font-semibold text-white truncate flex-1">{item.question}</p>
                <div className="flex items-center space-x-2">
                     <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 text-slate-400 hover:text-red-400"><Trash2Icon className="h-4 w-4" /></button>
                     {isExpanded ? <ChevronUpIcon className="h-5 w-5 text-slate-400" /> : <ChevronDownIcon className="h-5 w-5 text-slate-400" />}
                </div>
            </button>
            {isExpanded && (
                <div className="p-4 border-t border-slate-600 animate-fade-in">
                    <div className="space-y-4">
                        <MarkdownRenderer content={item.answer} />
                        {item.sources.length > 0 && (
                            <div className="pt-3 border-t border-slate-700/50">
                                <h4 className="text-xs font-semibold text-slate-400 mb-2">Sources:</h4>
                                <ul className="space-y-1">
                                    {item.sources.map((source, idx) => (
                                        <li key={idx}>
                                            <a href={source.uri} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm text-indigo-400 hover:text-indigo-300">
                                                <LinkIcon className="h-3 w-3 mr-1.5" />
                                                <span className="truncate">{source.title}</span>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};


export const KnowledgeBaseModal: React.FC<KnowledgeBaseModalProps> = ({ onClose, applianceContext, savedItems, setSavedItems }) => {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await getKnowledgeBaseAnswer(question, applianceContext);
      const newItem: KnowledgeBaseItem = {
        id: crypto.randomUUID(),
        question,
        answer: result.text,
        sources: result.sources
      };
      setSavedItems([newItem, ...savedItems]);
      setQuestion('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    setSavedItems(savedItems.filter(item => item.id !== id));
  };
  
  const handleClearAll = () => {
    setSavedItems([]);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl transform transition-all max-h-[90vh] flex flex-col animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-700 flex items-center justify-between">
           <div className="flex items-center">
             <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-indigo-900/50">
                <KnowledgeBaseIcon className="h-6 w-6 text-indigo-400" />
             </div>
             <div className="ml-4">
                <h3 className="text-lg font-medium text-white">AI Knowledge Base</h3>
                 {applianceContext && <p className="text-sm text-slate-400">Context: {applianceContext.make} {applianceContext.model}</p>}
             </div>
           </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300"><XIcon className="h-6 w-6" /></button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="kb-question" className="block text-sm font-medium text-slate-300">
                        Ask a maintenance question
                    </label>
                    <div className="mt-1 relative">
                         <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <SearchIcon className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            id="kb-question"
                            value={question}
                            onChange={e => setQuestion(e.target.value)}
                            placeholder="e.g., How to fix a leaky faucet?"
                            className="block w-full rounded-md border-slate-600 bg-slate-900 py-2 pl-10 pr-4 text-sm placeholder-slate-400 focus:border-indigo-500 focus:ring-indigo-500"
                            required
                        />
                    </div>
                </div>
                 <button type="submit" disabled={isLoading} className="w-full inline-flex justify-center items-center px-4 py-2 text-sm font-medium rounded-md shadow-lg text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50">
                    <SparklesIcon className="h-4 w-4 mr-2" />
                    {isLoading ? 'Searching...' : 'Get AI Answer'}
                </button>
            </form>
            
            {error && <p className="text-center text-red-400 bg-red-900/20 p-4 rounded-md">{error}</p>}

            <div className="border-t border-slate-700 pt-6 space-y-4">
                 {savedItems.length > 0 && (
                    <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-slate-200">History</h4>
                        <button onClick={handleClearAll} className="text-sm text-slate-400 hover:text-red-400">Clear All</button>
                    </div>
                 )}

                 {isLoading && (
                    <div className="text-center py-4">
                        <LoadingSpinner />
                        <p className="mt-4 text-slate-300">AI is searching for an answer...</p>
                    </div>
                 )}

                 {savedItems.map(item => <FAQItem key={item.id} item={item} onDelete={() => handleDelete(item.id)} />)}
                 
                 {savedItems.length === 0 && !isLoading && (
                    <p className="text-center text-slate-400 py-8">Your answered questions will appear here.</p>
                 )}
            </div>
        </div>
      </div>
    </div>
  );
};