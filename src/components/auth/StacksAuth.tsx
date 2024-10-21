"use client";

import React, { useState, useEffect } from "react";
import { AppConfig, showConnect, UserSession } from "@stacks/connect";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle2 } from "lucide-react";

const appConfig = new AppConfig(["store_write", "publish_data"]);
const userSession = new UserSession({ appConfig });

export default function StacksAuth() {
  const [mounted, setMounted] = useState(false);
  const [stxAddress, setStxAddress] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", content: "" });
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const authenticateWallet = () => {
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

  const signUp = async () => {
    setIsLoading(true);
    setMessage({ type: "", content: "" });

    if (!stxAddress || !username) {
      setMessage({
        type: "error",
        content: "STX address and username are required",
      });
      setIsLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email: `${stxAddress}@stacks.id`,
      password: stxAddress,
      options: {
        data: {
          stxAddress: `${stxAddress}@stacks.id`,
          username: username,
        },
      },
    });

    if (error) {
      setMessage({ type: "error", content: error.message });
    } else {
      setMessage({
        type: "success",
        content:
          "Sign up successful! You can now sign in with your connected wallet.",
      });
    }

    setIsLoading(false);
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

    const { error } = await supabase.auth.signInWithPassword({
      email: `${stxAddress}@stacks.id`,
      password: stxAddress,
    });

    if (error) {
      setMessage({
        type: "error",
        content: "Sign in failed. Please make sure you've signed up first.",
      });
    } else {
      setMessage({
        type: "success",
        content: "Sign in successful! Redirecting to Dashboard....",
      });
      router.push("/dashboard");
    }

    setIsLoading(false);
  };

  if (!mounted) return null;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Stacks Authentication</CardTitle>
        <CardDescription>
          Sign up or sign in with your Stacks wallet
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="signup" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
            <TabsTrigger value="signin">Sign In</TabsTrigger>
          </TabsList>
          <TabsContent value="signup">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="stx-address-signup">STX Address</Label>
                <Input
                  id="stx-address-signup"
                  value={stxAddress}
                  readOnly
                  placeholder="Connect your wallet to get STX address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                />
              </div>
              {!stxAddress ? (
                <Button onClick={authenticateWallet} className="w-full">
                  Connect Wallet
                </Button>
              ) : (
                <Button
                  onClick={signUp}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? "Signing Up..." : "Sign Up"}
                </Button>
              )}
            </div>
          </TabsContent>
          <TabsContent value="signin">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="stx-address-signin">STX Address</Label>
                <Input
                  id="stx-address-signin"
                  value={stxAddress}
                  readOnly
                  placeholder="Connect your wallet to get STX address"
                />
              </div>
              {!stxAddress ? (
                <Button onClick={authenticateWallet} className="w-full">
                  Connect Wallet
                </Button>
              ) : (
                <Button
                  onClick={signIn}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              )}
            </div>
          </TabsContent>
        </Tabs>
        {message.content && (
          <div
            className={`mt-4 flex items-center space-x-2 ${
              message.type === "error" ? "text-red-600" : "text-green-600"
            }`}
          >
            {message.type === "error" ? (
              <AlertCircle className="h-5 w-5" />
            ) : (
              <CheckCircle2 className="h-5 w-5" />
            )}
            <p>{message.content}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
