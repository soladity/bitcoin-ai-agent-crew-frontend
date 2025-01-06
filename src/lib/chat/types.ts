export interface Message {
  agent_id: string | null;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string | null;
  status: 'sent' | 'processing' | 'end' | null;
  type?: 'task' | 'step' | 'result' | 'tool' | 'token' | 'message'| null;
  tool?: string;
  tool_input?: string;
  tool_output?: string;
}

export interface Conversation {
  id: string;
  title: string;
  last_message?: Message;
  created_at: Date;
  updated_at: Date;
  agent_id: string | null;
}

export interface Agent {
  id: string;
  name: string;
  image_url?: string;
  description?: string;
}
