import React from "react";
import { supabase } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { AppConfig, UserSession } from "@stacks/connect";
import { Button } from "../ui/button";

const SignOut = () => {
  const router = useRouter();
  const appConfig = new AppConfig(["store_write", "publish_data"]);
  const userSession = new UserSession({ appConfig });

  function disconnectWallet() {
    userSession.signUserOut("/");
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    disconnectWallet();
    router.push("/");
  }
  return (
    <div>
      <Button onClick={handleLogout}>Sign Out</Button>
    </div>
  );
};

export default SignOut;
