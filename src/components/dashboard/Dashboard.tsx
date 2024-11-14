"use client";

import DashboardChat from "./DashboardChat";

export default function Dashboard() {
  return (
    <div className="w-screen md:h-[98vh] h-[91vh]">
      <div className="flex h-full">
        <DashboardChat />
      </div>
    </div>
  );
}
