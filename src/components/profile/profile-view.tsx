import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface Profile {
  id: string;
  email: string;
  discord_username: string | null;
}

interface TelegramUser {
  id: string | null;
  telegram_user_id: string | null;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  is_registered: boolean;
  profile_id: string | null;
}

export function ProfileView() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [telegramLoading, setTelegramLoading] = useState(false);
  const [connectedNetwork, setConnectedNetwork] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        const { data: telegramData, error: telegramError } = await supabase
          .from("telegram_users")
          .select("*")
          .eq("profile_id", user.id)
          .single();

        if (!telegramError) {
          setTelegramUser(telegramData);
        }

        // Fetch connected network
        const network = process.env.NEXT_PUBLIC_STACKS_NETWORK;
        setConnectedNetwork(network || "Unknown");
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const initializeTelegramUser = async () => {
    try {
      setTelegramLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error: upsertError } = await supabase
        .from("telegram_users")
        .upsert({
          profile_id: user.id,
          is_registered: false,
        });

      if (upsertError) throw upsertError;

      const { data: telegramData } = await supabase
        .from("telegram_users")
        .select("*")
        .eq("profile_id", user.id)
        .single();

      setTelegramUser(telegramData);
    } catch (error) {
      console.error("Error initializing telegram user:", error);
    } finally {
      setTelegramLoading(false);
    }
  };

  const startTelegramBot = async () => {
    const botUsername =
      process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "aibtcdevbot";
    window.open(`https://t.me/${botUsername}?start=${telegramUser?.id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
        <Card className="border-none shadow-none bg-background/40 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-base sm:text-2xl font-medium">
              Wallet Information
            </CardTitle>
            <Separator className="my-2" />
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">
                Connected Wallet
              </label>
              <div className="font-mono text-sm bg-muted/30 p-2 rounded-md">
                {profile?.email
                  ? profile.email.split("@")[0].toUpperCase()
                  : "No wallet connected"}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">
                Connected Network
              </label>
              <div className="font-mono text-sm bg-muted/30 p-2 rounded-md">
                {connectedNetwork}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-none bg-background/40 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-base sm:text-2xl font-medium">
              Social Connections
            </CardTitle>
            <Separator className="my-2" />
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Discord</label>
              <div className="bg-muted/30 p-3 rounded-md space-y-2">
                <Badge
                  variant={profile?.discord_username ? "default" : "outline"}
                  className="text-xs"
                >
                  {profile?.discord_username ? "Connected" : "Not Connected"}
                </Badge>
                {profile?.discord_username && (
                  <p className="text-sm text-muted-foreground">
                    {profile.discord_username}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Telegram</label>
              {telegramUser ? (
                <div className="bg-muted/30 p-3 rounded-md space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        telegramUser.is_registered ? "default" : "outline"
                      }
                      className="text-xs"
                    >
                      {telegramUser.is_registered
                        ? "Connected"
                        : "Pending Registration"}
                    </Badge>
                  </div>
                  {telegramUser.is_registered && (
                    <p className="text-sm text-muted-foreground">
                      {telegramUser.username || "N/A"}
                    </p>
                  )}
                  {!telegramUser.is_registered && (
                    <Button
                      variant="ghost"
                      onClick={startTelegramBot}
                      disabled={!telegramUser}
                    >
                      Start Registration
                    </Button>
                  )}
                </div>
              ) : (
                <div className="mt-2">
                  <Button
                    variant="ghost"
                    onClick={initializeTelegramUser}
                    disabled={telegramLoading}
                  >
                    {telegramLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Initialize Telegram Connection
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
