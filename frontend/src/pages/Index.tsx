
import { useEventScraper } from "@/hooks/useEventScraper";
import { usePayment } from "@/hooks/usePayment";
import FloatingCards from "@/components/FloatingCards";
import HeroSection from "@/components/HeroSection";
import EventInputForm from "@/components/EventInputForm";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import AttendeeTable from "@/components/AttendeeTable";
import WhyMeetSection from "@/components/WhyMeetSection";

const Index = () => {
  // Custom hooks to manage different pieces of functionality
  const {
    eventUrl,
    setEventUrl,
    profileIntent, 
    setProfileIntent,
    isScrapingComplete,
    attendees,
    isLoading,
    error,
    scrapingError,
    isExternalScrapingInProgress,
    isWaitingForData,
    handleSubmit
  } = useEventScraper();

  const {
    isUnlocked,
    isProcessingPayment,
    handleUnlock
  } = usePayment();

  // Rotating keywords for the hero section
  const rotatingWords = ["relevant", "influential", "strategic", "high-signal", "valuable"];

  return (
    <div className="min-h-screen bg-[#F9FAFB] relative overflow-x-hidden">
      {/* Floating background cards */}
      <FloatingCards />
      
      <div className="max-w-5xl mx-auto px-4 pt-16 pb-24 relative z-10">
        {/* Hero Section */}
        <HeroSection rotatingWords={rotatingWords} />

        {/* Input Form */}
        <EventInputForm 
          eventUrl={eventUrl}
          setEventUrl={setEventUrl}
          profileIntent={profileIntent}
          setProfileIntent={setProfileIntent}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          isExternalScrapingInProgress={isExternalScrapingInProgress}
        />

        {/* Loading State */}
        {isLoading && (
          <LoadingState 
            isExternalScraping={isExternalScrapingInProgress && !isWaitingForData}
            isWaitingForData={isWaitingForData}
          />
        )}

        {/* Results Section */}
        {isScrapingComplete && attendees.length > 0 && (
          <div className="space-y-6">
            {/* Attendee Table */}
            <AttendeeTable 
              attendees={attendees}
              isUnlocked={isUnlocked}
              handleUnlock={handleUnlock}
              isProcessingPayment={isProcessingPayment}
              scrapingError={scrapingError}
            />
            
            {/* Why Meet Section - Only visible when unlocked */}
            {isUnlocked && <WhyMeetSection attendees={attendees} />}
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && !isExternalScrapingInProgress && (
          <ErrorState error={error as Error} />
        )}
      </div>
    </div>
  );
};

export default Index;
