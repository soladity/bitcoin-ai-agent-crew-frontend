import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";

interface Conversation {
  id: string;
  name: string;
  created_at: string;
}

export function useConversation(conversationId: string) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchConversation = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("conversations")
          .select("*")
          .eq("id", conversationId)
          .single();

        if (error) {
          throw error;
        }

        setConversation(data);
      } catch (err) {
        setError(err as Error);
        console.error("Error fetching conversation:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (conversationId) {
      fetchConversation();
    }
  }, [conversationId]);

  const clearConversation = async () => {
    try {
      await supabase.from("conversations").delete().eq("id", conversationId);
      setConversation(null);
    } catch (err) {
      console.error("Error clearing conversation:", err);
      throw err;
    }
  };

  const updateConversation = async (updates: Partial<Conversation>) => {
    try {
      const { data, error } = await supabase
        .from("conversations")
        .update(updates)
        .eq("id", conversationId)
        .select()
        .single();

      if (error) throw error;
      if (data) setConversation(data);
      
      return data;
    } catch (err) {
      console.error("Error updating conversation:", err);
      throw err;
    }
  };

  return {
    conversation,
    isLoading,
    error,
    clearConversation,
    updateConversation
  };
}
