
import React, { useState } from 'react';
import { BellIcon, XIcon } from './Icons';

interface ReminderModalProps {
  task: { task: string; reminder?: string; };
  onSave: (reminder: string) => void;
  onClose: () => void;
}

export const ReminderModal: React.FC<ReminderModalProps> = ({ task, onSave, onClose }) => {
  const getInitialDateTime = () => {
    let initialDate: Date;
    if (task.reminder) {
        const parsedDate = new Date(task.reminder);
        if (!isNaN(parsedDate.getTime())) {
            initialDate = parsedDate;
        } else {
             // Fallback if stored date is invalid
            initialDate = new Date();
            initialDate.setDate(initialDate.getDate() + 1);
            initialDate.setHours(9, 0, 0, 0);
        }
    } else {
        // If no reminder is set, default to tomorrow at 9 AM
        initialDate = new Date();
        initialDate.setDate(initialDate.getDate() + 1);
        initialDate.setHours(9, 0, 0, 0);
    }

    // Format for datetime-local input, which expects "YYYY-MM-DDTHH:mm"
    const year = initialDate.getFullYear();
    const month = String(initialDate.getMonth() + 1).padStart(2, '0');
    const day = String(initialDate.getDate()).padStart(2, '0');
    const hours = String(initialDate.getHours()).padStart(2, '0');
    const minutes = String(initialDate.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [dateTime, setDateTime] = useState(getInitialDateTime());

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (dateTime) {
      const date = new Date(dateTime);
      onSave(date.toISOString());
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      aria-labelledby="reminder-modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md transform transition-all animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start justify-between">
             <div className="flex items-center">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 sm:mx-0 sm:h-10 sm:w-10">
                    <BellIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                </div>
                <div className="ml-4 text-left">
                    <h3 className="text-lg leading-6 font-medium text-slate-900 dark:text-white" id="reminder-modal-title">
                        Set Reminder
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        For task: "{task.task}"
                    </p>
                </div>
             </div>
            <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-500 dark:text-slate-500 dark:hover:text-slate-300"
            >
                <XIcon className="h-6 w-6" />
                <span className="sr-only">Close</span>
            </button>
          </div>
          
          <form onSubmit={handleSave} className="mt-6">
            <label htmlFor="reminder-datetime" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Reminder Date & Time
            </label>
            <input
              type="datetime-local"
              id="reminder-datetime"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-sm shadow-sm placeholder-slate-400
                         focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
             <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">A reminder will be stored in this browser.</p>

            <div className="mt-6 sm:flex sm:flex-row-reverse">
                <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                    Save Reminder
                </button>
                <button
                    type="button"
                    onClick={onClose}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-slate-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-700 text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                    Cancel
                </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};