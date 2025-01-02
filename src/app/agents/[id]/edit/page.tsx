"use client";

import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useAgent } from "@/hooks/use-agent";
import { AgentForm } from "@/components/agents/agent-form";

export const runtime = 'edge';

export default function AgentEditPage() {
  const params = useParams();
  const {
    loading,
    saving,
    formData,
    handleSubmit,
    handleChange,
  } = useAgent();

  if (loading) {
    return <div className="container mx-auto py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <Link href="/agents">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Agents
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {params.id && params.id !== "new" ? "Edit Agent" : "Create New Agent"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AgentForm
            formData={formData}
            saving={saving}
            onSubmit={handleSubmit}
            onChange={handleChange}
            onToolsChange={function (): void {
              throw new Error("Function not implemented.");
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
