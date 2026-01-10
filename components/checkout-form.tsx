"use client";

import { useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function CheckoutForm({ onSuccess }: { onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/buy-points`, // Ideally strictly this page, handled via state if not redirected
      },
      redirect: "if_required", // Important: Avoid redirect if we want to show success modal inline
    });

    if (error) {
      setErrorMessage(error.message ?? "An unexpected error occurred.");
      setIsProcessing(false);
    } else {
      // Payment succeeded!
      onSuccess();
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      
      {errorMessage && (
        <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md border border-destructive/20">
          {errorMessage}
        </div>
      )}

      <Button
        disabled={!stripe || isProcessing}
        type="submit"
        className="w-full h-12 bg-visa-green hover:bg-visa-green/90 text-parchment font-bold tracking-widest uppercase text-lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          "Pay Now"
        )}
      </Button>
    </form>
  );
}
