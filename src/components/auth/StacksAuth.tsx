"use client";

import React, { useState, useEffect } from "react";
import { AppConfig, showConnect, UserSession } from "@stacks/connect";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

const appConfig = new AppConfig(["store_write", "publish_data"]);
const userSession = new UserSession({ appConfig });

export default function StacksAuth() {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", content: "" });
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAuthentication = async (stxAddress: string) => {
    try {
      // Try to sign in first
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: `${stxAddress}@stacks.id`,
        password: stxAddress,
      });

      if (signInError && signInError.status === 400) {
        // User doesn't exist, proceed with sign up
        setMessage({
          type: "info",
          content: "Looks like you haven't signed up. Creating your account...",
        });

        const { error: signUpError } = await supabase.auth.signUp({
          email: `${stxAddress}@stacks.id`,
          password: stxAddress,
        });

        if (signUpError) throw signUpError;

        setMessage({
          type: "success",
          content: "Account created successfully! Redirecting to dashboard...",
        });

        return true;
      } else if (signInError) {
        throw signInError;
      }

      setMessage({
        type: "success",
        content: "Signed in successfully! Redirecting to dashboard...",
      });

      return true;
    } catch (error) {
      console.error("Authentication error:", error);
      setMessage({
        type: "error",
        content: "Authentication failed. Please try again.",
      });
      return false;
    }
  };

  const handleAuth = async () => {
    setIsLoading(true);
    setMessage({ type: "", content: "" });

    try {
      setMessage({ type: "info", content: "Connecting wallet..." });

      // Connect wallet
      await new Promise<void>((resolve) => {
        showConnect({
          appDetails: {
            name: "AIBTC Crew Generator",
            icon: window.location.origin + "/logos/aibtcdev-avatar-1000px.png",
          },
          onFinish: () => resolve(),
          userSession,
        });
      });

      const userData = userSession.loadUserData();
      const stxAddress = userData.profile.stxAddress.mainnet;

      setMessage({
        type: "info",
        content: "Wallet connected. Authenticating...",
      });

      const success = await handleAuthentication(stxAddress);

      if (success) {
        // Delay redirect to show success message
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      }
    } catch (error) {
      console.error("Wallet connection error:", error);
      setMessage({
        type: "error",
        content: "Failed to connect wallet. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-4">
      <Button
        onClick={handleAuth}
        disabled={isLoading}
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-lg font-bold"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Connecting...
          </>
        ) : (
          "Connect Wallet"
        )}
      </Button>
      {message.content && (
        <div
          className={`mt-4 flex items-center space-x-2 ${
            message.type === "error"
              ? "text-red-600"
              : message.type === "success"
              ? "text-green-600"
              : "text-blue-600"
          }`}
          role="alert"
        >
          {message.type === "error" ? (
            <AlertCircle className="h-5 w-5" aria-hidden="true" />
          ) : message.type === "success" ? (
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          )}
          <p>{message.content}</p>
        </div>
      )}
    </div>
  );
}
