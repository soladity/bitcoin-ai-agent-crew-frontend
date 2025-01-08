import { supabase } from "@/utils/supabase/client";
import { Agent } from "@/types/supabase";

export async function fetchAgents(): Promise<Agent[]> {
    const { data, error } = await supabase
        .from("agents")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching agents:", error);
        throw error;
    }

    return data || [];
} 