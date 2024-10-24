"use client";

import React, { useState, useEffect } from "react";
import { AppConfig, showConnect, UserSession } from "@stacks/connect";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const appConfig = new AppConfig(["store_write", "publish_data"]);
const userSession = new UserSession({ appConfig });

export default function StacksAuth() {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();
  const { toast } = useToast();

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
        toast({
          description: "Looks like you haven't signed up. Creating your account...",
        });

        const { error: signUpError } = await supabase.auth.signUp({
          email: `${stxAddress}@stacks.id`,
          password: stxAddress,
        });

        if (signUpError) throw signUpError;

        toast({
          description: "Account created successfully! Redirecting to dashboard...",
          variant: "default",
        });

        return true;
      } else if (signInError) {
        throw signInError;
      }

      toast({
        description: "Signed in successfully! Redirecting to dashboard...",
        variant: "default",
      });

      return true;
    } catch (error) {
      console.error("Authentication error:", error);
      toast({
        description: "Authentication failed. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleAuth = async () => {
    setIsLoading(true);
    try {
      toast({
        description: "Connecting wallet...",
      });

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

      toast({
        description: "Wallet connected. Authenticating...",
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
      toast({
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
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
    </div>
  );
}
