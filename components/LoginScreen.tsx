import React from 'react';
import { SparklesIcon } from './Icons';

interface LoginScreenProps {
    onLogin: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  return (
    <div className="relative flex items-center justify-center min-h-screen bg-slate-900 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 w-full h-full animate-aurora z-0"></div>

        <div className="relative z-10 text-center p-8 max-w-2xl mx-auto">
             <div className="flex items-center justify-center mb-6 animate-text-focus-in" style={{animationDelay: '0.2s'}}>
                <svg width="64" height="64" viewBox="0 0 128 128" className="mr-4">
                    <path fill="#818cf8" d="M105.8,22.2C94.3,10.7,78.8,4,62,4S29.7,10.7,18.2,22.2c-20.3,20.3-22.3,52.4-5.4,74.7L4,105.8l8.5,8.5l8.5,8.5l8.5,8.5l8.9-8.9c22.3,16.9,54.4,14.9,74.7-5.4C128.1,96.6,128.1,44.5,105.8,22.2z M99,99c-20.4,20.4-53.7,20.4-74,0s-20.4-53.7,0-74s53.7-20.4,74,0S119.4,78.6,99,99z"/>
                    <path fill="#c7d2fe" d="M85.1,42.9L55.8,72.2l-14-14l-8.5,8.5l22.5,22.5l37.8-37.8L85.1,42.9z"/>
                </svg>
                <h1 className="text-5xl font-extrabold text-white tracking-tight animate-tracking-in-expand">Upkeep AI</h1>
            </div>

            <p className="mt-4 text-lg text-slate-300 animate-fade-in" style={{animationDelay: '0.8s'}}>
                Your smart partner for total home maintenance. Snap photos of appliance labels, get AI-powered care schedules, estimate repair costs, manage tasks, and connect with trusted local services.
            </p>

            <div className="mt-10 animate-fade-in" style={{animationDelay: '1.2s'}}>
                <button
                    onClick={onLogin}
                    className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-md shadow-lg text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-900 transition-all transform hover:scale-105 animate-pulse-glow"
                >
                    <SparklesIcon className="h-6 w-6 mr-3" />
                    Get Started
                </button>
            </div>
        </div>
    </div>
  );
};
