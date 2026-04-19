export type AgentStatus = 'working' | 'idle' | 'alarm' | 'ceo-calling';

export type Agent = {
  id: string;
  name: string;
  role: string;
  task: string;
  status: AgentStatus;
  avatar: string;
  _meta?: {
    modelName: string;
    providerName: string;
    taskCount: number;
  };
};

export type Message = {
  id: string;
  sender: 'ceo' | 'agent';
  text: string;
  timestamp: Date;
};

export type ActivityLog = {
  id: string;
  timestamp: Date;
  agentName: string;
  action: string;
};

export type Settings = {
  dashboardName: string;
  ceoName: string;
  autoReplyDelay: number;
  enableAlarms: boolean;
  soundOnQuestion: boolean;
  autoClearAlarms: boolean;
  showLiveFeed: boolean;
  animateConnections: boolean;
  showTaskSnippets: boolean;
};
