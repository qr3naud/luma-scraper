
import { useState, useEffect, useRef } from "react";
import { toast } from "@/components/ui/sonner";
import { Attendee } from "@/types/attendee";

export const useEventScraper = () => {
  const [eventUrl, setEventUrl] = useState<string>("");
  const [profileIntent, setProfileIntent] = useState<string>("");
  const [isScrapingComplete, setIsScrapingComplete] = useState<boolean>(false);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [scrapingError, setScrapingError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isWaitingForData, setIsWaitingForData] = useState<boolean>(false);
  
  // Refs for polling
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const maxPollingAttemptsRef = useRef<number>(0);
  
  // Function to poll for processed data from Clay
  const pollForProcessedData = () => {
    pollingIntervalRef.current = setInterval(async () => {
      try {
        console.log("🔍 Polling for processed data from Clay...");
        
        const response = await fetch('http://localhost:3001/api/data/latest');
        
        if (response.ok) {
          const data = await response.json();
          console.log("📥 Received processed data:", data);
          
          if (data.attendees && Array.isArray(data.attendees)) {
            setAttendees(data.attendees);
            setIsScrapingComplete(true);
            setIsWaitingForData(false);
            setIsProcessing(false);
            
            // Clear polling
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }
            
            toast({
              description: `✅ Processing complete! Found ${data.attendees.length} attendees from Clay.`
            });
            
            return;
          }
        }
        
        // Increment polling attempts
        maxPollingAttemptsRef.current += 1;
        
        // Stop polling after 5 minutes (60 attempts * 5 seconds)
        if (maxPollingAttemptsRef.current >= 60) {
          console.log("⏰ Stopping polling - max attempts reached");
          
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          
          setIsWaitingForData(false);
          setIsProcessing(false);
          
          toast({
            description: "⏰ Still processing... Check back in a few minutes or refresh the page.",
            variant: "destructive"
          });
        }
        
      } catch (error) {
        console.error("❌ Error polling for data:", error);
        // Continue polling on error (server might be starting up)
      }
    }, 5000); // Poll every 5 seconds
  };

  // Start polling when component mounts if we're already waiting for data
  useEffect(() => {
    return () => {
      // Cleanup polling on unmount
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);
  
  // Function to send event URL to Python script via webhook
  const sendEventUrlToPythonScript = async (url: string) => {
    try {
      console.log("Sending event URL to Python script:", url);
      
      toast({
        description: "Sending event URL to Python script for processing..."
      });
      
      const response = await fetch('http://localhost:10000/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          event_url: url
        })
      });
      
      console.log("Python script response status:", response.status);
      
      const responseText = await response.text();
      console.log("Python script response:", responseText);
      
      let responseData;
      try {
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch (e) {
        console.log("Failed to parse response as JSON, using text response");
        responseData = { message: responseText };
      }

      if (response.ok) {
        console.log("Python script success:", responseData);
        toast({
          description: "✅ Event URL sent to Python script! Data will be processed via Clay."
        });
      } else {
        console.error("Failed to send data to Python script:", responseData);
        throw new Error(`Failed to send data to Python script. Status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error sending data to Python script:", error);
      throw error;
    }
  };

  // Function to send profileIntent to Clay webhook
  const sendProfileIntentToClay = async (intent: string) => {
    try {
      console.log("Sending profile intent to Clay:", intent);
      
      toast({
        description: "Sending your profile intent to Clay..."
      });
      
      const response = await fetch('https://api.clay.com/v3/sources/webhook/pull-in-data-from-a-webhook-cdefd0cb-29fb-4b85-a451-26553f4e9402', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          profileIntent: intent
        })
      });
      
      console.log("Clay API response status:", response.status);
      
      const responseText = await response.text();
      console.log("Clay API response text:", responseText);
      
      let responseData;
      try {
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch (e) {
        console.log("Failed to parse response as JSON, using text response");
        responseData = { message: responseText };
      }

      if (response.ok) {
        console.log("Clay API success:", responseData);
        toast({
          description: "✅ Your profile intent has been sent successfully to Clay."
        });
      } else {
        console.error("Failed to send data to Clay webhook:", responseData);
        throw new Error(`Could not send your profile intent to Clay. Status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error sending data to Clay webhook:", error);
      throw error;
    }
  };

  // Function to receive attendee data from webhook (to be called when data is ready)
  const receiveAttendeeData = (attendeeData: Attendee[]) => {
    setAttendees(attendeeData);
    setIsScrapingComplete(true);
    setScrapingError(null);
    setIsProcessing(false);
    setIsWaitingForData(false);
    
    // Clear any active polling
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    
    toast({
      description: `Data received! Found ${attendeeData.length} attendees.`
    });
  };

  // Submit handler to send event URL to Python script and profile intent to Clay
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!eventUrl) return;

    // Reset state
    setIsScrapingComplete(false);
    setAttendees([]);
    setScrapingError(null);
    setIsProcessing(true);
    setIsWaitingForData(false);
    maxPollingAttemptsRef.current = 0;

    try {
      // Send both requests in parallel
      const promises = [];
      
      if (profileIntent) {
        promises.push(sendProfileIntentToClay(profileIntent));
      }
      
      promises.push(sendEventUrlToPythonScript(eventUrl));

      // Wait for both to complete
      await Promise.all(promises);
      
      // Start polling for processed data from Clay
      setIsWaitingForData(true);
      toast({
        description: "🔄 Waiting for Clay to process and return the enriched data..."
      });
      
      // Start polling
      pollForProcessedData();
      
    } catch (error) {
      console.error("Error in data submission:", error);
      setScrapingError(error instanceof Error ? error.message : "Failed to submit data");
      setIsProcessing(false);
      setIsWaitingForData(false);
      
      toast({
        description: "❌ Failed to submit data. Please try again.",
        variant: "destructive"
      });
    }
  };

  return {
    eventUrl,
    setEventUrl,
    profileIntent,
    setProfileIntent,
    isScrapingComplete,
    attendees,
    isLoading: isProcessing || isWaitingForData,
    error: scrapingError ? new Error(scrapingError) : null,
    scrapingError,
    isExternalScrapingInProgress: isProcessing || isWaitingForData,
    isWaitingForData, // New state to show we're waiting for Clay
    handleSubmit,
    receiveAttendeeData, // Function to receive data from webhook
  };
};
