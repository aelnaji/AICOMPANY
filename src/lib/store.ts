import { create } from "zustand";

export type AppPage = "dashboard" | "team" | "tasks" | "connectors" | "providers" | "models" | "settings" | "ide";
export type CenterTab = "editor" | "canvas" | "analytics";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export interface FileNode {
  id: string;
  name: string;
  kind: 'file' | 'directory';
  handle?: FileSystemFileHandle | FileSystemDirectoryHandle;
  children?: FileNode[];
  content?: string;
}

export interface OrchestrationLog {
  id: string;
  timestamp: Date;
  agentId: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface Delegation {
  id: string;
  from: string;
  to: string;
  task: string;
  status: 'pending' | 'active' | 'completed';
}

interface AppState {
  currentPage: AppPage;
  selectedAgentId: string | null;
  chatMessages: Record<string, ChatMessage[]>;
  isChatOpen: boolean;
  isAgentWorking: Record<string, boolean>;

  // IDE / File System State
  rootHandle: FileSystemDirectoryHandle | null;
  fileTree: FileNode[];
  openFiles: string[];
  activeFileId: string | null;
  activeCenterTab: CenterTab;
  sidebarTab: "files" | "agents";
  orchestrationTab: "chat" | "tasks";

  // Orchestration State
  orchestrationLogs: OrchestrationLog[];
  delegations: Delegation[];
  pendingApprovals: { id: string; title: string; agentId: string }[];
  lastApprovalResult: { id: string; approved: boolean; timestamp: number } | null;

  setCurrentPage: (page: AppPage) => void;
  setSelectedAgentId: (id: string | null) => void;
  addChatMessage: (agentId: string, message: ChatMessage) => void;
  updateChatMessage: (agentId: string, messageId: string, content: string) => void;
  setChatOpen: (open: boolean) => void;
  setIsAgentWorking: (agentId: string, working: boolean) => void;

  // IDE Actions
  setRootHandle: (handle: FileSystemDirectoryHandle | null) => void;
  setFileTree: (tree: FileNode[]) => void;
  openFile: (fileId: string) => void;
  closeFile: (fileId: string) => void;
  setActiveFileId: (fileId: string | null) => void;
  setActiveCenterTab: (tab: CenterTab) => void;
  setSidebarTab: (tab: "files" | "agents") => void;
  setOrchestrationTab: (tab: "chat" | "tasks") => void;

  // Orchestration Actions
  addOrchestrationLog: (log: Omit<OrchestrationLog, 'id' | 'timestamp'>) => void;
  addDelegation: (delegation: Omit<Delegation, 'id'>) => void;
  updateDelegationStatus: (id: string, status: Delegation['status']) => void;
  addPendingApproval: (approval: { id: string; title: string; agentId: string }) => void;
  resolveApproval: (id: string, approved: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentPage: "ide",
  selectedAgentId: null,
  chatMessages: {},
  isChatOpen: false,
  isAgentWorking: {},

  rootHandle: null,
  fileTree: [],
  openFiles: [],
  activeFileId: null,
  activeCenterTab: "editor",
  sidebarTab: "files",
  orchestrationTab: "chat",

  orchestrationLogs: [],
  delegations: [],
  pendingApprovals: [],
  lastApprovalResult: null,

  setCurrentPage: (page) => set({ currentPage: page }),
  setSelectedAgentId: (id) =>
    set(() => ({
      selectedAgentId: id,
      isChatOpen: id !== null,
      orchestrationTab: id !== null ? 'chat' : 'tasks',
    })),
  addChatMessage: (agentId, message) =>
    set((state) => ({
      chatMessages: {
        ...state.chatMessages,
        [agentId]: [...(state.chatMessages[agentId] || []), message],
      },
    })),
  updateChatMessage: (agentId, messageId, content) =>
    set((state) => ({
      chatMessages: {
        ...state.chatMessages,
        [agentId]: (state.chatMessages[agentId] || []).map((m) =>
          m.id === messageId ? { ...m, content } : m
        ),
      },
    })),
  setChatOpen: (open) => set({ isChatOpen: open }),
  setIsAgentWorking: (agentId, working) =>
    set((state) => ({
      isAgentWorking: { ...state.isAgentWorking, [agentId]: working },
    })),

  setRootHandle: (handle) => set({ rootHandle: handle }),
  setFileTree: (tree) => set({ fileTree: tree }),
  openFile: (fileId) => set((state) => ({
    openFiles: state.openFiles.includes(fileId) ? state.openFiles : [...state.openFiles, fileId],
    activeFileId: fileId
  })),
  closeFile: (fileId) => set((state) => {
    const newOpenFiles = state.openFiles.filter(id => id !== fileId);
    return {
      openFiles: newOpenFiles,
      activeFileId: state.activeFileId === fileId ? (newOpenFiles[newOpenFiles.length - 1] || null) : state.activeFileId
    };
  }),
  setActiveFileId: (fileId) => set({ activeFileId: fileId }),
  setActiveCenterTab: (tab) => set({ activeCenterTab: tab }),
  setSidebarTab: (tab) => set({ sidebarTab: tab }),
  setOrchestrationTab: (tab) => set({ orchestrationTab: tab }),

  addOrchestrationLog: (log) => set((state) => ({
    orchestrationLogs: [
      ...state.orchestrationLogs,
      { ...log, id: crypto.randomUUID(), timestamp: new Date() }
    ].slice(-100)
  })),
  addDelegation: (delegation) => set((state) => ({
    delegations: [...state.delegations, { id: crypto.randomUUID(), ...delegation }]
  })),
  updateDelegationStatus: (id, status) => set((state) => ({
    delegations: state.delegations.map(d => d.id === id ? { ...d, status } : d)
  })),
  addPendingApproval: (approval) => set((state) => ({
    pendingApprovals: [...state.pendingApprovals, approval]
  })),
  resolveApproval: (id, approved) => set((state) => ({
    pendingApprovals: state.pendingApprovals.filter(a => a.id !== id),
    lastApprovalResult: { id, approved, timestamp: Date.now() }
  })),
}));
