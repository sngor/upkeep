
import React, { useState, useEffect } from 'react';
import { type LocalService, SavedService } from '../types';
import { Card } from './Card';
import { PhoneIcon, GlobeIcon, ExternalLinkIcon, SearchIcon, XIcon, StarIcon } from './Icons';

interface LocalServicesProps {
  services: LocalService[];
  savedServices: SavedService[];
  onToggleSaveService: (service: LocalService) => void;
  isNew?: boolean;
}

export const LocalServices: React.FC<LocalServicesProps> = ({ services, savedServices, onToggleSaveService, isNew = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [filteredServices, setFilteredServices] = useState<LocalService[]>(services);
  
  const savedServiceKeys = new Set(savedServices.map(s => `${s.name}|${s.address}`));

  // Debounce the search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);


  // Filter services based on the debounced search term
  useEffect(() => {
    if (debouncedSearchTerm.trim() === '') {
      setFilteredServices(services);
      return;
    }

    const lowercasedQuery = debouncedSearchTerm.toLowerCase();
    const filtered = services.filter(service =>
      service.name.toLowerCase().includes(lowercasedQuery) ||
      service.address.toLowerCase().includes(lowercasedQuery)
    );
    setFilteredServices(filtered);

  }, [debouncedSearchTerm, services]);
  
  const handleClearSearch = () => {
    setSearchTerm('');
  };


  return (
    <Card title="Nearby Repair Services">
       <div className="mb-6">
            <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <SearchIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search services by name or address..."
                    className="block w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 py-2 pl-10 pr-10 text-sm placeholder-slate-400 focus:border-indigo-500 focus:ring-indigo-500"
                />
                 {searchTerm && (
                    <button
                        onClick={handleClearSearch}
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                        aria-label="Clear search"
                    >
                        <XIcon className="h-5 w-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" />
                    </button>
                 )}
            </div>
       </div>

       {filteredServices.length > 0 ? (
            <ul className="space-y-4">
                {filteredServices.map((service, index) => {
                  const isSaved = savedServiceKeys.has(`${service.name}|${service.address}`);
                  return (
                    <li key={index} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 flex items-start space-x-4">
                        <div className="flex-grow">
                          <h3 className="font-semibold text-slate-900 dark:text-white">{service.name}</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{service.address}</p>
                          {service.recommendation && (
                            <p className="text-sm text-slate-400 dark:text-slate-300 mt-2 italic">"{service.recommendation}"</p>
                          )}
                          <div className="mt-3 flex items-center space-x-4 text-sm">
                          {service.phone && (
                              <a href={`tel:${service.phone}`} className="inline-flex items-center text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium">
                              <PhoneIcon className="h-4 w-4 mr-1.5" />
                              {service.phone}
                              </a>
                          )}
                          {service.website && (
                              <a href={service.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium">
                              <GlobeIcon className="h-4 w-4 mr-1.5" />
                              Website
                              <ExternalLinkIcon className="h-3 w-3 ml-1"/>
                              </a>
                          )}
                          </div>
                        </div>
                         <button
                            onClick={() => onToggleSaveService(service)}
                            className={`p-2 rounded-full transition-colors ${isSaved ? 'text-amber-400 bg-amber-400/10 hover:bg-amber-400/20' : 'text-slate-400 hover:bg-slate-700'} ${isNew ? 'opacity-50 cursor-not-allowed' : ''}`}
                            aria-label={isSaved ? 'Unsave service' : 'Save service'}
                            disabled={isNew}
                            title={isNew ? "Save the appliance first to manage preferred services" : ""}
                        >
                            <StarIcon className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
                        </button>
                    </li>
                  );
                })}
            </ul>
        ) : (
            <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                {searchTerm ? `No services found matching "${searchTerm}".` : 'No local services could be found based on your location.'}
            </p>
        )}
    </Card>
  );
};