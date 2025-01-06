import { create } from 'zustand';
import { supabase } from '@/utils/supabase/client';

interface SessionState {
  accessToken: string | null;
  userId: string | null;
  isLoading: boolean;
  error: Error | null;
  initialize: () => Promise<void>;
  setSession: (token: string | null, userId: string | null) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  accessToken: null,
  userId: null,
  isLoading: true,
  error: null,

  initialize: async () => {
    try {
      set({ isLoading: true, error: null });
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      if (session) {
        set({
          accessToken: session.access_token,
          userId: session.user.id,
          isLoading: false,
        });
      } else {
        set({
          accessToken: null,
          userId: null,
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        error: error as Error,
        isLoading: false,
      });
    }
  },

  setSession: (token, userId) => {
    set({
      accessToken: token,
      userId: userId,
      error: null,
    });
  },

  clearSession: () => {
    set({
      accessToken: null,
      userId: null,
      error: null,
    });
  },
}));
