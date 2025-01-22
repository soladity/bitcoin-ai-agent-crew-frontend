"use client";

import React from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { PrivacyPolicy } from "../terms-and-condition/privacy-policy";
import { TermsOfService } from "../terms-and-condition/terms-of-service";

const SignIn = dynamic(() => import("../auth/auth-stacks"), {
  ssr: false,
});

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md p-4 sm:p-8 space-y-4 sm:space-y-6 bg-zinc-800 rounded-xl sm:rounded-2xl shadow-2xl border border-zinc-700">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2 ">
            <Image
              alt="AIBTC.DEV"
              src="/logos/aibtcdev-avatar-250px.png"
              height={50}
              width={50}
              priority
              className="rounded-full"
            />
            <Image
              alt="AIBTC.DEV"
              src="/logos/aibtcdev-primary-logo-white-wide-1000px.png"
              height={100}
              width={300}
              priority
              className="w-64 sm:w-80 h-auto object-contain"
            />
          </div>
          <p className="text-zinc-400 text-xs sm:text-sm">
            Connect your wallet to get started
          </p>
        </div>

        <div className="space-y-4">
          <SignIn />

          <p className="text-center text-xs text-zinc-400 mt-4 px-2 sm:px-0">
            By connecting your wallet, you agree to the{" "}
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="link"
                  className="text-orange-500 hover:text-orange-400 p-0"
                >
                  Terms of Service
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[800px] h-[90vh] overflow-auto">
                <DialogHeader>
                  <DialogTitle className="text-3xl font-bold">
                    Terms of Service
                  </DialogTitle>
                </DialogHeader>
                <DialogDescription>
                  Please read our Terms of Service carefully.
                </DialogDescription>
                <TermsOfService />
              </DialogContent>
            </Dialog>{" "}
            and{" "}
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="link"
                  className="text-orange-500 hover:text-orange-400 p-0"
                >
                  Privacy Policy
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[800px] h-[90vh] overflow-auto">
                <DialogHeader>
                  <DialogTitle className="text-3xl font-bold">
                    Privacy Policy
                  </DialogTitle>
                </DialogHeader>
                <DialogDescription>
                  Please read our Privacy Policy carefully.
                </DialogDescription>
                <PrivacyPolicy />
              </DialogContent>
            </Dialog>
          </p>
        </div>
      </div>
    </div>
  );
}
