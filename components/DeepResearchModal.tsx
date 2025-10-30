import React, { useState } from 'react';
import { generateDeepResearchReport } from '../services/geminiService';
import { FlaskConicalIcon, XIcon, LinkIcon, SparklesIcon, Trash2Icon, ChevronDownIcon, ChevronUpIcon } from './Icons';
import { LoadingSpinner } from './LoadingSpinner';
import { SavedAppliance, ResearchReport } from '../types';
import { MarkdownRenderer } from './Card';

interface DeepResearchModalProps {
    onClose: () => void;
    appliance: SavedAppliance;
    onStartResearch: (topic: string) => void;
    onDeleteReport: (reportId: string) => void;
}

const ResearchReportItem: React.FC<{ report: ResearchReport; onDelete: () => void }> = ({ report, onDelete }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    const renderContent = () => {
        switch(report.status) {
            case 'pending':
                return (
                     <div className="text-center py-4">
                        <LoadingSpinner />
                        <p className="mt-4 text-slate-300 text-sm">AI is conducting deep research...</p>
                    </div>
                );
            case 'complete':
                return (
                    <div className="space-y-4">
                        {report.content && <MarkdownRenderer content={report.content} />}
                        {report.sources && report.sources.length > 0 && (
                            <div className="pt-3 border-t border-slate-700/50">
                                <h4 className="text-xs font-semibold text-slate-400 mb-2">Sources:</h4>
                                <ul className="space-y-1">
                                    {report.sources.map((source, idx) => (
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
                );
            case 'error':
                 return <p className="text-center text-red-400 bg-red-900/20 p-4 rounded-md">{report.error || 'An unknown error occurred during research.'}</p>
        }
    };

    return (
        <div className="bg-slate-700/50 rounded-lg border border-slate-600">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex justify-between items-center p-3 text-left"
            >
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{report.topic}</p>
                    <p className="text-xs text-slate-400">{new Date(report.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex items-center space-x-2">
                     <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 text-slate-400 hover:text-red-400"><Trash2Icon className="h-4 w-4" /></button>
                     {isExpanded ? <ChevronUpIcon className="h-5 w-5 text-slate-400" /> : <ChevronDownIcon className="h-5 w-5 text-slate-400" />}
                </div>
            </button>
            {isExpanded && (
                <div className="p-4 border-t border-slate-600 animate-fade-in">
                    {renderContent()}
                </div>
            )}
        </div>
    );
};


export const DeepResearchModal: React.FC<DeepResearchModalProps> = ({ onClose, appliance, onStartResearch, onDeleteReport }) => {
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleClearAll = () => {
    const reports = Array.isArray(appliance.researchReports) ? appliance.researchReports : [];
    reports.forEach(r => onDeleteReport(r.id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setIsLoading(true); // Visually disable form while optimistic update happens
    onStartResearch(topic);
    setTopic('');
    setIsLoading(false);
  };
  
  const reports = Array.isArray(appliance.researchReports) ? appliance.researchReports : [];

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
                <FlaskConicalIcon className="h-6 w-6 text-indigo-400" />
             </div>
             <div className="ml-4">
                <h3 className="text-lg font-medium text-white">AI Deep Research</h3>
                <p className="text-sm text-slate-400">{appliance.response.applianceDetails.make} {appliance.response.applianceDetails.model}</p>
             </div>
           </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300"><XIcon className="h-6 w-6" /></button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="research-topic" className="block text-sm font-medium text-slate-300">
                       What do you want to research?
                    </label>
                    <input
                        type="text"
                        id="research-topic"
                        value={topic}
                        onChange={e => setTopic(e.target.value)}
                        placeholder="e.g., Troubleshoot humming noise"
                        className="mt-1 w-full bg-slate-900 border-slate-600 rounded-md"
                        required
                    />
                </div>
                 <button type="submit" disabled={isLoading} className="w-full inline-flex justify-center items-center px-4 py-2 text-sm font-medium rounded-md shadow-lg text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50">
                    <SparklesIcon className="h-4 w-4 mr-2" />
                    {isLoading ? 'Requesting...' : 'Start New Research'}
                </button>
            </form>
            
            <div className="border-t border-slate-700 pt-6 space-y-4">
                 {reports.length > 0 && (
                    <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-slate-200">Research History</h4>
                        <button onClick={handleClearAll} className="text-sm text-slate-400 hover:text-red-400">Clear All</button>
                    </div>
                 )}

                 {reports.map(report => <ResearchReportItem key={report.id} report={report} onDelete={() => onDeleteReport(report.id)} />)}
                 
                 {reports.length === 0 && (
                    <p className="text-center text-slate-400 py-8">Your research reports will appear here.</p>
                 )}
            </div>
        </div>
      </div>
    </div>
  );
};