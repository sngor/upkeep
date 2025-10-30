import React, { useState, useEffect } from 'react';
import { type CareTask } from '../types';
import { Card } from './Card';
import { CheckCircleIcon, BellIcon, Trash2Icon, LinkIcon, YoutubeIcon, ChevronDownIcon, ChevronUpIcon, CheckIcon } from './Icons';
import { ReminderModal } from './ReminderModal';

interface CareScheduleProps {
  schedule: CareTask[];
  onSetReminder: (taskIndex: number, reminder: string | null) => void;
  onMarkTaskComplete: (taskIndex: number) => void;
  isNew: boolean;
}

const formatReminderDate = (isoString?: string): string => {
    if (!isoString) return '';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
        return 'Invalid Reminder Date';
    }
    return date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
};

const getYouTubeEmbedUrl = (url?: string): string | null => {
    if (!url) return null;
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname.includes('youtube.com') && urlObj.pathname === '/watch') {
            const videoId = urlObj.searchParams.get('v');
            return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
        }
        if (urlObj.hostname.includes('youtu.be')) {
            const videoId = urlObj.pathname.slice(1);
            return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
        }
    } catch (error) {
        console.error("Invalid YouTube URL", error);
        return null;
    }
    return null;
};


const CareTaskItem: React.FC<{
  item: CareTask;
  index: number;
  onOpenReminderModal: (index: number) => void;
  onClearReminder: (index: number) => void;
  onMarkTaskComplete: (index: number) => void;
  isNew: boolean;
}> = ({ item, index, onOpenReminderModal, onClearReminder, onMarkTaskComplete, isNew }) => {
    const [isGuideOpen, setIsGuideOpen] = useState(false);
    const [justCompleted, setJustCompleted] = useState(false);

    const hasGuide = (item.instructions && item.instructions.length > 0) || item.youtubeLink;
    const embedUrl = getYouTubeEmbedUrl(item.youtubeLink);
    
    useEffect(() => {
        let timerId: number;
        if (justCompleted) {
            timerId = window.setTimeout(() => {
                setJustCompleted(false);
            }, 2500);
        }
        return () => {
            clearTimeout(timerId);
        };
    }, [justCompleted]);

    const handleCompleteClick = () => {
        if (isNew || justCompleted) return;
        onMarkTaskComplete(index);
        setJustCompleted(true);
    };

    return (
        <li className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 pt-1">
                    <CheckCircleIcon className="h-6 w-6 text-green-500" />
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <h3 className="text-md font-semibold text-slate-900 dark:text-white">{item.task}</h3>
                        <span className="text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 px-2 py-1 rounded-full whitespace-nowrap">{item.frequency}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{item.description}</p>
                     {item.lastCompleted && (
                        <p className="mt-2 text-xs italic text-slate-500 dark:text-slate-400">
                            Last completed: {new Date(item.lastCompleted).toLocaleDateString()}
                        </p>
                    )}
                    
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700/50 space-y-3">
                        <div className="flex flex-wrap gap-4 items-center">
                             <button
                                onClick={handleCompleteClick}
                                disabled={isNew || justCompleted}
                                className={`inline-flex items-center text-sm font-medium transition-all duration-300 ease-in-out rounded-md px-3 py-1 border ${
                                    justCompleted
                                        ? 'bg-green-100 dark:bg-green-800/50 border-green-300 dark:border-green-600 text-green-700 dark:text-green-300'
                                        : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                                title={isNew ? "Save appliance to complete tasks" : ""}
                            >
                                {justCompleted ? (
                                    <>
                                        <CheckIcon className="h-4 w-4 mr-1.5" />
                                        Completed!
                                    </>
                                ) : (
                                    <>
                                        <CheckCircleIcon className="h-4 w-4 mr-1.5" />
                                        Mark as Complete
                                    </>
                                )}
                            </button>

                             {item.reminder ? (
                                <div className="flex items-center text-sm">
                                    <div className="font-medium text-slate-800 dark:text-slate-200 flex items-center">
                                        <BellIcon className="h-4 w-4 mr-1.5 text-indigo-500"/>
                                        <span className="text-slate-600 dark:text-slate-300">{formatReminderDate(item.reminder)}</span>
                                    </div>
                                    <div className="flex items-center ml-2">
                                        <button onClick={() => onOpenReminderModal(index)} className="font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 disabled:text-slate-500 disabled:cursor-not-allowed text-xs" disabled={isNew} title={isNew ? "Save appliance to edit reminders" : ""}>Edit</button>
                                        <button onClick={() => onClearReminder(index)} className="p-1 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 disabled:text-slate-600 disabled:cursor-not-allowed" aria-label="Clear reminder" disabled={isNew} title={isNew ? "Save appliance to clear reminders" : ""}><Trash2Icon className="h-3 w-3"/></button>
                                    </div>
                                </div>
                            ) : (
                                <button onClick={() => onOpenReminderModal(index)} className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors disabled:text-slate-500 disabled:cursor-not-allowed" disabled={isNew} title={isNew ? "Save appliance to set reminders" : ""}>
                                    <BellIcon className="h-4 w-4 mr-1.5"/>Set Reminder
                                </button>
                            )}

                        </div>

                        {hasGuide && (
                            <button onClick={() => setIsGuideOpen(!isGuideOpen)} className="flex items-center text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">
                                {isGuideOpen ? <ChevronUpIcon className="h-4 w-4 mr-1.5" /> : <ChevronDownIcon className="h-4 w-4 mr-1.5" />}
                                {isGuideOpen ? 'Hide How-To Guide' : 'View How-To Guide'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
            {isGuideOpen && hasGuide && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700/50 animate-fade-in space-y-4">
                    {item.instructions && item.instructions.length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">Instructions:</h4>
                            <ol className="list-decimal list-inside space-y-1 text-sm text-slate-600 dark:text-slate-300">
                                {item.instructions.map((step, i) => <li key={i}>{step}</li>)}
                            </ol>
                        </div>
                    )}
                    {embedUrl && (
                        <div>
                             <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2 flex items-center">
                                <YoutubeIcon className="h-5 w-5 mr-2 text-red-500" />
                                Video Tutorial:
                            </h4>
                            <div className="aspect-video rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                                <iframe
                                    width="100%"
                                    height="100%"
                                    src={embedUrl}
                                    title="YouTube video player"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </li>
    );
};

export const CareSchedule: React.FC<CareScheduleProps> = ({ schedule, onSetReminder, onMarkTaskComplete, isNew }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTaskIndex, setSelectedTaskIndex] = useState<number | null>(null);

  const handleOpenModal = (index: number) => {
    setSelectedTaskIndex(index);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedTaskIndex(null);
  };

  const handleSaveReminder = (reminder: string) => {
    if (selectedTaskIndex !== null) {
      onSetReminder(selectedTaskIndex, reminder);
    }
    handleCloseModal();
  };
  
  const handleClearReminder = (index: number) => {
    onSetReminder(index, null);
  };
  
  const allSources = schedule.flatMap(item => Array.isArray(item.sources) ? item.sources : []).filter((s, index, self) => index === self.findIndex(t => t.uri === s.uri));


  return (
    <>
      <Card title="Recommended Care Schedule">
        {allSources.length > 0 && (
             <div className="mb-4 pb-4 border-b border-slate-200 dark:border-slate-700/50">
                <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">AI-Generated from Sources:</h4>
                <ul className="space-y-1">
                    {allSources.map((source, sourceIdx) => (
                        <li key={sourceIdx}>
                            <a href={source.uri} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">
                                <LinkIcon className="h-3 w-3 mr-1.5 flex-shrink-0" />
                                <span className="truncate">{source.title}</span>
                            </a>
                        </li>
                    ))}
                </ul>
             </div>
        )}
        <ul className="space-y-4">
          {schedule.map((item, index) => (
            <CareTaskItem
                key={index}
                item={item}
                index={index}
                onOpenReminderModal={handleOpenModal}
                onClearReminder={handleClearReminder}
                onMarkTaskComplete={onMarkTaskComplete}
                isNew={isNew}
            />
          ))}
        </ul>
      </Card>
      {modalOpen && selectedTaskIndex !== null && (
        <ReminderModal
          task={schedule[selectedTaskIndex]}
          onSave={handleSaveReminder}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};