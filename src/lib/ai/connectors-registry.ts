export interface ConnectorField {
  key: string;
  label: string;
  type: "text" | "secret" | "textarea" | "number";
  placeholder?: string;
  required?: boolean;
}

export interface ConnectorDef {
  key: string;
  name: string;
  description: string;
  category: string;
  emoji: string;
  color: string;
  fields: ConnectorField[];
}

export const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "messaging", label: "Messaging" },
  { key: "devtools", label: "Dev Tools" },
  { key: "productivity", label: "Productivity" },
  { key: "automation", label: "Automation" },
  { key: "data", label: "Data & Storage" },
  { key: "ai", label: "AI Models" },
  { key: "monitoring", label: "Monitoring" },
] as const;

export const CATEGORY_COLORS: Record<string, string> = {
  messaging: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  devtools: "text-violet-400 bg-violet-500/10 border-violet-500/30",
  productivity: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  automation: "text-orange-400 bg-orange-500/10 border-orange-500/30",
  data: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
  ai: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  monitoring: "text-rose-400 bg-rose-500/10 border-rose-500/30",
};

export const connectorRegistry: ConnectorDef[] = [
  // === MESSAGING ===
  {
    key: "slack", name: "Slack", description: "Send messages and manage channels",
    category: "messaging", emoji: "💬", color: "text-[#E01E5A]",
    fields: [
      { key: "botToken", label: "Bot Token", type: "secret", placeholder: "xoxb-...", required: true },
      { key: "defaultChannel", label: "Default Channel", type: "text", placeholder: "#general" },
    ],
  },
  {
    key: "discord", name: "Discord", description: "Send messages and manage servers",
    category: "messaging", emoji: "🎮", color: "text-[#5865F2]",
    fields: [
      { key: "botToken", label: "Bot Token", type: "secret", placeholder: "Your bot token", required: true },
      { key: "guildId", label: "Guild ID", type: "text", placeholder: "Server ID" },
      { key: "channelId", label: "Channel ID", type: "text", placeholder: "Default channel" },
    ],
  },
  {
    key: "telegram", name: "Telegram", description: "Send messages via Telegram bots",
    category: "messaging", emoji: "✈️", color: "text-[#0088CC]",
    fields: [
      { key: "botToken", label: "Bot Token", type: "secret", placeholder: "123456:ABC-DEF...", required: true },
      { key: "chatId", label: "Chat ID", type: "text", placeholder: "Target chat ID" },
    ],
  },
  {
    key: "whatsapp", name: "WhatsApp", description: "Send messages via WhatsApp Business API",
    category: "messaging", emoji: "📱", color: "text-[#25D366]",
    fields: [
      { key: "apiKey", label: "API Key", type: "secret", placeholder: "Your API key", required: true },
      { key: "phoneNumberId", label: "Phone Number ID", type: "text", placeholder: "Phone number ID" },
      { key: "webhookSecret", label: "Webhook Secret", type: "secret", placeholder: "Webhook verify token" },
    ],
  },
  {
    key: "teams", name: "Microsoft Teams", description: "Send messages and manage teams",
    category: "messaging", emoji: "🟣", color: "text-[#6264A7]",
    fields: [
      { key: "webhookUrl", label: "Webhook URL", type: "text", placeholder: "https://...", required: true },
      { key: "tenantId", label: "Tenant ID", type: "text", placeholder: "Azure AD tenant ID" },
    ],
  },

  // === DEVTOOLS ===
  {
    key: "github", name: "GitHub", description: "Manage repos, issues, and pull requests",
    category: "devtools", emoji: "🐙", color: "text-white",
    fields: [
      { key: "token", label: "Personal Access Token", type: "secret", placeholder: "ghp_...", required: true },
      { key: "owner", label: "Owner / Org", type: "text", placeholder: "username or org" },
      { key: "repos", label: "Repositories", type: "text", placeholder: "repo1, repo2" },
    ],
  },
  {
    key: "gitlab", name: "GitLab", description: "Manage projects and merge requests",
    category: "devtools", emoji: "🦊", color: "text-[#FC6D26]",
    fields: [
      { key: "token", label: "Access Token", type: "secret", placeholder: "glpat-...", required: true },
      { key: "baseUrl", label: "Base URL", type: "text", placeholder: "https://gitlab.com" },
      { key: "namespace", label: "Namespace", type: "text", placeholder: "group/project" },
    ],
  },
  {
    key: "github_actions", name: "GitHub Actions", description: "Trigger and monitor workflows",
    category: "devtools", emoji: "⚙️", color: "text-white",
    fields: [
      { key: "token", label: "Personal Access Token", type: "secret", placeholder: "ghp_...", required: true },
      { key: "owner", label: "Owner", type: "text", placeholder: "username or org" },
      { key: "repo", label: "Repository", type: "text", placeholder: "repo-name" },
    ],
  },
  {
    key: "sentry", name: "Sentry", description: "Error tracking and performance monitoring",
    category: "devtools", emoji: "🔥", color: "text-[#362D59]",
    fields: [
      { key: "dsn", label: "DSN", type: "secret", placeholder: "https://...", required: true },
      { key: "org", label: "Organization", type: "text", placeholder: "org-slug" },
      { key: "project", label: "Project", type: "text", placeholder: "project-slug" },
    ],
  },
  {
    key: "datadog", name: "Datadog", description: "Monitoring and analytics platform",
    category: "devtools", emoji: "🐶", color: "text-[#632CA6]",
    fields: [
      { key: "apiKey", label: "API Key", type: "secret", placeholder: "Your API key", required: true },
      { key: "appKey", label: "Application Key", type: "secret", placeholder: "Your app key" },
    ],
  },
  {
    key: "pagerduty", name: "PagerDuty", description: "Incident management and alerting",
    category: "devtools", emoji: "🔔", color: "text-[#06AC38]",
    fields: [
      { key: "apiKey", label: "API Key", type: "secret", placeholder: "Your API key", required: true },
      { key: "serviceId", label: "Service ID", type: "text", placeholder: "Service ID" },
    ],
  },

  // === PRODUCTIVITY ===
  {
    key: "gmail", name: "Gmail / Email", description: "Send and read emails via SMTP",
    category: "productivity", emoji: "📧", color: "text-[#EA4335]",
    fields: [
      { key: "smtpHost", label: "SMTP Host", type: "text", placeholder: "smtp.gmail.com", required: true },
      { key: "smtpPort", label: "SMTP Port", type: "number", placeholder: "587" },
      { key: "user", label: "Email Address", type: "text", placeholder: "you@gmail.com", required: true },
      { key: "password", label: "Password / App Password", type: "secret", placeholder: "Your password", required: true },
      { key: "fromAddress", label: "From Address", type: "text", placeholder: "sender@example.com" },
    ],
  },
  {
    key: "outlook", name: "Outlook", description: "Microsoft Outlook email integration",
    category: "productivity", emoji: "📬", color: "text-[#0078D4]",
    fields: [
      { key: "clientId", label: "Client ID", type: "text", placeholder: "Azure AD app client ID", required: true },
      { key: "clientSecret", label: "Client Secret", type: "secret", placeholder: "Your client secret", required: true },
      { key: "tenantId", label: "Tenant ID", type: "text", placeholder: "Azure AD tenant ID" },
    ],
  },
  {
    key: "notion", name: "Notion", description: "Access and manage Notion databases",
    category: "productivity", emoji: "📓", color: "text-white",
    fields: [
      { key: "integrationToken", label: "Integration Token", type: "secret", placeholder: "ntn_...", required: true },
      { key: "databaseId", label: "Database ID", type: "text", placeholder: "Notion database ID" },
    ],
  },
  {
    key: "google_drive", name: "Google Drive", description: "Access and manage files in Google Drive",
    category: "productivity", emoji: "📁", color: "text-[#4285F4]",
    fields: [
      { key: "serviceAccountJson", label: "Service Account JSON", type: "textarea", placeholder: '{ "type": "service_account", ... }', required: true },
    ],
  },
  {
    key: "google_sheets", name: "Google Sheets", description: "Read and write Google Sheets data",
    category: "productivity", emoji: "📊", color: "text-[#34A853]",
    fields: [
      { key: "serviceAccountJson", label: "Service Account JSON", type: "textarea", placeholder: '{ "type": "service_account", ... }', required: true },
      { key: "spreadsheetId", label: "Spreadsheet ID", type: "text", placeholder: "Sheet ID from URL" },
    ],
  },
  {
    key: "trello", name: "Trello", description: "Manage boards, lists, and cards",
    category: "productivity", emoji: "📋", color: "text-[#0079BF]",
    fields: [
      { key: "apiKey", label: "API Key", type: "secret", placeholder: "Your API key", required: true },
      { key: "token", label: "Token", type: "secret", placeholder: "Your token", required: true },
      { key: "boardId", label: "Board ID", type: "text", placeholder: "Trello board ID" },
    ],
  },
  {
    key: "jira", name: "Jira", description: "Manage issues, sprints, and projects",
    category: "productivity", emoji: "🎫", color: "text-[#0052CC]",
    fields: [
      { key: "baseUrl", label: "Base URL", type: "text", placeholder: "https://your-domain.atlassian.net", required: true },
      { key: "email", label: "Email", type: "text", placeholder: "you@company.com", required: true },
      { key: "apiToken", label: "API Token", type: "secret", placeholder: "Your API token", required: true },
      { key: "projectKey", label: "Project Key", type: "text", placeholder: "PROJ" },
    ],
  },
  {
    key: "linear", name: "Linear", description: "Manage issues and cycles",
    category: "productivity", emoji: "🔵", color: "text-[#5E6AD2]",
    fields: [
      { key: "apiKey", label: "API Key", type: "secret", placeholder: "lin_api_...", required: true },
      { key: "teamId", label: "Team ID", type: "text", placeholder: "Team ID" },
    ],
  },
  {
    key: "obsidian", name: "Obsidian", description: "Access and manage Obsidian vault",
    category: "productivity", emoji: "💜", color: "text-[#A88BFA]",
    fields: [
      { key: "vaultPath", label: "Vault Path", type: "text", placeholder: "/path/to/vault", required: true },
      { key: "apiPort", label: "Local REST API Port", type: "number", placeholder: "27124" },
    ],
  },
  {
    key: "confluence", name: "Confluence", description: "Access and manage Confluence pages",
    category: "productivity", emoji: "📖", color: "text-[#0052CC]",
    fields: [
      { key: "baseUrl", label: "Base URL", type: "text", placeholder: "https://your-domain.atlassian.net", required: true },
      { key: "email", label: "Email", type: "text", placeholder: "you@company.com", required: true },
      { key: "apiToken", label: "API Token", type: "secret", placeholder: "Your API token", required: true },
    ],
  },

  // === AUTOMATION ===
  {
    key: "webhooks", name: "Webhooks", description: "Send and receive webhook events",
    category: "automation", emoji: "🔗", color: "text-[#FF6600]",
    fields: [
      { key: "webhookUrl", label: "Webhook URL", type: "text", placeholder: "https://...", required: true },
      { key: "secret", label: "Secret", type: "secret", placeholder: "HMAC secret" },
      { key: "method", label: "HTTP Method", type: "text", placeholder: "POST" },
    ],
  },
  {
    key: "n8n", name: "n8n", description: "Trigger n8n workflows",
    category: "automation", emoji: "🔄", color: "text-[#FF6D5A]",
    fields: [
      { key: "baseUrl", label: "Base URL", type: "text", placeholder: "https://n8n.example.com", required: true },
      { key: "apiKey", label: "API Key", type: "secret", placeholder: "Your API key", required: true },
      { key: "workflowId", label: "Workflow ID", type: "text", placeholder: "Workflow ID" },
    ],
  },
  {
    key: "make", name: "Make (Integromat)", description: "Trigger Make scenarios",
    category: "automation", emoji: "⚡", color: "text-[#7739EB]",
    fields: [
      { key: "webhookUrl", label: "Webhook URL", type: "text", placeholder: "https://hook.make.com/...", required: true },
    ],
  },
  {
    key: "zapier", name: "Zapier", description: "Trigger Zaps via webhooks",
    category: "automation", emoji: "⚡", color: "text-[#FF4A00]",
    fields: [
      { key: "webhookUrl", label: "Webhook URL", type: "text", placeholder: "https://hooks.zapier.com/...", required: true },
    ],
  },
  {
    key: "cron", name: "Cron / Scheduler", description: "Schedule recurring tasks",
    category: "automation", emoji: "⏰", color: "text-[#F59E0B]",
    fields: [
      { key: "cronExpression", label: "Cron Expression", type: "text", placeholder: "0 */5 * * *", required: true },
      { key: "timezone", label: "Timezone", type: "text", placeholder: "UTC" },
    ],
  },

  // === DATA & STORAGE ===
  {
    key: "postgresql", name: "PostgreSQL", description: "Connect to PostgreSQL databases",
    category: "data", emoji: "🐘", color: "text-[#336791]",
    fields: [
      { key: "host", label: "Host", type: "text", placeholder: "localhost", required: true },
      { key: "port", label: "Port", type: "number", placeholder: "5432" },
      { key: "database", label: "Database", type: "text", placeholder: "mydb", required: true },
      { key: "user", label: "User", type: "text", placeholder: "postgres", required: true },
      { key: "password", label: "Password", type: "secret", placeholder: "Your password", required: true },
    ],
  },
  {
    key: "mysql", name: "MySQL", description: "Connect to MySQL databases",
    category: "data", emoji: "🐬", color: "text-[#4479A1]",
    fields: [
      { key: "host", label: "Host", type: "text", placeholder: "localhost", required: true },
      { key: "port", label: "Port", type: "number", placeholder: "3306" },
      { key: "database", label: "Database", type: "text", placeholder: "mydb", required: true },
      { key: "user", label: "User", type: "text", placeholder: "root", required: true },
      { key: "password", label: "Password", type: "secret", placeholder: "Your password", required: true },
    ],
  },
  {
    key: "mongodb", name: "MongoDB", description: "Connect to MongoDB clusters",
    category: "data", emoji: "🍃", color: "text-[#47A248]",
    fields: [
      { key: "connectionString", label: "Connection String", type: "secret", placeholder: "mongodb+srv://...", required: true },
    ],
  },
  {
    key: "redis", name: "Redis", description: "Connect to Redis for caching and queues",
    category: "data", emoji: "🔴", color: "text-[#DC382D]",
    fields: [
      { key: "host", label: "Host", type: "text", placeholder: "localhost", required: true },
      { key: "port", label: "Port", type: "number", placeholder: "6379" },
      { key: "password", label: "Password", type: "secret", placeholder: "Your password" },
    ],
  },
  {
    key: "supabase", name: "Supabase", description: "Connect to Supabase backend",
    category: "data", emoji: "⚡", color: "text-[#3ECF8E]",
    fields: [
      { key: "projectUrl", label: "Project URL", type: "text", placeholder: "https://xxx.supabase.co", required: true },
      { key: "anonKey", label: "Anon Key", type: "secret", placeholder: "Your anon key", required: true },
      { key: "serviceKey", label: "Service Key", type: "secret", placeholder: "Your service key" },
    ],
  },
  {
    key: "airtable", name: "Airtable", description: "Access Airtable bases and records",
    category: "data", emoji: "📋", color: "text-[#18BFFF]",
    fields: [
      { key: "apiKey", label: "API Key", type: "secret", placeholder: "Your API key", required: true },
      { key: "baseId", label: "Base ID", type: "text", placeholder: "Base ID" },
    ],
  },

  // === AI PROVIDERS ===
  {
    key: "openrouter", name: "OpenRouter", description: "Access multiple LLMs via OpenRouter",
    category: "ai", emoji: "🛤️", color: "text-white",
    fields: [
      { key: "apiKey", label: "API Key", type: "secret", placeholder: "sk-or-...", required: true },
      { key: "defaultModel", label: "Default Model", type: "text", placeholder: "anthropic/claude-3.5-sonnet" },
    ],
  },
  {
    key: "openai_direct", name: "OpenAI (Direct)", description: "OpenAI API for GPT models",
    category: "ai", emoji: "🤖", color: "text-[#10A37F]",
    fields: [
      { key: "apiKey", label: "API Key", type: "secret", placeholder: "sk-...", required: true },
      { key: "orgId", label: "Organization ID", type: "text", placeholder: "org-..." },
    ],
  },
  {
    key: "anthropic", name: "Anthropic", description: "Anthropic API for Claude models",
    category: "ai", emoji: "🧠", color: "text-[#D4A574]",
    fields: [
      { key: "apiKey", label: "API Key", type: "secret", placeholder: "sk-ant-...", required: true },
    ],
  },
  {
    key: "google_gemini", name: "Google Gemini", description: "Google AI for Gemini models",
    category: "ai", emoji: "💎", color: "text-[#4285F4]",
    fields: [
      { key: "apiKey", label: "API Key", type: "secret", placeholder: "Your API key", required: true },
    ],
  },
  {
    key: "groq", name: "Groq", description: "Fast LLM inference with Groq",
    category: "ai", emoji: "🚀", color: "text-[#F55036]",
    fields: [
      { key: "apiKey", label: "API Key", type: "secret", placeholder: "gsk_...", required: true },
    ],
  },
  {
    key: "ollama", name: "Ollama (Local)", description: "Run local models via Ollama",
    category: "ai", emoji: "🦙", color: "text-white",
    fields: [
      { key: "baseUrl", label: "Base URL", type: "text", placeholder: "http://localhost:11434", required: true },
      { key: "model", label: "Model", type: "text", placeholder: "llama3" },
    ],
  },
];

export function getConnectorDef(key: string): ConnectorDef | undefined {
  return connectorRegistry.find((c) => c.key === key);
}
