import React from 'react';
import { SavedAppliance } from '../types';
import { Trash2Icon } from './Icons';

interface SavedAppliancesListProps {
  appliances: SavedAppliance[];
  onSelectAppliance: (id: string) => void;
  onDeleteAppliance: (id: string) => void;
}

export const SavedAppliancesList: React.FC<SavedAppliancesListProps> = ({ appliances, onSelectAppliance, onDeleteAppliance }) => {
  if (appliances.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <h2 className="text-xl font-semibold text-white mb-4 px-4 sm:px-6 lg:px-8">My Appliances</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4 sm:px-6 lg:px-8">
        {appliances.map(appliance => (
          <div key={appliance.id} className="group relative bg-slate-800/50 rounded-lg shadow-lg border border-slate-700 hover:border-indigo-500 transition-all duration-300 transform hover:-translate-y-1">
            <button onClick={() => onSelectAppliance(appliance.id)} className="block w-full text-left p-4">
              <img src={appliance.imageUrl} alt={appliance.response.applianceDetails.type} className="w-full h-40 object-cover rounded-md mb-4"/>
              <p className="text-sm text-slate-400">{appliance.response.applianceDetails.type}</p>
              <h3 className="font-semibold text-white truncate">{appliance.response.applianceDetails.make} {appliance.response.applianceDetails.model}</h3>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteAppliance(appliance.id);
              }}
              className="absolute top-2 right-2 p-2 bg-slate-900/50 rounded-full text-slate-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Delete appliance"
            >
              <Trash2Icon className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
