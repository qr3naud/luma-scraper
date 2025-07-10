
import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Search } from "lucide-react";

interface EventInputFormProps {
  eventUrl: string;
  setEventUrl: (url: string) => void;
  profileIntent: string;
  setProfileIntent: (intent: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  isExternalScrapingInProgress?: boolean;
}

const EventInputForm: React.FC<EventInputFormProps> = ({
  eventUrl,
  setEventUrl,
  profileIntent,
  setProfileIntent,
  handleSubmit,
  isLoading,
  isExternalScrapingInProgress
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg p-8 w-full max-w-2xl mx-auto mb-16">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="event-url" className="block text-sm font-medium text-[#111827] mb-2">Luma Event URL</label>
          <Input 
            id="event-url" 
            placeholder="https://lu.ma/your-event" 
            value={eventUrl} 
            onChange={e => setEventUrl(e.target.value)} 
            className="w-full border-gray-200 focus:border-purple-500 focus:ring-purple-500" 
          />
        </div>
        
        <div>
          <label htmlFor="profile-intent" className="block text-sm font-medium text-[#111827] mb-2">
            Who are you hoping to meet?
          </label>
          <Textarea 
            id="profile-intent" 
            placeholder="e.g. I'm a founder building a productivity tool and I'm looking to meet investors or other AI builders." 
            value={profileIntent} 
            onChange={e => setProfileIntent(e.target.value)} 
            className="min-h-[100px] w-full border-gray-200 focus:border-purple-500 focus:ring-purple-500" 
          />
          <p className="mt-2 text-sm text-[#6B7280]">
            This helps us prioritize who might be the most relevant for you to meet.
          </p>
        </div>
        
        <Button 
          type="submit" 
          disabled={isLoading || isExternalScrapingInProgress || !eventUrl} 
          className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-[#7F56D9] to-[#5E41C5] hover:from-[#6941C6] hover:to-[#4E31B5] text-white rounded-xl transition-all duration-200"
        >
          <Search className="mr-2 h-5 w-5" /> Find Connections
        </Button>
      </form>
    </div>
  );
};

export default EventInputForm;
