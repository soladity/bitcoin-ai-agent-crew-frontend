import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import Chat from "@/components/chat/Chat";

const page = () => {
  return (
    <SidebarProvider>
      <Chat />
    </SidebarProvider>
  );
};

export default page;
