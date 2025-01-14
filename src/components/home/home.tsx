"use client";

import React from "react";
import dynamic from "next/dynamic";
import Image from "next/image";

const SignIn = dynamic(() => import("../auth/auth-stacks"), {
  ssr: false,
});

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md p-4 sm:p-8 space-y-4 sm:space-y-6 bg-zinc-800 rounded-xl sm:rounded-2xl shadow-2xl border border-zinc-700">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2 ">
            {/* Avatar logo */}
            <Image
              alt="AIBTC.DEV"
              src={"/logos/aibtcdev-avatar-250px.png"}
              height={50}
              width={50}
              priority
              className="rounded-full"
            />
            {/* Text logo - made larger */}
            <Image
              alt="AIBTC.DEV"
              src={"/logos/aibtcdev-primary-logo-white-wide-1000px.png"}
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
            By connecting your wallet, you agree to our{" "}
            <a href="#" className="text-orange-500 hover:text-orange-400">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-orange-500 hover:text-orange-400">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
