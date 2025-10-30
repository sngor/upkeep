import React, { useState, useEffect } from 'react';
import { getProTip } from '../services/geminiService';
import { LightbulbIcon } from './Icons';

export const ProTip: React.FC = () => {
    const [tip, setTip] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTip = async () => {
            setIsLoading(true);
            try {
                const cachedTipData = localStorage.getItem('proTip');
                if (cachedTipData) {
                    const { text, timestamp } = JSON.parse(cachedTipData);
                    const isStale = new Date().getTime() - timestamp > 24 * 60 * 60 * 1000;
                    if (!isStale) {
                        setTip(text);
                        return;
                    }
                }
                const newTip = await getProTip();
                setTip(newTip);
                localStorage.setItem('proTip', JSON.stringify({ text: newTip, timestamp: new Date().getTime() }));
            } catch (error) {
                console.error("Failed to fetch pro tip:", error);
                // Don't show an error, just fail silently
                setTip(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTip();
    }, []);

    if (isLoading) {
        return (
             <div className="mb-8 p-4 bg-slate-800/50 border border-slate-700 rounded-lg animate-pulse">
                <div className="h-4 bg-slate-700 rounded w-1/4"></div>
                <div className="mt-3 h-3 bg-slate-700 rounded w-full"></div>
                <div className="h-3 bg-slate-700 rounded w-3/4 mt-2"></div>
             </div>
        );
    }

    if (!tip) {
        return null; // Don't render anything if tip fetching fails
    }

    return (
        <div className="mb-8 p-4 bg-slate-800/50 border border-slate-700 rounded-lg animate-fade-in">
            <h3 className="flex items-center text-md font-semibold text-indigo-300">
                <LightbulbIcon className="h-5 w-5 mr-3" />
                Pro-Tip of the Day
            </h3>
            <p className="mt-2 text-sm text-slate-300">
                {tip}
            </p>
        </div>
    );
};
