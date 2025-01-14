"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AgentForm } from "@/components/agents/agent-form";
import { Agent } from "@/types/supabase";
import { supabase } from "@/utils/supabase/client";
import { useSessionStore } from "@/store/session";
import { useWalletStore } from "@/store/wallet";

// Loading Modal Component
const LoadingModal = () => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-zinc-900 p-6 rounded-lg shadow-xl">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-zinc-200"></div>
        <p className="text-zinc-200">Creating Agent and Setting Up Wallet...</p>
      </div>
    </div>
  </div>
);

export default function NewAgentPage() {
  const router = useRouter();
  const { userId } = useSessionStore();
  const fetchWallets = useWalletStore((state) => state.fetchWallets);
  const [stxAddresses, setStxAddresses] = useState<{
    testnet: string;
    mainnet: string;
  }>({ testnet: "", mainnet: "" });

  const [agent, setAgent] = useState<Partial<Agent>>({
    name: "",
    role: "",
    goal: "",
    backstory: "",
    image_url: "",
    profile_id: userId || "",
    agent_tools: [],
  });
  const [saving, setSaving] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);

  useEffect(() => {
    try {
      const blockstackSession = localStorage.getItem("blockstack-session");
      if (blockstackSession) {
        const sessionData = JSON.parse(blockstackSession);
        const addresses = sessionData?.userData?.profile?.stxAddress;
        if (addresses) {
          setStxAddresses({
            testnet: addresses.testnet,
            mainnet: addresses.mainnet,
          });
        }
      }
    } catch (error) {
      console.error("Error reading blockstack session:", error);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Create combined name for image URL only
    const imageUrlName = `${agent.name}_${
      process.env.NEXT_PUBLIC_STACKS_NETWORK === "mainnet"
        ? stxAddresses.mainnet
        : stxAddresses.testnet
    }`;
    const updatedAgent = {
      ...agent,
      image_url: `https://bitcoinfaces.xyz/api/get-image?name=${encodeURIComponent(
        imageUrlName
      )}`,
    };

    setSaving(true);
    setShowLoadingModal(true);
    try {
      const { error } = await supabase.from("agents").insert(updatedAgent);

      if (error) throw error;

      // Add delay and fetch wallets
      if (userId) {
        // Wait for 3 seconds before fetching wallets
        await new Promise((resolve) => setTimeout(resolve, 3000));
        await fetchWallets(userId);
      }

      router.push("/agents");
    } catch (error) {
      console.error("Error creating agent:", error);
    } finally {
      setSaving(false);
      setShowLoadingModal(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setAgent((prev) => ({ ...prev, [name]: value }));
  };

  const handleToolsChange = (tools: string[]) => {
    setAgent((prev) => ({ ...prev, agent_tools: tools }));
  };

  return (
    <>
      {showLoadingModal && <LoadingModal />}
      <aside className="h-full flex-1 border-r border-zinc-800/40 bg-black/10 flex flex-col">
        <div className="p-4 border-b border-zinc-800/40">
          <h2 className="text-sm font-medium text-zinc-200">New Agent</h2>
        </div>

        <div className="flex-grow overflow-auto p-4">
          <AgentForm
            formData={agent}
            saving={saving}
            onSubmit={handleSubmit}
            onChange={handleChange}
            onToolsChange={handleToolsChange}
          />
        </div>
      </aside>
    </>
  );
}
