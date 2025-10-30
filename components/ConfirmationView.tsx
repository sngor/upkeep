
import React, { useState } from 'react';
import { type ApplianceDetails } from '../types';
import { EditIcon, SparklesIcon } from './Icons';

interface ConfirmationViewProps {
  initialDetails: ApplianceDetails;
  imageUrl: string;
  onConfirm: (details: ApplianceDetails) => void;
  onCancel: () => void;
}

const EditableField: React.FC<{ label: string; value: string; onChange: (value: string) => void; placeholder?: string, animationDelay: string }> = ({ label, value, onChange, placeholder, animationDelay }) => {
    return (
        <div className="animate-fade-in" style={{ animationDelay }}>
            <label className="block text-sm font-medium text-slate-400">{label}</label>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder || 'N/A'}
                className="mt-1 block w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-md text-sm shadow-sm placeholder-slate-400
                           focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />
        </div>
    );
};

export const ConfirmationView: React.FC<ConfirmationViewProps> = ({ initialDetails, imageUrl, onConfirm, onCancel }) => {
  const [details, setDetails] = useState<ApplianceDetails>(initialDetails);

  const handleDetailChange = (field: keyof ApplianceDetails, value: string) => {
    setDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(details);
  };

  return (
    <div className="bg-slate-800/50 rounded-xl shadow-2xl border border-slate-700 overflow-hidden">
        <div className="p-6 text-center">
            <EditIcon className="mx-auto h-12 w-12 text-indigo-400" />
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-white">
                Confirm Appliance Details
            </h2>
            <p className="mt-2 text-md text-slate-300">
                The AI has extracted the following details. Please review and correct them if needed for the best results.
            </p>
        </div>
        
        <div className="border-t border-slate-700 p-6">
            <form onSubmit={handleSubmit}>
                <div className="md:flex md:space-x-8 items-start">
                    <div className="flex-shrink-0 mb-6 md:mb-0">
                         <img 
                            src={imageUrl} 
                            alt="Appliance Label" 
                            className="w-40 h-40 object-cover rounded-lg shadow-md mx-auto border-2 border-slate-600"
                        />
                    </div>
                    <div className="flex-grow space-y-4">
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <EditableField 
                                label="Brand / Make"
                                value={details.make}
                                onChange={(val) => handleDetailChange('make', val)}
                                placeholder="e.g., Samsung"
                                animationDelay="0.2s"
                            />
                             <EditableField 
                                label="Model Number"
                                value={details.model}
                                onChange={(val) => handleDetailChange('model', val)}
                                placeholder="e.g., RF28R7351SG"
                                animationDelay="0.3s"
                            />
                       </div>
                        <EditableField 
                            label="Appliance Type"
                            value={details.type}
                            onChange={(val) => handleDetailChange('type', val)}
                            placeholder="e.g., Refrigerator"
                            animationDelay="0.4s"
                        />
                        <EditableField 
                            label="Serial Number (Optional)"
                            value={details.serialNumber || ''}
                            onChange={(val) => handleDetailChange('serialNumber', val)}
                            animationDelay="0.5s"
                        />
                    </div>
                </div>

                <div className="mt-8 pt-5 border-t border-slate-700 flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 border border-slate-600 text-sm font-medium rounded-md shadow-sm text-slate-200 bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-900"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-lg text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-900 transition-all transform hover:scale-105"
                    >
                        <SparklesIcon className="h-4 w-4 mr-2" />
                        Confirm and Continue
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
};