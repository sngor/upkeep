
import React from 'react';
import { HelpCircleIcon, KnowledgeBaseIcon } from './Icons';

interface HeaderProps {
    onOpenGuide: () => void;
    onOpenKnowledgeBase: () => void;
    isOffline: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onOpenGuide, onOpenKnowledgeBase, isOffline }) => {
    return (
        <header className="bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40 border-b border-slate-700">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <svg width="32" height="32" viewBox="0 0 24 24" className="mr-3">
                            <path fill="#818cf8" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                            <path stroke="#c7d2fe" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" d="M7 7v4a5 5 0 0 0 10 0V7"/>
                        </svg>
                        <h1 className="text-xl font-bold text-white tracking-tight">Upkeep AI</h1>
                        {isOffline && <span className="ml-4 text-xs font-semibold bg-slate-700 text-slate-300 px-2 py-1 rounded-full">Offline Mode</span>}
                    </div>
                    <div className="flex items-center space-x-2">
                        <button onClick={onOpenKnowledgeBase} className="p-2 text-slate-400 hover:text-white">
                            <KnowledgeBaseIcon className="h-6 w-6" />
                            <span className="sr-only">Open Knowledge Base</span>
                        </button>
                        <button onClick={onOpenGuide} className="p-2 text-slate-400 hover:text-white">
                            <HelpCircleIcon className="h-6 w-6" />
                            <span className="sr-only">Open User Guide</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};
