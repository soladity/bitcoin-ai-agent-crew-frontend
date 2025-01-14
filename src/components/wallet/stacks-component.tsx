"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BsRobot } from "react-icons/bs";
import { STACKS_TESTNET } from "@stacks/network";
import { openSTXTransfer } from "@stacks/connect";

interface StacksComponentsProps {
  address: string;
  amount: string;
  onAmountChange: (value: string) => void;
  onToast: (
    title: string,
    description?: string,
    variant?: "default" | "destructive"
  ) => void;
}

export default function StacksComponents({
  address,
  amount,
  onAmountChange,
  onToast,
}: StacksComponentsProps) {
  const sendSTX = (recipientAddress: string, amountInSTX: string) => {
    // CHANGE IT TO MAINNET....
    const network = STACKS_TESTNET;

    openSTXTransfer({
      recipient: recipientAddress,
      amount: amountInSTX,
      memo: "Agent funding",
      network: network,
      onFinish: (data) => {
        const explorerUrl = `https://explorer.stacks.co/txid/${data.txId}`;
        onToast(
          "Success",
          "Transfer sent to agent, funds will arrive soon.",
          "default"
        );
        return {
          txId: data.txId,
          explorerUrl: explorerUrl,
          rawTx: data.txRaw,
        };
      },
      onCancel: () => {
        onToast("Transaction Canceled");
      },
    });
  };

  const handleSendSTX = () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      onToast("Please enter a valid STX amount", undefined, "destructive");
      return;
    }
    // Convert STX to microSTX (1 STX = 1,000,000 microSTX)
    const microSTX = (Number(amount) * 1_000_000).toString();
    sendSTX(address, microSTX);
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        type="text"
        placeholder="Amount in STX"
        value={amount}
        onChange={(e) => onAmountChange(e.target.value)}
        className="w-32 text-sm"
        required
      />
      <Button
        size="sm"
        onClick={handleSendSTX}
        className="text-zinc-400 hover:text-white"
      >
        <BsRobot className="h-4 w-4 mr-2" />
        Fund Agent
      </Button>
    </div>
  );
}
