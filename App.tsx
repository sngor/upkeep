import React from 'react';
import { Header } from './components/Header';
import { ImageUpload } from './components/ImageUpload';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ConfirmationView } from './components/ConfirmationView';
import { ResultsDisplay } from './components/ResultsDisplay';
import { SavedAppliancesList } from './components/SavedAppliancesList';
import { Dashboard } from './components/Dashboard';
import { ChatModal } from './components/ChatModal';
import { UserGuideModal } from './components/UserGuideModal';
import { CostEstimatorModal } from './components/CostEstimatorModal';
import { KnowledgeBaseModal } from './components/KnowledgeBaseModal';
import { DeepResearchModal } from './components/DeepResearchModal';
import { UndoToast } from './components/UndoToast';
import { WarrantyAlerts } from './components/WarrantyAlerts';
import { ProTip } from './components/ProTip';
import { LoginScreen } from './components/LoginScreen';
import { analyzeImageForApplianceDetails, generateApplianceInfo, extractDetailsFromDocument, generateDeepResearchReport } from './services/geminiService';
import { ApplianceDetails, SavedAppliance, LocalService, SavedService, ChatMessage, Document, GeneralTask, KnowledgeBaseItem, CareTask, ResearchReport } from './types';

type AppState = 'idle' | 'analyzing' | 'confirming' | 'fetching' | 'results';


// Custom hook for localStorage with robust type validation
const useLocalStorage = <T,>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] => {
    const [storedValue, setStoredValue] = React.useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            if (!item) return initialValue;

            const parsed = JSON.parse(item);
            
            // Validate against the initial value's type to prevent crashes from corrupted data
            if (Array.isArray(initialValue) && !Array.isArray(parsed)) {
                console.warn(`LocalStorage type mismatch for key "${key}". Expected array, got non-array. Resetting to default.`);
                return initialValue;
            }
            if (typeof initialValue === 'object' && initialValue !== null && typeof parsed !== 'object') {
                 console.warn(`LocalStorage type mismatch for key "${key}". Expected object, got ${typeof parsed}. Resetting to default.`);
                 return initialValue;
            }
             if (typeof initialValue !== typeof parsed && !Array.isArray(initialValue) && initialValue !== null) {
                 console.warn(`LocalStorage type mismatch for key "${key}". Expected ${typeof initialValue}, got ${typeof parsed}. Resetting to default.`);
                 return initialValue;
             }

            return parsed;
        } catch (error) {
            console.error(`Error parsing localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    const setValue = (value: T | ((val: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error)
        {
            console.error(error);
        }
    };
    return [storedValue, setValue];
};


const App: React.FC = () => {
    const [appState, setAppState] = React.useState<AppState>('idle');
    const [error, setError] = React.useState<string | null>(null);
    const [currentAppliance, setCurrentAppliance] = React.useState<SavedAppliance | null>(null);
    const [savedAppliances, setSavedAppliances] = useLocalStorage<SavedAppliance[]>('savedAppliances', []);
    const [savedServices, setSavedServices] = useLocalStorage<SavedService[]>('savedServices', []);
    const [knowledgeBase, setKnowledgeBase] = useLocalStorage<KnowledgeBaseItem[]>('knowledgeBase', []);
    
    const [isGuideOpen, setIsGuideOpen] = React.useState(false);
    const [isChatOpen, setIsChatOpen] = React.useState(false);
    const [costEstimatorContext, setCostEstimatorContext] = React.useState<string | boolean | null>(null);
    const [isKnowledgeBaseOpen, setIsKnowledgeBaseOpen] = React.useState(false);
    const [isResearchModalOpen, setIsResearchModalOpen] = React.useState(false);
    const [isOffline, setIsOffline] = React.useState(!navigator.onLine);

    const [undoState, setUndoState] = React.useState<{ appliance: SavedAppliance; index: number } | null>(null);
    
    const [isLoggedIn, setIsLoggedIn] = useLocalStorage('isLoggedIn', false);

    React.useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const handleLogin = () => setIsLoggedIn(true);
    const handleLogout = () => setIsLoggedIn(false);

    const handleImageUpload = async (file: File) => {
        setAppState('analyzing');
        setError(null);
        try {
            const imageUrl = URL.createObjectURL(file);
            const details = await analyzeImageForApplianceDetails(file);
            setCurrentAppliance({
                id: `temp-${Date.now()}`,
                response: { applianceDetails: details, careSchedule: [], localServices: [] },
                imageUrl,
            });
            setAppState('confirming');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred during analysis.');
            setAppState('idle');
        }
    };

    const handleConfirmation = async (details: ApplianceDetails) => {
        if (!currentAppliance) return;
        setAppState('fetching');

        const getLocation = (): Promise<{ latitude: number; longitude: number } | undefined> =>
            new Promise((resolve) => {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        (position) => resolve({
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                        }),
                        () => resolve(undefined) // On error or denial, resolve with undefined
                    );
                } else {
                    resolve(undefined); // Geolocation not supported
                }
            });

        try {
            const location = await getLocation();
            const { response, modelVersion } = await generateApplianceInfo(details, location);
            setCurrentAppliance({ ...currentAppliance, response, id: crypto.randomUUID(), modelVersion: modelVersion });
            setAppState('results');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred while fetching details.');
            setAppState('idle');
            setCurrentAppliance(null);
        }
    };

    const handleSave = () => {
        if (!currentAppliance) return;
        setSavedAppliances([currentAppliance, ...savedAppliances]);
        setCurrentAppliance(null);
        setAppState('idle');
    };
    
    const handleDiscard = () => {
        if (currentAppliance?.imageUrl) {
            URL.revokeObjectURL(currentAppliance.imageUrl);
        }
        setCurrentAppliance(null);
        setAppState('idle');
    };

    const handleSelectAppliance = (id: string) => {
        const appliance = savedAppliances.find(a => a.id === id);
        if (appliance) {
            setCurrentAppliance(appliance);
            setAppState('results');
        }
    };

    const handleDeleteAppliance = (id: string) => {
        const index = savedAppliances.findIndex(a => a.id === id);
        if (index > -1) {
            const applianceToUndo = savedAppliances[index];
            setUndoState({ appliance: applianceToUndo, index });
            setSavedAppliances(savedAppliances.filter(a => a.id !== id));
        }
    };

    const handleUndoDelete = () => {
        if (undoState) {
            const newAppliances = [...savedAppliances];
            newAppliances.splice(undoState.index, 0, undoState.appliance);
            setSavedAppliances(newAppliances);
            setUndoState(null);
        }
    };
    
    const updateSavedAppliance = (id: string, updater: (appliance: SavedAppliance) => Partial<SavedAppliance>) => {
        setSavedAppliances(prevAppliances =>
            prevAppliances.map(app => {
                if (app.id === id) {
                    const updates = updater(app);
                    return { ...app, ...updates };
                }
                return app;
            })
        );
        if (currentAppliance?.id === id) {
            setCurrentAppliance(prev => {
                if (!prev) return null;
                const updates = updater(prev);
                return { ...prev, ...updates };
            });
        }
    };

    const handleSetReminder = (taskIndex: number, reminder: string | null) => {
        if (!currentAppliance) return;
        updateSavedAppliance(currentAppliance.id, (app) => {
            const careSchedule = Array.isArray(app.response.careSchedule) ? app.response.careSchedule : [];
            const newCareSchedule = [...careSchedule];
            if(newCareSchedule[taskIndex]) {
                newCareSchedule[taskIndex] = { ...newCareSchedule[taskIndex], reminder: reminder ?? undefined };
            }
            return { response: { ...app.response, careSchedule: newCareSchedule } };
        });
    };
    
    const handleMarkTaskComplete = (taskIndex: number) => {
        if (!currentAppliance) return;
        updateSavedAppliance(currentAppliance.id, (app) => {
            const careSchedule = Array.isArray(app.response.careSchedule) ? app.response.careSchedule : [];
            const newCareSchedule = [...careSchedule];
            if(newCareSchedule[taskIndex]) {
                newCareSchedule[taskIndex] = { ...newCareSchedule[taskIndex], lastCompleted: new Date().toISOString() };
            }
            return { response: { ...app.response, careSchedule: newCareSchedule } };
        });
    };
    
    const handleSetDueDate = (dueDate: string | null) => {
        if (!currentAppliance) return;
        updateSavedAppliance(currentAppliance.id, (app) => {
            const newApplianceDetails = { ...app.response.applianceDetails, dueDate: dueDate ?? undefined };
            return { response: { ...app.response, applianceDetails: newApplianceDetails } };
        });
    };
    
    const handleToggleSaveService = (service: LocalService) => {
        const key = `${service.name}|${service.address}`;
        const isSaved = savedServices.some(s => `${s.name}|${s.address}` === key);
        if (isSaved) {
            setSavedServices(savedServices.filter(s => `${s.name}|${s.address}` !== key));
        } else {
            setSavedServices([...savedServices, { ...service, savedAt: new Date().toISOString() }]);
        }
    };

    const handleSaveChatHistory = (id: string, history: ChatMessage[]) => {
        updateSavedAppliance(id, () => ({ chatHistory: history }));
    };

    const handleSaveDocument = async (docData: Omit<Document, 'id'>, file: File) => {
        if (!currentAppliance) return;
        const applianceId = currentAppliance.id;
        const newDoc: Document = { ...docData, id: crypto.randomUUID(), scanStatus: 'scanning' };
        
        // Optimistic UI update
        updateSavedAppliance(applianceId, (app) => ({ documents: [...(Array.isArray(app.documents) ? app.documents : []), newDoc] }));

        if (!file.type.startsWith('image/')) {
            const updatedDoc = { ...newDoc, scanStatus: 'complete' as const };
            updateSavedAppliance(applianceId, (app) => ({ documents: (Array.isArray(app.documents) ? app.documents : []).map(d => d.id === newDoc.id ? updatedDoc : d) }));
            return;
        }

        try {
            const extractedInfo = await extractDetailsFromDocument(file);
            const updatedDoc: Document = {
                ...newDoc,
                scanStatus: 'complete',
                warrantyInfo: (extractedInfo.warrantyEndDate || extractedInfo.purchaseDate)
                    ? { ...extractedInfo, scannedAt: new Date().toISOString() }
                    : undefined,
            };
            updateSavedAppliance(applianceId, (app) => ({
                documents: (Array.isArray(app.documents) ? app.documents : []).map(d => d.id === newDoc.id ? updatedDoc : d)
            }));
        } catch (error) {
            console.error(`Failed to automatically scan document ${newDoc.name}:`, error);
            const updatedDoc: Document = { ...newDoc, scanStatus: 'error' };
            updateSavedAppliance(applianceId, (app) => ({
                documents: (Array.isArray(app.documents) ? app.documents : []).map(d => d.id === newDoc.id ? updatedDoc : d)
            }));
        }
    };

    const handleDeleteDocument = (docId: string) => {
        if (!currentAppliance) return;
        updateSavedAppliance(currentAppliance.id, (app) => ({
             documents: (Array.isArray(app.documents) ? app.documents : []).filter(d => d.id !== docId)
        }));
    };

    const handleSaveGeneralTask = (task: Omit<GeneralTask, 'id'>) => {
        console.log("Saving general task:", task);
        alert(`Reminder set for "${task.task}"!`);
    };

    const handleStartResearch = async (topic: string) => {
        if (!currentAppliance) return;
        const applianceId = currentAppliance.id;
        const newReport: ResearchReport = {
            id: crypto.randomUUID(),
            topic,
            status: 'pending',
            createdAt: new Date().toISOString(),
        };

        // Optimistic UI update
        updateSavedAppliance(applianceId, (app) => ({ researchReports: [newReport, ...(Array.isArray(app.researchReports) ? app.researchReports : [])] }));

        try {
            const result = await generateDeepResearchReport(topic, currentAppliance.response.applianceDetails);
            const completedReport: ResearchReport = { ...newReport, status: 'complete', content: result.text, sources: result.sources };
            updateSavedAppliance(applianceId, (app) => ({
                researchReports: (Array.isArray(app.researchReports) ? app.researchReports : []).map(r => r.id === newReport.id ? completedReport : r)
            }));
        } catch (error) {
            console.error("Deep research failed:", error);
            const failedReport: ResearchReport = { ...newReport, status: 'error', error: error instanceof Error ? error.message : 'An unknown error occurred.' };
            updateSavedAppliance(applianceId, (app) => ({
                researchReports: (Array.isArray(app.researchReports) ? app.researchReports : []).map(r => r.id === newReport.id ? failedReport : r)
            }));
        }
    };

    const handleDeleteResearchReport = (reportId: string) => {
        if (!currentAppliance) return;
        updateSavedAppliance(currentAppliance.id, (app) => ({
            researchReports: (Array.isArray(app.researchReports) ? app.researchReports : []).filter(r => r.id !== reportId)
        }));
    };

    const renderContent = () => {
        if (appState === 'results' && currentAppliance) {
            const isNew = !savedAppliances.some(a => a.id === currentAppliance.id);
            return <ResultsDisplay
                appliance={currentAppliance}
                isNew={isNew}
                onSave={handleSave}
                onDiscard={handleDiscard}
                savedServices={savedServices}
                onSetReminder={handleSetReminder}
                onMarkTaskComplete={handleMarkTaskComplete}
                onSetDueDate={handleSetDueDate}
                onOpenChat={() => setIsChatOpen(true)}
                onOpenKnowledgeBase={() => setIsKnowledgeBaseOpen(true)}
                onOpenResearchModal={() => setIsResearchModalOpen(true)}
                onOpenCostEstimator={() => setCostEstimatorContext(currentAppliance.response.applianceDetails.type)}
                onToggleSaveService={handleToggleSaveService}
                onSaveDocument={handleSaveDocument}
                onDeleteDocument={handleDeleteDocument}
                onSaveGeneralTask={handleSaveGeneralTask}
            />;
        }

        switch (appState) {
            case 'idle':
                return <ImageUpload onImageUpload={handleImageUpload} />;
            case 'analyzing':
            case 'fetching':
                const message = appState === 'analyzing'
                    ? "AI is analyzing your appliance..."
                    : "AI is gathering maintenance info...";
                return (
                    <div className="text-center">
                        <LoadingSpinner />
                        <p className="mt-4 text-lg text-slate-300">{message}</p>
                    </div>
                );
            case 'confirming':
                if (currentAppliance) {
                    return <ConfirmationView
                        initialDetails={currentAppliance.response.applianceDetails}
                        imageUrl={currentAppliance.imageUrl}
                        onConfirm={handleConfirmation}
                        onCancel={handleDiscard}
                    />;
                }
                return null; // Should not happen
            default:
                return <ImageUpload onImageUpload={handleImageUpload} />;
        }
    };
    
    if (!isLoggedIn) {
        return <LoginScreen onLogin={handleLogin} />;
    }

    return (
        <div className="bg-slate-900 min-h-screen text-slate-100 font-sans">
            <Header
                onOpenGuide={() => setIsGuideOpen(true)}
                onOpenKnowledgeBase={() => setIsKnowledgeBaseOpen(true)}
                isOffline={isOffline}
                onLogout={handleLogout}
            />
            
            <Dashboard>
                {error && <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg mb-8 text-center">{error}</div>}

                { (appState === 'idle' || appState === 'results') && !currentAppliance &&
                    <div className="text-center mb-8">
                        <button onClick={() => setAppState('idle')} className="px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-lg text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
                           Analyze New Appliance
                        </button>
                         <button onClick={() => setCostEstimatorContext(true)} className="ml-4 px-6 py-3 border border-slate-600 text-base font-medium rounded-md shadow-lg text-slate-200 bg-slate-700 hover:bg-slate-600">
                           AI Cost Estimator
                        </button>
                    </div>
                }

                { (appState === 'results' && currentAppliance) &&
                    <button onClick={() => { setCurrentAppliance(null); setAppState('idle'); }} className="mb-6 text-sm font-medium text-indigo-400 hover:text-indigo-300">
                        &larr; Back to all appliances
                    </button>
                }
                
                {renderContent()}

                { (appState === 'idle' || (appState === 'results' && !currentAppliance)) && (
                    <>
                        <ProTip />
                        <WarrantyAlerts appliances={savedAppliances} onSelectAppliance={handleSelectAppliance} />
                        <SavedAppliancesList appliances={savedAppliances} onSelectAppliance={handleSelectAppliance} onDeleteAppliance={handleDeleteAppliance} /> 
                    </>
                )}
            </Dashboard>
            
            {isGuideOpen && <UserGuideModal onClose={() => setIsGuideOpen(false)} />}
            {costEstimatorContext !== null && <CostEstimatorModal onClose={() => setCostEstimatorContext(null)} applianceType={typeof costEstimatorContext === 'string' ? costEstimatorContext : undefined} />}
            {isKnowledgeBaseOpen && <KnowledgeBaseModal onClose={() => setIsKnowledgeBaseOpen(false)} applianceContext={currentAppliance?.response.applianceDetails} savedItems={knowledgeBase} setSavedItems={setKnowledgeBase} />}
            {isResearchModalOpen && currentAppliance && <DeepResearchModal appliance={currentAppliance} onClose={() => setIsResearchModalOpen(false)} onStartResearch={handleStartResearch} onDeleteReport={handleDeleteResearchReport} />}
            {isChatOpen && currentAppliance && <ChatModal appliance={currentAppliance} onClose={() => setIsChatOpen(false)} onSaveHistory={handleSaveChatHistory} />}
            {undoState && <UndoToast message="Appliance deleted." onUndo={handleUndoDelete} onDismiss={() => setUndoState(null)} />}
        </div>
    );
}

export default App;