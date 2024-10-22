"use client";

import React, { useState, useEffect } from "react";
import { AppConfig, showConnect, UserSession } from "@stacks/connect";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";

const appConfig = new AppConfig(["store_write", "publish_data"]);
const userSession = new UserSession({ appConfig });

export default function SignIn() {
  const [mounted, setMounted] = useState(false);
  const [stxAddress, setStxAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", content: "" });
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (stxAddress) {
      signIn();
    }
  }, [stxAddress]);

  const authenticateWallet = () => {
    setIsLoading(true);
    showConnect({
      appDetails: {
        name: "AIBTC Crew Generator",
        icon: window.location.origin + "/logos/aibtcdev-avatar-1000px.png",
      },
      redirectTo: "/",
      onFinish: () => {
        const userData = userSession.loadUserData();
        setStxAddress(userData.profile.stxAddress.mainnet);
      },
      userSession,
    });
  };

  const signIn = async () => {
    setIsLoading(true);
    setMessage({ type: "", content: "" });

    if (!stxAddress) {
      setMessage({
        type: "error",
        content: "Please connect your wallet first",
      });
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: `${stxAddress}@stacks.id`,
        password: stxAddress,
      });

      if (error) {
        throw error;
      }

      setMessage({
        type: "success",
        content: "Sign in successful! Redirecting to Dashboard....",
      });

      // Delay redirect to show success message
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (error) {
      setMessage({
        type: "error",
        content: "Sign in failed. Please make sure you've signed up first.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="mx-auto">Sign In</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button
            onClick={authenticateWallet}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {stxAddress ? "Signing In..." : "Connecting Wallet..."}
              </>
            ) : (
              "Connect Wallet to Sign In"
            )}
          </Button>
          {message.content && (
            <div
              className={`mt-4 flex items-center space-x-2 ${
                message.type === "error" ? "text-red-600" : "text-green-600"
              }`}
              role="alert"
            >
              {message.type === "error" ? (
                <AlertCircle className="h-5 w-5" aria-hidden="true" />
              ) : (
                <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
              )}
              <p>{message.content}</p>
            </div>
          )}
          <div className="text-center">
            <Link
              href="/sign-up"
              className="text-sm text-blue-600 hover:underline"
            >
              Don't have an account? Sign up
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
