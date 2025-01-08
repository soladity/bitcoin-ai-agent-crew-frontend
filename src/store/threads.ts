import { create } from "zustand";
import { Thread } from "@/lib/chat/types";
import { supabase } from "@/utils/supabase/client";

interface ThreadsState {
    threads: Thread[];
    isLoading: boolean;
    error: string | null;

    // Actions
    setThreads: (threads: Thread[]) => void;
    addThread: (thread: Thread) => void;
    removeThread: (threadId: string) => void;
    updateThread: (threadId: string, update: Partial<Thread>) => void;
    setLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
    fetchThreads: (userId: string) => Promise<void>;
}

export const useThreadsStore = create<ThreadsState>((set) => ({
    threads: [],
    isLoading: false,
    error: null,

    fetchThreads: async (profileId: string) => {
        try {
            set({ isLoading: true, error: null });

            const { data: threads, error } = await supabase
                .from('threads')
                .select('*')
                .eq('profile_id', profileId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            set({ threads: threads || [], isLoading: false });
        } catch (error) {
            console.error('Error fetching threads:', error);
            set({
                error: error instanceof Error ? error.message : 'Failed to fetch threads',
                isLoading: false
            });
        }
    },

    setThreads: (threads) => set({ threads }),

    addThread: (thread) =>
        set((state) => ({
            threads: [thread, ...state.threads], // Add new thread at the beginning
        })),

    removeThread: (threadId) =>
        set((state) => ({
            threads: state.threads.filter((thread) => thread.id !== threadId),
        })),

    updateThread: (threadId, update) =>
        set((state) => ({
            threads: state.threads.map((thread) =>
                thread.id === threadId ? { ...thread, ...update } : thread
            ),
        })),

    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
})); 