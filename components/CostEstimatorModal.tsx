
import React, { useState, useEffect } from 'react';
import { getCostEstimate, getSuggestedRepairs } from '../services/geminiService';
import { DollarSignIcon, XIcon, LinkIcon, SparklesIcon, Trash2Icon, ChevronDownIcon, ChevronUpIcon } from './Icons';
import { LoadingSpinner } from './LoadingSpinner';
import { MarkdownRenderer } from './Card';

interface CostEstimatorModalProps {
  onClose: () => void;
  applianceType?: string;
}

type Status = 'idle' | 'loading';

interface Estimation {
  id: string;
  job: string;
  location: string;
  result: {
    text: string;
    sources: { title: string; uri: string }[];
  } | null;
  error: string | null;
}

const EstimationItem: React.FC<{ estimation: Estimation; onDelete: () => void }> = ({ estimation, onDelete }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <div className="bg-slate-700/50 rounded-lg border border-slate-600">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex justify-between items-center p-3 text-left"
            >
                <div className="flex-1">
                    <p className="font-semibold text-white truncate">{estimation.job}</p>
                    <p className="text-xs text-slate-400">in {estimation.location}</p>
                </div>
                <div className="flex items-center space-x-2">
                     <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 text-slate-400 hover:text-red-400"><Trash2Icon className="h-4 w-4" /></button>
                     {isExpanded ? <ChevronUpIcon className="h-5 w-5 text-slate-400" /> : <ChevronDownIcon className="h-5 w-5 text-slate-400" />}
                </div>
            </button>
            {isExpanded && (
                <div className="p-4 border-t border-slate-600 animate-fade-in">
                    {estimation.result && (
                        <div className="space-y-4">
                            <MarkdownRenderer content={estimation.result.text} />
                            {estimation.result.sources.length > 0 && (
                                <div className="pt-3 border-t border-slate-700/50">
                                    <h4 className="text-xs font-semibold text-slate-400 mb-2">Sources:</h4>
                                    <ul className="space-y-1">
                                        {estimation.result.sources.map((source, idx) => (
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
                    )}
                    {estimation.error && <p className="text-center text-red-400 bg-red-900/20 p-4 rounded-md">{estimation.error}</p>}
                </div>
            )}
        </div>
    );
};


export const CostEstimatorModal: React.FC<CostEstimatorModalProps> = ({ onClose, applianceType }) => {
  const [job, setJob] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [estimations, setEstimations] = useState<Estimation[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  useEffect(() => {
    if (applianceType) {
        const fetchSuggestions = async () => {
            setIsLoadingSuggestions(true);
            try {
                const result = await getSuggestedRepairs(applianceType);
                setSuggestions(result);
            } catch (error) {
                console.error("Failed to fetch repair suggestions:", error);
            } finally {
                setIsLoadingSuggestions(false);
            }
        };
        fetchSuggestions();
    }
  }, [applianceType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job || !location) return;
    setStatus('loading');
    
    const tempId = crypto.randomUUID();
    
    try {
      const result = await getCostEstimate(job, location);
      const newEstimation: Estimation = { id: tempId, job, location, result, error: null };
      setEstimations(prev => [newEstimation, ...prev]);
      setJob('');
      setLocation('');
    } catch (err) {
      const error = err instanceof Error ? err.message : 'An unknown error occurred.';
      const failedEstimation: Estimation = { id: tempId, job, location, result: null, error };
      setEstimations(prev => [failedEstimation, ...prev]);
    } finally {
      setStatus('idle');
    }
  };

  const handleDelete = (id: string) => {
    setEstimations(prev => prev.filter(e => e.id !== id));
  };
  
  const handleClearAll = () => {
    setEstimations([]);
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
                <DollarSignIcon className="h-6 w-6 text-indigo-400" />
             </div>
             <div className="ml-4"><h3 className="text-lg font-medium text-white">AI Cost Estimator</h3></div>
           </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300"><XIcon className="h-6 w-6" /></button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="job" className="block text-sm font-medium text-slate-300">Repair or Upgrade Job</label>
                    <input type="text" id="job" value={job} onChange={e => setJob(e.target.value)} placeholder="e.g., Replace a hot water heater" className="mt-1 w-full bg-slate-900 border-slate-600 rounded-md" required/>
                     {isLoadingSuggestions && <p className="text-xs text-slate-400 mt-2 animate-pulse">Loading smart suggestions...</p>}
                     {!isLoadingSuggestions && suggestions.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                            <span className="text-xs text-slate-400 pt-1">Suggestions:</span>
                            {suggestions.map(s => (
                                <button key={s} type="button" onClick={() => setJob(s)} className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded-full hover:bg-slate-600">
                                    {s}
                                </button>
                            ))}
                        </div>
                     )}
                </div>
                <div>
                    <label htmlFor="location" className="block text-sm font-medium text-slate-300">City or ZIP Code</label>
                    <input type="text" id="location" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g., 90210" className="mt-1 w-full bg-slate-900 border-slate-600 rounded-md" required/>
                </div>
                 <button type="submit" disabled={status === 'loading'} className="w-full inline-flex justify-center items-center px-4 py-2 text-sm font-medium rounded-md shadow-lg text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50">
                    <SparklesIcon className="h-4 w-4 mr-2" />
                    {status === 'loading' ? 'Estimating...' : 'Get AI Estimate'}
                </button>
            </form>
            
            <div className="border-t border-slate-700 pt-6 space-y-4">
                 {estimations.length > 0 && (
                    <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-slate-200">Session Estimates</h4>
                        <button onClick={handleClearAll} className="text-sm text-slate-400 hover:text-red-400">Clear All</button>
                    </div>
                 )}

                 {estimations.map(est => <EstimationItem key={est.id} estimation={est} onDelete={() => handleDelete(est.id)} />)}
                 
                 {status === 'loading' && (
                    <div className="text-center py-4">
                        <LoadingSpinner />
                        <p className="mt-4 text-slate-300">AI is crunching the numbers for "{job}"...</p>
                    </div>
                 )}

                 {estimations.length === 0 && status === 'idle' && (
                    <p className="text-center text-slate-400 py-8">Your cost estimates will appear here.</p>
                 )}
            </div>
        </div>
      </div>
    </div>
  );
};