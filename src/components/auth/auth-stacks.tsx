"use client";

import React, { useState, useEffect } from "react";
import { AppConfig, showConnect, UserSession, openSignatureRequestPopup } from "@stacks/connect";
import { supabase } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { STACKS_MAINNET } from "@stacks/network";

const appConfig = new AppConfig(["store_write", "publish_data"]);
const userSession = new UserSession({ appConfig });

export default function StacksAuth() {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAuthentication = async (stxAddress: string, signature: string) => {
    try {
      console.log(signature);
      // Try to sign in first
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: `${stxAddress}@stacks.id`,
        password: signature,
      });

      if (signInError && signInError.status === 400) {
        // User doesn't exist, proceed with sign up
        toast({
          description: "Creating your account...",
        });

        const { error: signUpError } = await supabase.auth.signUp({
          email: `${stxAddress}@stacks.id`,
          password: signature,
        });

        if (signUpError) throw signUpError;

        toast({
          description: "Successfully signed up...",
          variant: "default",
        });

        return true;
      } else if (signInError) {
        throw signInError;
      }

      toast({
        description: "Redirecting to dashboard...",
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
            name: "AIBTC",
            icon: "https://bncytzyfafclmdxrwpgq.supabase.co/storage/v1/object/public/aibtcdev/aibtcdev-avatar-250px.png",
          },
          onCancel: () => {
            toast({
              description: "Wallet connection cancelled.",
            });
            setIsLoading(false);
          },
          onFinish: () => resolve(),
          userSession,
        });
      });

      const userData = userSession.loadUserData();
      const stxAddress = userData.profile.stxAddress.mainnet;

      // Request signature
      toast({
        description: "Please sign the message to authenticate...",
      });

      let signature: string;
      await new Promise<void>((resolve, reject) => {
        openSignatureRequestPopup({
          message: "Please sign the message to authenticate.",
          network: STACKS_MAINNET,
          appDetails: {
            name: "AIBTC",
            icon: "https://bncytzyfafclmdxrwpgq.supabase.co/storage/v1/object/public/aibtcdev/aibtcdev-avatar-250px.png",
          },
          onFinish: (data) => {
            signature = data.signature.slice(0, 72);
            console.log(data);
            console.log('Trimmed signature:', signature);
            resolve();
          },
          onCancel: () => {
            reject(new Error("Signature request cancelled"));
          },
        });
      });

      toast({
        description: "Signature received. Authenticating...",
      });

      const success = await handleAuthentication(stxAddress, signature!);

      if (success) {
        // Delay redirect to show success message
        setTimeout(() => {
          router.push("/chat");
        }, 2000);
      }
    } catch (error) {
      console.error("Authentication error:", error);
      toast({
        description: "Authentication failed. Please try again.",
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
        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-lg font-bold transition-all duration-200 border-0"
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
