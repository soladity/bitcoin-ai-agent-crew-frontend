import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, Settings2, PiggyBank, Vault, Copy } from "lucide-react";

interface Capability {
  id: string;
  type: string;
  contract_principal: string;
  description?: string;
  symbol?: string;
  decimals?: number;
  max_supply?: string;
}

interface CollectiveCapabilitiesProps {
  capabilities: Capability[];
}

export function CollectiveCapabilities({ capabilities }: CollectiveCapabilitiesProps) {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold mb-4">Capabilities</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {capabilities?.map((capability) => (
          <Card key={capability.id} className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                {capability.type === "token" && <Coins className="h-6 w-6" />}
                {capability.type === "governance" && <Settings2 className="h-6 w-6" />}
                {capability.type === "dex" && <PiggyBank className="h-6 w-6" />}
                {capability.type === "treasury" && <Vault className="h-6 w-6" />}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold capitalize">{capability.type}</h3>
                {capability.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {capability.description}
                  </p>
                )}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-muted px-2 py-1 rounded flex-1 truncate">
                      {capability.contract_principal}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(capability.contract_principal)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  {capability.type === "token" && (
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      {capability.symbol && (
                        <div>
                          <p className="text-sm text-muted-foreground">Symbol</p>
                          <p className="font-medium">{capability.symbol}</p>
                        </div>
                      )}
                      {capability.decimals && (
                        <div>
                          <p className="text-sm text-muted-foreground">Decimals</p>
                          <p className="font-medium">{capability.decimals}</p>
                        </div>
                      )}
                      {capability.max_supply && (
                        <div>
                          <p className="text-sm text-muted-foreground">Max Supply</p>
                          <p className="font-medium">{capability.max_supply}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
