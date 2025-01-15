import { Metadata } from "next";
import { DAOLayoutClient } from "./layout-client";
import { supabase } from "@/utils/supabase/client";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const { data: dao } = await supabase
    .from("daos")
    .select("name")
    .eq("id", params.id)
    .single();

  return {
    title: dao?.name ? `${dao.name} - DAO Details` : "DAO Details",
  };
}

export default function DAOLayout({ children }: { children: React.ReactNode }) {
  return <DAOLayoutClient>{children}</DAOLayoutClient>;
}
