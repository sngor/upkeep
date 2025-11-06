
import React from 'react';
import { GoogleIcon } from './Icons';

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
                <svg width="64" height="64" viewBox="0 0 24 24" className="mr-4">
                    <path fill="#818cf8" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <path stroke="#c7d2fe" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" d="M7 7v4a5 5 0 0 0 10 0V7"/>
                </svg>
                <h1 className="text-5xl font-extrabold text-white tracking-tight animate-tracking-in-expand">Upkeep AI</h1>
            </div>

            <p className="mt-4 text-lg text-slate-300 animate-fade-in" style={{animationDelay: '0.8s'}}>
                Your smart partner for total home maintenance. Snap photos of appliance labels, get AI-powered care schedules, estimate repair costs, manage tasks, and connect with trusted local services.
            </p>

            <div className="mt-10 animate-fade-in" style={{animationDelay: '1.2s'}}>
                <button
                    onClick={onLogin}
                    className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-lg text-slate-800 font-semibold bg-white hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-900 transition-all transform hover:scale-105"
                >
                    <GoogleIcon />
                    <span className="ml-3">Sign in with Google</span>
                </button>
            </div>
        </div>
    </div>
  );
};
