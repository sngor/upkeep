
import React from 'react';
import { HelpCircleIcon, XIcon } from './Icons';

interface UserGuideModalProps {
  onClose: () => void;
}

const FAQItem: React.FC<{ question: string; children: React.ReactNode }> = ({ question, children }) => (
  <div className="py-4">
    <dt className="font-semibold text-slate-800 dark:text-slate-100">{question}</dt>
    <dd className="mt-2 text-slate-600 dark:text-slate-300">{children}</dd>
  </div>
);

export const UserGuideModal: React.FC<UserGuideModalProps> = ({ onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      aria-labelledby="guide-modal-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl transform transition-all max-h-[90vh] flex flex-col animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
           <div className="flex items-center">
             <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50">
                <HelpCircleIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
             </div>
             <div className="ml-4">
                <h3 className="text-lg leading-6 font-medium text-slate-900 dark:text-white" id="guide-modal-title">
                    User Guide
                </h3>
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
        
        <div className="p-6 overflow-y-auto">
            <dl className="divide-y divide-slate-200 dark:divide-slate-700">
                <FAQItem question="How do I add a new appliance?">
                    From the main screen, click "Analyze New Appliance". You can then either take a photo of your appliance's label or upload an existing image. The AI will analyze it and ask you to confirm the details before saving.
                </FAQItem>
                <FAQItem question="What if the AI gets the details wrong?">
                    After the AI analyzes your image, you will see a confirmation screen. You can edit any of the fields on this screen to ensure the information is 100% accurate before you continue.
                </FAQItem>
                 <FAQItem question="Where are my appliances saved?">
                    All your analyzed appliances are automatically saved to your browser's local storage. This means they are stored securely on your device and are available even when you're offline. You can see all your saved appliances on the app's home screen.
                </FAQItem>
                 <FAQItem question="How do I set a reminder for a care task?">
                    When viewing an appliance's details, go to the "Care Schedule" tab. Each task has a "Set Reminder" button. Click it to open a calendar and set a specific date and time for that task. The reminder is saved in your browser.
                </FAQItem>
                <FAQItem question="Can I use the app offline?">
                   Yes! Once an appliance is saved, you can view all its details, care schedules, and local service information without an internet connection. The "Offline Mode" indicator in the header will show when you're viewing saved data.
                </FAQItem>
                <FAQItem question="How do I delete an appliance?">
                    On the main list of your saved appliances, hover over the one you want to remove. A trash can icon will appear in the top-right corner. Click it to permanently delete the appliance from your history.
                </FAQItem>
            </dl>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex justify-end">
            <button
                type="button"
                onClick={onClose}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto sm:text-sm"
            >
                Got it, thanks!
            </button>
        </div>
      </div>
    </div>
  );
};