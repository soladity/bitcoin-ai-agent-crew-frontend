"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function CrewRedirect() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  useEffect(() => {
    router.push(`/crew/${id}/manage`);
  }, [id, router]);

  return <div>Redirecting to chat...</div>;
}
