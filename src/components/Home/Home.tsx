"use client";

import React from "react";
// import Authentication from "../auth/Authentication"; #FOR GITHUB AUTH
import SignIn from "../auth/StacksAuth";

export default function Home() {
  return (
    <div className="relative h-screen w-full bg-black flex flex-col items-center justify-center overflow-hidden">
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center space-y-8">
        <h1 className="text-4xl md:text-6xl lg:text-8xl font-bold text-center text-white">
          AIBTC.DEV
        </h1>

        <div className="w-full max-w-md px-4">
          {/* Authentication component */}
          <div className="pt-4">
            <SignIn />
          </div>
        </div>
      </div>
    </div>
  );
}
