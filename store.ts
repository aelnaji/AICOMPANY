import { create } from "zustand";

export type AppPage = "team" | "tasks" | "providers" | "models" | "settings";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface AppState {
  currentPage: AppPage;
  selectedAgentId: string | null;
  chatMessages: Record<string, ChatMessage[]>;
  isChatOpen: boolean;
  isAgentWorking: Record<string, boolean>;
  
  setCurrentPage: (page: AppPage) => void;
  setSelectedAgentId: (id: string | null) => void;
  addChatMessage: (agentId: string, message: ChatMessage) => void;
  updateChatMessage: (agentId: string, messageId: string, content: string) => void;
  setChatOpen: (open: boolean) => void;
  setIsAgentWorking: (agentId: string, working: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentPage: "team",
  selectedAgentId: null,
  chatMessages: {},
  isChatOpen: false,
  isAgentWorking: {},
  
  setCurrentPage: (page) => set({ currentPage: page }),
  setSelectedAgentId: (id) => set((state) => ({
    selectedAgentId: id,
    isChatOpen: id !== null,
  })),
  addChatMessage: (agentId, message) => set((state) => ({
    chatMessages: {
      ...state.chatMessages,
      [agentId]: [...(state.chatMessages[agentId] || []), message],
    },
  })),
  updateChatMessage: (agentId, messageId, content) => set((state) => ({
    chatMessages: {
      ...state.chatMessages,
      [agentId]: (state.chatMessages[agentId] || []).map((m) =>
        m.id === messageId ? { ...m, content } : m
      ),
    },
  })),
  setChatOpen: (open) => set({ isChatOpen: open }),
  setIsAgentWorking: (agentId, working) => set((state) => ({
    isAgentWorking: { ...state.isAgentWorking, [agentId]: working },
  })),
}));
