import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Agent } from "@/types/supabase";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface AgentDetailsPanelProps {
  agent: Agent;
}

export function AgentDetailsPanel({ agent }: AgentDetailsPanelProps) {
  const router = useRouter();

  return (
    <div className="h-full flex-1">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex justify-end mb-6">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 hover:bg-white/5"
            onClick={() => router.push(`/agents/${agent.id}/edit`)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-[300px_1fr] gap-12">
          <div className="flex-shrink-0">
            <div className="sticky top-8">
              <div className="aspect-square w-full overflow-hidden rounded-2xl border border-zinc-800/40 bg-zinc-900/50">
                <Image
                  src={agent.image_url || ""}
                  alt={agent.name}
                  unoptimized={true}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `https://avatar.vercel.sh/${agent.name}`;
                  }}
                />
              </div>
              <div className="mt-6 text-center">
                <h1 className="text-2xl font-medium tracking-tight text-zinc-100">
                  {agent.name}
                </h1>
                <p className="mt-2 text-base font-medium text-zinc-400">
                  {agent.role}
                </p>
              </div>
            </div>
          </div>

          <div className="min-w-0">
            <div className="space-y-12">
              <section>
                <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-400">
                  Goal
                </h2>
                <p className="mt-3 text-base leading-relaxed text-zinc-300">
                  {agent.goal}
                </p>
              </section>

              <section>
                <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-400">
                  Backstory
                </h2>
                <p className="mt-3 text-base leading-relaxed text-zinc-300 whitespace-pre-wrap">
                  {agent.backstory}
                </p>
              </section>

              <section>
                <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-400 mb-3">
                  Tools & Capabilities
                </h2>
                <div className="flex flex-wrap gap-2">
                  {agent.agent_tools?.map((tool) => (
                    <div
                      key={tool}
                      className="rounded-full bg-zinc-800/40 px-4 py-1 text-sm font-medium text-zinc-300"
                    >
                      {tool}
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
