export type PlatformType = 'instagram' | 'facebook';

export type ConversationStatus = 'open' | 'pending' | 'resolved';

export type SenderType = 'customer' | 'agent' | 'ai';

export type DeliveryStatus = 'sent' | 'delivered' | 'read' | 'failed';

export type NavTab =
  | 'overview'
  | 'inbox'
  | 'conversations'
  | 'customers'
  | 'ai-automation'
  | 'channels'
  | 'team'
  | 'reports'
  | 'notifications'
  | 'settings';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Agent';
  avatar: string;
  status: 'online' | 'busy' | 'offline';
  department: string;
  createdAt: string;
  password?: string;
  permissions?: string[];
  isActive?: boolean;
  developerBadge?: boolean;
}

export interface Customer {
  id: string;
  name: string;
  handle: string;
  platform: PlatformType;
  avatar: string;
  email?: string;
  phone?: string;
  city: string;
  customerSince: string;
  totalTransactions: number;
  totalSpentEGP: number;
  tags: string[];
  notes?: string;
  vip: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  senderType: SenderType;
  senderName: string;
  senderAvatar?: string;
  text: string;
  timestamp: number;
  deliveryStatus: DeliveryStatus;
  metaMessageId?: string;
  attachments?: Array<{ type: 'image' | 'file'; url: string; name?: string }>;
}

export interface Conversation {
  id: string;
  customerId: string;
  platform: PlatformType;
  status: ConversationStatus;
  unreadCount: number;
  lastMessageSnippet: string;
  lastMessageAt: number;
  assignedToUserId: string | null;
  isAiHandled: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  topic: string;
  channelAccountId: string;
  customer?: Customer;
  assignedUser?: User | null;
}

export interface ConnectedAccount {
  id: string;
  platform: PlatformType;
  accountName: string;
  handle: string;
  accountId: string;
  pageId?: string;
  status: 'connected' | 'disconnected' | 'error' | 'pending_auth';
  lastSyncAt: number;
  webhookSubscribed: boolean;
  credentialsConfigured: boolean;
  errorMessage?: string;
  appId?: string;
  permissions: string[];
}

export interface AgentXConfig {
  isConnected: boolean;
  apiKeyMasked: string;
  endpointUrl: string;
  webhookSecret: string;
  autoReplyEnabled: boolean;
  confidenceThreshold: number;
  replyDelaySeconds: number;
  handoffKeyword: string;
  businessContext: string;
  modelVariant: string;
  lastTestAt: number | null;
  lastTestLatencyMs: number | null;
  testStatus: 'idle' | 'success' | 'failed';
}

export interface IntegrationLog {
  id: string;
  source: 'Meta Webhook' | 'Agent X' | 'Outbound API' | 'Auth Service' | 'System';
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  details?: Record<string, unknown> | string;
  timestamp: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  type: 'message' | 'system' | 'agent_x' | 'channel';
  read: boolean;
  timestamp: number;
  link?: string;
}

export interface DashboardStats {
  totalConversations: number;
  openConversations: number;
  pendingConversations: number;
  resolvedConversations: number;
  unreadMessages: number;
  messagesTodayReceived: number;
  messagesTodaySent: number;
  aiHandledCount: number;
  resolutionRatePct: number;
  connectedAccountsCount: number;
  agentXStatus: string;
  agentXLatencyMs: number;
  avgResponseTimeMinutes: number;
  csatScore: number;
  recentLogs: IntegrationLog[];
}
