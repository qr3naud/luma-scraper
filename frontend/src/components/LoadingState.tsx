
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

interface LoadingStateProps {
  isExternalScraping?: boolean;
  isWaitingForData?: boolean;
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  isExternalScraping, 
  isWaitingForData 
}) => {
  const getLoadingMessage = () => {
    if (isWaitingForData) {
      return {
        title: "Waiting for Clay to return processed data...",
        description: "Your event data has been sent to the Python script, and we're now waiting for Clay to process and return the enriched attendee information. This usually takes 1-3 minutes."
      };
    }
    
    if (isExternalScraping) {
      return {
        title: "Sending data to Python script...",
        description: "We're sending your event data to the Python script for processing. The script will forward the data to Clay for enrichment."
      };
    }
    
    return {
      title: "Processing event data...",
      description: "Processing event data and analyzing attendees. This may take a few moments."
    };
  };

  const { title, description } = getLoadingMessage();

  return (
    <div className="space-y-6 bg-white rounded-xl shadow-lg p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#111827]">
          {title}
        </h2>
        <Skeleton className="h-10 w-28" />
      </div>
      <p className="text-[#6B7280]">
        {description}
      </p>
      {isWaitingForData && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            <p className="text-blue-800 text-sm">
              Polling for processed data every 5 seconds... This may take up to 5 minutes.
            </p>
          </div>
        </div>
      )}
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    </div>
  );
};

export default LoadingState;
