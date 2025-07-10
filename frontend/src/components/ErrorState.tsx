
import React from 'react';

interface ErrorStateProps {
  error: Error;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error }) => {
  return (
    <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-6 mt-4">
      <h3 className="font-medium mb-2">Error Scraping Event</h3>
      <p>{error.message}</p>
      <p className="mt-2 text-sm">
        There was an issue scraping the event data. Please check the URL and try again, or contact support if the problem persists.
      </p>
    </div>
  );
};

export default ErrorState;
