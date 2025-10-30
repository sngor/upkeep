import React from 'react';
import { SavedAppliance } from '../types';
import { AlertTriangleIcon } from './Icons';

// Helper to calculate days remaining
const daysUntil = (dateString: string) => {
    const endDate = new Date(dateString);
    const now = new Date();
    // Normalize to the start of the day for accurate day counting
    endDate.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    const diffTime = endDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

interface WarrantyAlertsProps {
  appliances: SavedAppliance[];
  onSelectAppliance: (id: string) => void;
}

export const WarrantyAlerts: React.FC<WarrantyAlertsProps> = ({ appliances, onSelectAppliance }) => {
    const upcomingExpirations: {
        applianceId: string;
        applianceName: string;
        documentName: string;
        daysLeft: number;
        endDate: string;
    }[] = [];
    const EXPIRATION_THRESHOLD_DAYS = 30;

    appliances.forEach(appliance => {
        const documents = Array.isArray(appliance.documents) ? appliance.documents : [];
        documents.forEach(doc => {
            if (doc.warrantyInfo?.warrantyEndDate) {
                const daysLeft = daysUntil(doc.warrantyInfo.warrantyEndDate);
                if (daysLeft >= 0 && daysLeft <= EXPIRATION_THRESHOLD_DAYS) {
                    upcomingExpirations.push({
                        applianceId: appliance.id,
                        applianceName: `${appliance.response.applianceDetails.make} ${appliance.response.applianceDetails.model}`,
                        documentName: doc.name,
                        daysLeft: daysLeft,
                        endDate: new Date(doc.warrantyInfo.warrantyEndDate).toLocaleDateString(undefined, { timeZone: 'UTC' }),
                    });
                }
            }
        });
    });

    if (upcomingExpirations.length === 0) {
        return null;
    }
    
    // Sort by days left, ascending
    upcomingExpirations.sort((a, b) => a.daysLeft - b.daysLeft);

    return (
        <div className="mb-8 p-4 bg-amber-900/20 border border-amber-600/50 rounded-lg animate-fade-in">
            <h3 className="flex items-center text-lg font-semibold text-amber-300">
                <AlertTriangleIcon className="h-5 w-5 mr-3" />
                Warranty Expiration Alerts
            </h3>
            <ul className="mt-3 space-y-2">
                {upcomingExpirations.map((exp, index) => (
                    <li key={index} className="p-3 bg-slate-800/50 rounded-md text-sm">
                        <p className="font-semibold text-white">
                           <strong className="text-amber-400">{exp.daysLeft} day{exp.daysLeft !== 1 ? 's' : ''} left!</strong> Warranty for <button onClick={() => onSelectAppliance(exp.applianceId)} className="font-bold underline hover:text-indigo-300 transition-colors">{exp.applianceName}</button> expires on {exp.endDate}.
                        </p>
                        <p className="text-xs text-slate-400 mt-1">From document: {exp.documentName}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};