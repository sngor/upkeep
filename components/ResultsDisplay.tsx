import React, { useState } from 'react';
import { type SavedAppliance, LocalService, SavedService, Document, GeneralTask } from '../types';
import { ApplianceInfo } from './ApplianceInfo';
import { CareSchedule } from './CareSchedule';
import { LocalServices } from './LocalServices';
import { DocumentsTab } from './DocumentsTab';
import { InfoIcon, CalendarIcon, MapPinIcon, SparklesIcon, BookmarkIcon, FileTextIcon, Trash2Icon, KnowledgeBaseIcon, DollarSignIcon, FlaskConicalIcon } from './Icons';

interface ResultsDisplayProps {
  appliance: SavedAppliance;
  isNew: boolean;
  onSave: () => void;
  onDiscard: () => void;
  savedServices: SavedService[];
  onSetReminder: (taskIndex: number, reminder: string | null) => void;
  onMarkTaskComplete: (taskIndex: number) => void;
  onSetDueDate: (dueDate: string | null) => void;
  onOpenChat: () => void;
  onOpenKnowledgeBase: () => void;
  onOpenResearchModal: () => void;
  onOpenCostEstimator: () => void;
  onToggleSaveService: (service: LocalService) => void;
  onSaveDocument: (doc: Omit<Document, 'id'>, file: File) => void;
  onDeleteDocument: (docId: string) => void;
  onSaveGeneralTask: (task: Omit<GeneralTask, 'id'> & { id?: string }) => void;
}

type Tab = 'info' | 'schedule' | 'services' | 'documents';

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ appliance, isNew, onSave, onDiscard, savedServices, onSetReminder, onMarkTaskComplete, onSetDueDate, onOpenChat, onOpenKnowledgeBase, onOpenResearchModal, onOpenCostEstimator, onToggleSaveService, onSaveDocument, onDeleteDocument, onSaveGeneralTask }) => {
  const [activeTab, setActiveTab] = useState<Tab>('info');
  const { response, imageUrl, modelVersion, id, documents } = appliance;

  const tabs = [
    { id: 'info' as Tab, label: 'Appliance Info', icon: <InfoIcon className="h-5 w-5 mr-2" /> },
    { id: 'schedule' as Tab, label: 'Care Schedule', icon: <CalendarIcon className="h-5 w-5 mr-2" /> },
    { id: 'services' as Tab, label: 'Local Services', icon: <MapPinIcon className="h-5 w-5 mr-2" /> },
    { id: 'documents' as Tab, label: 'Documents', icon: <FileTextIcon className="h-5 w-5 mr-2" /> },
  ];

  const renderTabContent = () => {
    // Defensive coding: Ensure properties are arrays before passing them to children.
    const careSchedule = Array.isArray(response.careSchedule) ? response.careSchedule : [];
    const localServices = Array.isArray(response.localServices) ? response.localServices : [];
    const docs = Array.isArray(documents) ? documents : [];

    switch (activeTab) {
      case 'info':
        return <ApplianceInfo details={response.applianceDetails} onSetDueDate={onSetDueDate} modelVersion={modelVersion} isNew={isNew} />;
      case 'schedule':
        return <CareSchedule schedule={careSchedule} onSetReminder={onSetReminder} onMarkTaskComplete={onMarkTaskComplete} isNew={isNew} />;
      case 'services':
        return <LocalServices services={localServices} savedServices={savedServices} onToggleSaveService={onToggleSaveService} isNew={isNew} />;
      case 'documents':
        return <DocumentsTab documents={docs} onSaveDocument={onSaveDocument} onDeleteDocument={onDeleteDocument} onSaveGeneralTask={onSaveGeneralTask} isNew={isNew} />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-800/50 rounded-xl shadow-2xl border border-slate-700 overflow-hidden">
        <div className="p-6 md:flex md:items-center md:space-x-6 bg-slate-800/30">
            <img 
                src={imageUrl} 
                alt="Appliance" 
                className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-lg shadow-lg flex-shrink-0 mx-auto md:mx-0 border-2 border-slate-600"
            />
            <div className="text-center md:text-left mt-4 md:mt-0 flex-grow">
                <p className="text-lg text-slate-300">{response.applianceDetails.type}</p>
                <h2 className="text-3xl font-bold text-white">{response.applianceDetails.make} {response.applianceDetails.model}</h2>
                 {isNew ? (
                    <div className="mt-4 space-y-2 sm:space-y-0 sm:flex sm:items-center sm:justify-center md:justify-start sm:space-x-4">
                       <button
                           onClick={onSave}
                           className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-lg text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-900 transition-all transform hover:scale-105"
                       >
                           <BookmarkIcon className="h-5 w-5 mr-2" />
                           Save Appliance
                       </button>
                       <button
                           onClick={onDiscard}
                           className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-slate-300 hover:text-white"
                       >
                          <Trash2Icon className="h-4 w-4 mr-2" />
                           Discard
                       </button>
                    </div>
                ) : (
                    <div className="mt-4 flex flex-wrap gap-4 justify-center md:justify-start">
                        <button
                            onClick={() => onOpenChat()}
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-lg text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-900 transition-all transform hover:scale-105 animate-pulse-glow"
                        >
                            <SparklesIcon className="h-5 w-5 mr-2" />
                            Chat with AI
                        </button>
                        <button
                            onClick={() => onOpenResearchModal()}
                            className="inline-flex items-center px-4 py-2 border border-slate-600 text-sm font-medium rounded-md shadow-lg text-slate-200 bg-slate-700 hover:bg-slate-600"
                        >
                            <FlaskConicalIcon className="h-5 w-5 mr-2" />
                            Deep Research
                        </button>
                        <button
                            onClick={() => onOpenKnowledgeBase()}
                            className="inline-flex items-center px-4 py-2 border border-slate-600 text-sm font-medium rounded-md shadow-lg text-slate-200 bg-slate-700 hover:bg-slate-600"
                        >
                            <KnowledgeBaseIcon className="h-5 w-5 mr-2" />
                            Search KB
                        </button>
                         <button
                            onClick={() => onOpenCostEstimator()}
                            className="inline-flex items-center px-4 py-2 border border-slate-600 text-sm font-medium rounded-md shadow-lg text-slate-200 bg-slate-700 hover:bg-slate-600"
                        >
                            <DollarSignIcon className="h-5 w-5 mr-2" />
                            Estimate Cost
                        </button>
                    </div>
                )}
            </div>
        </div>
        
        <div className="border-b border-t border-slate-700">
            <nav className="-mb-px flex space-x-1 sm:space-x-4 px-4 overflow-x-auto" aria-label="Tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`${
                            activeTab === tab.id
                                ? 'border-indigo-400 text-indigo-400'
                                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600'
                        } whitespace-nowrap py-4 px-1 sm:px-2 border-b-2 font-medium text-sm flex items-center transition-colors duration-200`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </nav>
        </div>
        
        <div className="p-6">
           <div key={activeTab} className="animate-fade-in">
              {renderTabContent()}
           </div>
        </div>
    </div>
  );
};