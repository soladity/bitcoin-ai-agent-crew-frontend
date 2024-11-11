import React from "react";
import Dashboard from "@/components/dashboard/Dashboard";
import { SidebarProvider } from "@/components/ui/sidebar";

const page = () => {
  return (
    <div className="min-h-[80vh]">
      <SidebarProvider>
        <Dashboard />
      </SidebarProvider>
    </div>
  );
};

export default page;
