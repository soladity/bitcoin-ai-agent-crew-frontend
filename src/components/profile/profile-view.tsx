import { useCallback, useEffect, useState } from "react";
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
  const [shouldCheckTelegramStatus, setShouldCheckTelegramStatus] =
    useState(false);
  const [telegramStatusCheckCount, setTelegramStatusCheckCount] = useState(0);

  // Load profile on component mount
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
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  // Initialize Telegram User
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

  // Check Telegram Status
  const checkTelegramStatus = useCallback(async () => {
    console.log("Checking Telegram status...");
    if (telegramStatusCheckCount >= 2) {
      console.log("Max check count reached. Stopping checks.");
      setShouldCheckTelegramStatus(false);
      return;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        console.log("No user found");
        return;
      }

      const { data: telegramData, error: telegramError } = await supabase
        .from("telegram_users")
        .select("*")
        .eq("profile_id", user.id)
        .single();

      if (!telegramError) {
        console.log("Telegram user data:", telegramData);
        setTelegramUser(telegramData);

        if (telegramData.is_registered) {
          console.log("Telegram registration completed!");
          setShouldCheckTelegramStatus(false); // Stop checking if registered
        } else {
          setTelegramStatusCheckCount((prevCount) => {
            if (prevCount + 1 < 2) {
              setTimeout(checkTelegramStatus, 5000); // Check again in 5 seconds
            }
            return prevCount + 1;
          });
        }
      } else {
        console.error("Error fetching Telegram user:", telegramError);
      }
    } catch (error) {
      console.error("Error checking Telegram status:", error);
    }
  }, [telegramStatusCheckCount]);

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && shouldCheckTelegramStatus) {
        console.log("Tab became visible, checking Telegram status");

        if (telegramStatusCheckCount < 2) {
          checkTelegramStatus();
        } else {
          console.log("Max check count reached. Stopping further checks.");
          setShouldCheckTelegramStatus(false);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [
    shouldCheckTelegramStatus,
    telegramStatusCheckCount,
    checkTelegramStatus,
  ]);

  // Start Telegram Bot
  const startTelegramBot = () => {
    console.log("Starting Telegram bot registration");
    setShouldCheckTelegramStatus(true);
    setTelegramStatusCheckCount(0);

    const botUsername =
      process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "aibtcdevbot";
    window.open(
      `https://t.me/${botUsername}?start=${telegramUser?.id}`,
      "_blank"
    );

    setTimeout(checkTelegramStatus, 5000); // Initial check after 5 seconds
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
                  {telegramUser.is_registered ? (
                    <p className="text-sm text-muted-foreground">
                      {telegramUser.username || "N/A"}
                    </p>
                  ) : (
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
