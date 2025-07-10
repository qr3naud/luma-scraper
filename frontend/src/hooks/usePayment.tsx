
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/sonner";

export const usePayment = () => {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);

  // Check if user has paid in the current session
  useEffect(() => {
    const hasPaid = sessionStorage.getItem("hasPaid");
    if (hasPaid === "true") {
      setIsUnlocked(true);
    }

    // Check for payment success URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("payment_success") === "true") {
      setIsUnlocked(true);
      sessionStorage.setItem("hasPaid", "true");
      // Remove query params
      window.history.replaceState({}, document.title, window.location.pathname);
      // Show success toast
      toast({
        description: "Payment successful! Your top leads are now visible."
      });
    } else if (urlParams.get("payment_canceled") === "true") {
      // Remove query params
      window.history.replaceState({}, document.title, window.location.pathname);
      toast({
        description: "Payment canceled. You can try again whenever you're ready.",
        variant: "destructive"
      });
    }
  }, []);

  // Demo unlock function - immediately sets isUnlocked to true without making API calls
  const handleUnlock = () => {
    // Show loading state briefly for better UX
    setIsProcessingPayment(true);
    toast({
      description: "Processing demo payment... This is a demo - unlocking insights immediately."
    });

    // Simulate a short delay before unlocking
    setTimeout(() => {
      setIsUnlocked(true);
      setIsProcessingPayment(false);
      sessionStorage.setItem("hasPaid", "true");

      // Show success message
      toast({
        description: "Demo Payment Successful! Your leads are now unlocked."
      });
    }, 1000);
  };

  return {
    isUnlocked,
    isProcessingPayment,
    handleUnlock
  };
};
