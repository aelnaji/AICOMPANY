export type ConnectorField = {
  key: string;
  label: string;
  type: 'text' | 'secret' | 'number' | 'textarea';
  placeholder?: string;
  required?: boolean;
};

export type ConnectorDef = {
  key: string;
  name: string;
  description: string;
  category: string;
  emoji: string;
  fields: ConnectorField[];
};

export const CATEGORIES = [
  { key: 'all',       label: 'All' },
  { key: 'ai',        label: 'AI' },
  { key: 'database',  label: 'Database' },
  { key: 'storage',   label: 'Storage' },
  { key: 'devtools',  label: 'Dev Tools' },
  { key: 'messaging', label: 'Messaging' },
  { key: 'other',     label: 'Other' },
];

export const CATEGORY_COLORS: Record<string, string> = {
  ai:        'text-[#a78bfa] bg-[#a78bfa]/10 border-[#a78bfa]/20',
  database:  'text-[#38bdf8] bg-[#38bdf8]/10 border-[#38bdf8]/20',
  storage:   'text-[#fb923c] bg-[#fb923c]/10 border-[#fb923c]/20',
  devtools:  'text-[#22c55e] bg-[#22c55e]/10 border-[#22c55e]/20',
  messaging: 'text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/20',
  other:     'text-[#8b949e] bg-[#1e2430]    border-[#30363d]',
};

export const connectorRegistry: ConnectorDef[] = [
  // ── AI ────────────────────────────────────────────────────────────────────
  {
    key: 'openai',
    name: 'OpenAI',
    description: 'GPT-4o, GPT-4, GPT-3.5 and more via OpenAI API',
    category: 'ai',
    emoji: '🤖',
    fields: [
      { key: 'apiKey',  label: 'API Key',  type: 'secret', placeholder: 'sk-...', required: true },
      { key: 'baseUrl', label: 'Base URL', type: 'text',   placeholder: 'https://api.openai.com/v1' },
    ],
  },
  {
    key: 'anthropic',
    name: 'Anthropic',
    description: 'Claude 3.5 Sonnet, Claude 3 Opus and other models',
    category: 'ai',
    emoji: '🧠',
    fields: [
      { key: 'apiKey', label: 'API Key', type: 'secret', placeholder: 'sk-ant-...', required: true },
    ],
  },
  {
    key: 'ollama',
    name: 'Ollama',
    description: 'Run local LLMs (Llama, Mistral, Qwen, etc.)',
    category: 'ai',
    emoji: '🦙',
    fields: [
      { key: 'baseUrl', label: 'Base URL', type: 'text', placeholder: 'http://localhost:11434', required: true },
    ],
  },
  {
    key: 'groq',
    name: 'Groq',
    description: 'Ultra-fast LLM inference via Groq Cloud',
    category: 'ai',
    emoji: '⚡',
    fields: [
      { key: 'apiKey', label: 'API Key', type: 'secret', placeholder: 'gsk_...', required: true },
    ],
  },
  {
    key: 'mistral',
    name: 'Mistral AI',
    description: 'Mistral 7B, Mixtral, Mistral Large',
    category: 'ai',
    emoji: '🌪️',
    fields: [
      { key: 'apiKey', label: 'API Key', type: 'secret', placeholder: 'your-key', required: true },
    ],
  },
  {
    key: 'nvidia_nim',
    name: 'NVIDIA NIM',
    description: 'NVIDIA NIM inference microservices',
    category: 'ai',
    emoji: '🟢',
    fields: [
      { key: 'baseUrl', label: 'Base URL', type: 'text',   placeholder: 'http://localhost:8000/v1', required: true },
      { key: 'apiKey',  label: 'API Key',  type: 'secret', placeholder: 'nvapi-...' },
    ],
  },
  // ── DATABASE ──────────────────────────────────────────────────────────────
  {
    key: 'postgres',
    name: 'PostgreSQL',
    description: 'Connect to a PostgreSQL database',
    category: 'database',
    emoji: '🐘',
    fields: [
      { key: 'connectionString', label: 'Connection String', type: 'secret', placeholder: 'postgresql://user:pass@host:5432/db', required: true },
    ],
  },
  {
    key: 'mysql',
    name: 'MySQL',
    description: 'Connect to a MySQL / MariaDB database',
    category: 'database',
    emoji: '🐬',
    fields: [
      { key: 'connectionString', label: 'Connection String', type: 'secret', placeholder: 'mysql://user:pass@host:3306/db', required: true },
    ],
  },
  {
    key: 'mongodb',
    name: 'MongoDB',
    description: 'Connect to a MongoDB cluster',
    category: 'database',
    emoji: '🍃',
    fields: [
      { key: 'connectionString', label: 'Connection String', type: 'secret', placeholder: 'mongodb+srv://...', required: true },
    ],
  },
  {
    key: 'redis',
    name: 'Redis',
    description: 'Key-value store and cache',
    category: 'database',
    emoji: '🔴',
    fields: [
      { key: 'url', label: 'Redis URL', type: 'secret', placeholder: 'redis://localhost:6379', required: true },
    ],
  },
  // ── STORAGE ───────────────────────────────────────────────────────────────
  {
    key: 's3',
    name: 'AWS S3',
    description: 'Amazon S3 object storage',
    category: 'storage',
    emoji: '🪣',
    fields: [
      { key: 'accessKeyId',     label: 'Access Key ID',     type: 'text',   required: true },
      { key: 'secretAccessKey', label: 'Secret Access Key', type: 'secret', required: true },
      { key: 'region',          label: 'Region',            type: 'text',   placeholder: 'us-east-1', required: true },
      { key: 'bucket',          label: 'Bucket Name',       type: 'text' },
    ],
  },
  {
    key: 'supabase',
    name: 'Supabase',
    description: 'Supabase DB, storage and edge functions',
    category: 'storage',
    emoji: '⚡',
    fields: [
      { key: 'url',    label: 'Project URL', type: 'text',   placeholder: 'https://xxx.supabase.co', required: true },
      { key: 'apiKey', label: 'Service Key', type: 'secret', required: true },
    ],
  },
  // ── DEV TOOLS ─────────────────────────────────────────────────────────────
  {
    key: 'github',
    name: 'GitHub',
    description: 'Access repos, issues, PRs and code',
    category: 'devtools',
    emoji: '🐙',
    fields: [
      { key: 'token', label: 'Personal Access Token', type: 'secret', placeholder: 'ghp_...', required: true },
      { key: 'owner', label: 'Default Owner / Org',   type: 'text' },
    ],
  },
  {
    key: 'jira',
    name: 'Jira',
    description: 'Manage issues and sprints in Jira',
    category: 'devtools',
    emoji: '📋',
    fields: [
      { key: 'baseUrl', label: 'Jira URL',  type: 'text',   placeholder: 'https://org.atlassian.net', required: true },
      { key: 'email',   label: 'Email',     type: 'text',   required: true },
      { key: 'apiKey',  label: 'API Token', type: 'secret', required: true },
    ],
  },
  // ── MESSAGING ─────────────────────────────────────────────────────────────
  {
    key: 'slack',
    name: 'Slack',
    description: 'Send messages and read channels in Slack',
    category: 'messaging',
    emoji: '💬',
    fields: [
      { key: 'botToken',    label: 'Bot Token',    type: 'secret', placeholder: 'xoxb-...', required: true },
      { key: 'channelId',   label: 'Default Channel ID', type: 'text' },
    ],
  },
  {
    key: 'discord',
    name: 'Discord',
    description: 'Send messages to Discord channels via webhook or bot',
    category: 'messaging',
    emoji: '🎮',
    fields: [
      { key: 'botToken',   label: 'Bot Token',    type: 'secret', placeholder: 'MTk4...', required: true },
      { key: 'guildId',    label: 'Guild / Server ID', type: 'text' },
    ],
  },
  {
    key: 'email_smtp',
    name: 'Email (SMTP)',
    description: 'Send emails via SMTP server',
    category: 'messaging',
    emoji: '📧',
    fields: [
      { key: 'host',     label: 'SMTP Host', type: 'text',   placeholder: 'smtp.gmail.com', required: true },
      { key: 'port',     label: 'Port',      type: 'number', placeholder: '587' },
      { key: 'user',     label: 'Username',  type: 'text',   required: true },
      { key: 'password', label: 'Password',  type: 'secret', required: true },
    ],
  },
  // ── OTHER ─────────────────────────────────────────────────────────────────
  {
    key: 'webhook',
    name: 'Webhook',
    description: 'Send HTTP POST payloads to any URL',
    category: 'other',
    emoji: '🔗',
    fields: [
      { key: 'url',    label: 'Webhook URL', type: 'text',   required: true },
      { key: 'secret', label: 'Secret',      type: 'secret', placeholder: 'optional signing secret' },
    ],
  },
  {
    key: 'custom_api',
    name: 'Custom API',
    description: 'Connect to any REST API with custom headers',
    category: 'other',
    emoji: '🔧',
    fields: [
      { key: 'baseUrl', label: 'Base URL',      type: 'text',   required: true },
      { key: 'apiKey',  label: 'API Key',        type: 'secret' },
      { key: 'headers', label: 'Extra Headers (JSON)', type: 'textarea', placeholder: '{"X-Custom": "value"}' },
    ],
  },
];

export function getConnectorDef(key: string): ConnectorDef | undefined {
  return connectorRegistry.find((c) => c.key === key);
}
