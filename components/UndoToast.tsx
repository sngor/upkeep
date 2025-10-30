
import React, { useEffect, useState } from 'react';
import { XIcon } from './Icons';

interface UndoToastProps {
  message: string;
  duration?: number;
  onUndo: () => void;
  onDismiss: () => void;
}

export const UndoToast: React.FC<UndoToastProps> = ({ message, duration = 5000, onUndo, onDismiss }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onDismiss, 300); // Allow for fade-out animation
  };

  const handleUndo = () => {
    onUndo();
    handleClose();
  };

  return (
    <div className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-md p-4 rounded-lg shadow-lg bg-slate-800 border border-slate-700 transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} role="alert">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-white">{message}</p>
        <div className="flex items-center space-x-3">
          <button onClick={handleUndo} className="text-sm font-semibold text-indigo-400 hover:text-indigo-300">Undo</button>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-200"><XIcon className="h-5 w-5"/></button>
        </div>
      </div>
    </div>
  );
};