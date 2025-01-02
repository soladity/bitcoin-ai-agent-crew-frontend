"use client";

import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAgent } from "@/hooks/use-agent";
import { AgentForm } from "@/components/agents/agent-form";
import { Loader } from "@/components/reusables/loader";

export const runtime = 'edge';

export default function AgentEditPage() {
  const params = useParams();
  const {
    loading,
    saving,
    formData,
    handleSubmit,
    handleChange,
    handleToolsChange,
  } = useAgent();

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="container mx-auto py-8">
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
            onToolsChange={handleToolsChange}
          />
        </CardContent>
      </Card>
    </div>
  );
}
