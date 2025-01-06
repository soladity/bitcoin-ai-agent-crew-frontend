import { useEffect, useState } from "react";
import { useToast } from "./use-toast";
import { supabase } from "@/utils/supabase/client";
import { Conversation } from "@/types/supabase";

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setConversations(data || []);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createConversation = async (profileId: string) => {
    try {
      const { data, error } = await supabase
        .from("conversations")
        .insert([
          {
            profile_id: profileId,
            name: "New Conversation",
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      setConversations((prev) => [data, ...prev]);
      return data;
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast({
        title: "Error",
        description: "Failed to create new conversation",
        variant: "destructive",
      });
      return null;
    }
  };

  return {
    conversations,
    loading,
    createConversation,
    refreshConversations: fetchConversations,
  };
}
