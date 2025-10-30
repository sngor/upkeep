
import React from 'react';
import { HelpCircleIcon, KnowledgeBaseIcon, LogOutIcon } from './Icons';

interface HeaderProps {
    onOpenGuide: () => void;
    onOpenKnowledgeBase: () => void;
    isOffline: boolean;
    onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenGuide, onOpenKnowledgeBase, isOffline, onLogout }) => {
    return (
        <header className="bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40 border-b border-slate-700">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <svg width="32" height="32" viewBox="0 0 128 128" className="mr-3">
                            <path fill="#818cf8" d="M105.8,22.2C94.3,10.7,78.8,4,62,4S29.7,10.7,18.2,22.2c-20.3,20.3-22.3,52.4-5.4,74.7L4,105.8l8.5,8.5l8.5,8.5l8.5,8.5l8.9-8.9c22.3,16.9,54.4,14.9,74.7-5.4C128.1,96.6,128.1,44.5,105.8,22.2z M99,99c-20.4,20.4-53.7,20.4-74,0s-20.4-53.7,0-74s53.7-20.4,74,0S119.4,78.6,99,99z"/>
                            <path fill="#c7d2fe" d="M85.1,42.9L55.8,72.2l-14-14l-8.5,8.5l22.5,22.5l37.8-37.8L85.1,42.9z"/>
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
                        <button onClick={onLogout} className="p-2 text-slate-400 hover:text-white">
                            <LogOutIcon className="h-6 w-6" />
                            <span className="sr-only">Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};