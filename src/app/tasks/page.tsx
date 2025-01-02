"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/hooks/use-profile";

export default function TasksPage() {
  const router = useRouter();
  const { user } = useProfile();

  useEffect(() => {
    // Redirect to the first agent's tasks page
    // You might want to fetch the user's first agent ID here
    if (user?.id) {
      router.replace("/agents");
    }
  }, [router, user]);

  return null; // or a loading spinner
}
