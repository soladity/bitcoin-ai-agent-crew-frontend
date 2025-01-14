"use client";

import React from "react";
import dynamic from "next/dynamic";

// Dynamically import SignIn component with ssr: false
const SignIn = dynamic(() => import("../auth/auth-stacks"), {
  ssr: false,
});

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-zinc-800 rounded-2xl shadow-2xl border border-zinc-700">
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-medium tracking-tight text-white">
            <span className="font-bold bg-gradient-to-r from-orange-500 to-orange-400 text-transparent bg-clip-text">
              AIBTCDEV
            </span>
          </h1>
          <p className="text-zinc-400 text-sm">
            Connect your wallet to get started
          </p>
        </div>

        <div className="space-y-4">
          <SignIn />

          <p className="text-center text-xs text-zinc-400 mt-4">
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
