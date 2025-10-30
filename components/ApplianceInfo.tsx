
import React, { useState, useEffect } from 'react';
import { type ApplianceDetails } from '../types';
import { Card } from './Card';
import { CalendarIcon, XIcon, CheckIcon, Trash2Icon, CpuIcon } from './Icons';

interface ApplianceInfoProps {
  details: ApplianceDetails;
  onSetDueDate: (dueDate: string | null) => void;
  modelVersion?: string;
  isNew: boolean;
}

const InfoRow: React.FC<{ label: string; value?: string }> = ({ label, value }) => {
    if (!value) return null;
    return (
        <div className="flex justify-between items-center py-3">
            <dt className="text-sm font-medium text-slate-400">{label}</dt>
            <dd className="text-sm text-white font-semibold">{value}</dd>
        </div>
    );
};

const formatDateForInput = (isoString?: string): string => {
    if (!isoString) return '';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
};

const formatDateForDisplay = (isoString?: string): string => {
    if (!isoString) return 'Not set';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
};


export const ApplianceInfo: React.FC<ApplianceInfoProps> = ({ details, onSetDueDate, modelVersion, isNew }) => {
  const [isEditingDueDate, setIsEditingDueDate] = useState(false);
  const [newDueDate, setNewDueDate] = useState(formatDateForInput(details.dueDate));
  
  useEffect(() => {
    setNewDueDate(formatDateForInput(details.dueDate));
  }, [details.dueDate]);

  const handleSave = () => {
    if (newDueDate) {
      const date = new Date(newDueDate);
      const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
      onSetDueDate(utcDate.toISOString());
    } else {
        onSetDueDate(null);
    }
    setIsEditingDueDate(false);
  };
  
  const handleCancel = () => {
    setNewDueDate(formatDateForInput(details.dueDate));
    setIsEditingDueDate(false);
  };

  const handleRemove = () => {
    onSetDueDate(null);
    setIsEditingDueDate(false);
  };
  
  const DueDateDisplay = () => {
    const displayValue = formatDateForDisplay(details.dueDate);
    const isValid = displayValue !== 'Invalid Date' && displayValue !== 'Not set';

    return (
      <div className="flex items-center space-x-2">
        <span className={`text-sm font-semibold ${isValid ? 'text-white' : 'text-slate-400 italic'}`}>
          {displayValue}
        </span>
        <button
            onClick={() => setIsEditingDueDate(true)}
            className="font-medium text-sm text-indigo-400 hover:text-indigo-300 disabled:text-slate-500 disabled:cursor-not-allowed"
            disabled={isNew}
            title={isNew ? "Save appliance to set due date" : ""}
        >
          {isValid ? 'Edit' : 'Set Date'}
        </button>
        {isValid && (
             <button
                onClick={handleRemove}
                className="p-1 text-slate-400 hover:text-red-400 disabled:text-slate-600 disabled:cursor-not-allowed"
                aria-label="Clear due date"
                disabled={isNew}
                title={isNew ? "Save appliance to manage due date" : ""}
            >
                <Trash2Icon className="h-4 w-4"/>
            </button>
        )}
      </div>
    );
  };
  
  const DueDateEdit = () => (
      <div className="flex items-center space-x-2">
          <input
            type="date"
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
            className="block w-full max-w-[160px] px-2 py-1 bg-slate-900 border border-slate-600 rounded-md text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            onClick={handleSave}
            className="p-1 text-slate-400 hover:text-green-400"
            aria-label="Save due date"
          >
              <CheckIcon className="h-5 w-5"/>
          </button>
          <button
            onClick={handleCancel}
            className="p-1 text-slate-400 hover:text-slate-200"
            aria-label="Cancel editing"
          >
              <XIcon className="h-5 w-5"/>
          </button>
      </div>
  );

  return (
    <Card title="Appliance Details" variant="dark">
        <dl className="divide-y divide-slate-700">
            <InfoRow label="Brand / Make" value={details.make} />
            <InfoRow label="Model Number" value={details.model} />
            <InfoRow label="Appliance Type" value={details.type} />
            <InfoRow label="Serial Number" value={details.serialNumber} />
             <div className="flex justify-between items-center py-3">
                <dt className="text-sm font-medium text-slate-400 flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Next Maintenance Due
                </dt>
                <dd>
                    {isEditingDueDate ? <DueDateEdit /> : <DueDateDisplay />}
                </dd>
            </div>
             {modelVersion && (
                <div className="flex justify-between items-center py-3">
                    <dt className="text-sm font-medium text-slate-400 flex items-center">
                        <CpuIcon className="h-4 w-4 mr-2" />
                        AI Model Version
                    </dt>
                    <dd className="text-sm text-white font-semibold">{modelVersion}</dd>
                </div>
            )}
        </dl>
    </Card>
  );
};