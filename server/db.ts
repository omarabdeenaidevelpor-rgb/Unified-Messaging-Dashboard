import fs from 'node:fs';
import path from 'node:path';
import {
  User,
  Customer,
  Conversation,
  Message,
  ConnectedAccount,
  AgentXConfig,
  WebhookEvent,
  IntegrationLog,
  NotificationItem,
} from './types';

export interface DatabaseSchema {
  users: User[];
  customers: Customer[];
  conversations: Conversation[];
  messages: Message[];
  connectedAccounts: ConnectedAccount[];
  agentXConfig: AgentXConfig;
  webhookEvents: WebhookEvent[];
  integrationLogs: IntegrationLog[];
  notifications: NotificationItem[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Real initial administrative user for the workspace
const INITIAL_USERS: User[] = [
  {
    id: 'user_1',
    name: 'Omar Abdeen',
    email: 'omarabdeenaidevelpor@gmail.com',
    role: 'Admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    status: 'online',
    department: 'Engineering & Operations',
    createdAt: new Date().toISOString(),
    developerBadge: true,
    isActive: true,
    permissions: [
      'all',
      'manage_users',
      'manage_channels',
      'manage_ai',
      'reply_messages',
      'view_reports',
      'settings',
    ],
  },
];

// Clean channels awaiting live Meta configuration
const INITIAL_ACCOUNTS: ConnectedAccount[] = [
  {
    id: 'acc_ig_1',
    platform: 'instagram',
    accountName: 'Bekya Pay Official Instagram',
    handle: '@bekyapay.eg',
    accountId: '',
    pageId: '',
    status: 'pending_auth',
    lastSyncAt: 0,
    webhookSubscribed: false,
    credentialsConfigured: false,
    appId: '',
    permissions: ['instagram_manage_messages', 'pages_messaging', 'pages_show_list'],
  },
  {
    id: 'acc_fb_1',
    platform: 'facebook',
    accountName: 'Bekya Pay Facebook Page',
    handle: 'facebook.com/BekyaPayEG',
    accountId: '',
    pageId: '',
    status: 'pending_auth',
    lastSyncAt: 0,
    webhookSubscribed: false,
    credentialsConfigured: false,
    appId: '',
    permissions: ['pages_messaging', 'pages_messaging_subscriptions', 'pages_read_engagement'],
  },
];

// Clean, zero mock data arrays
const INITIAL_CUSTOMERS: Customer[] = [];
const INITIAL_CONVERSATIONS: Conversation[] = [];
const INITIAL_MESSAGES: Message[] = [];
const INITIAL_WEBHOOK_EVENTS: WebhookEvent[] = [];

// Clean initial Agent X configuration awaiting user API credentials
const INITIAL_AGENT_X_CONFIG: AgentXConfig = {
  isConnected: false,
  apiKeyMasked: '',
  endpointUrl: 'https://api.agentx.ai/v1/orchestrator/bekyapay',
  webhookSecret: '',
  autoReplyEnabled: false,
  confidenceThreshold: 0.85,
  replyDelaySeconds: 2,
  handoffKeyword: 'human_agent_requested',
  businessContext: 'Bekya Pay is a leading financial technology & digital payments platform in Egypt offering merchant QR payments, smart POS terminals, installment integrations (ValU, Souhoola, Aman), and instant wallet transfers via InstaPay & mobile wallets.',
  modelVariant: 'AgentX Omni-Fintech v2.4 (Arabic + English)',
  lastTestAt: null,
  lastTestLatencyMs: null,
  testStatus: 'idle',
};

const INITIAL_LOGS: IntegrationLog[] = [
  {
    id: `log_init_${Date.now()}`,
    source: 'System',
    level: 'info',
    message: 'Bekya Pay Unified Messaging Platform initialized in production mode. Waiting for Meta channel connection.',
    timestamp: Date.now(),
  },
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: `notif_init_${Date.now()}`,
    title: 'Platform Ready',
    titleAr: 'المنصة جاهزة للربط',
    message: 'Connect your Instagram and Facebook Messenger accounts to begin receiving customer messages.',
    messageAr: 'قم بضبط بيانات ربط إنستغرام وفيسبوك مسنجر للبدء في استقبال رسائل العملاء.',
    type: 'system',
    read: false,
    timestamp: Date.now(),
    link: '/channels',
  },
];

class MemoryDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          users: parsed.users || INITIAL_USERS,
          customers: parsed.customers || [],
          conversations: parsed.conversations || [],
          messages: parsed.messages || [],
          connectedAccounts: parsed.connectedAccounts || INITIAL_ACCOUNTS,
          agentXConfig: parsed.agentXConfig || INITIAL_AGENT_X_CONFIG,
          webhookEvents: parsed.webhookEvents || [],
          integrationLogs: parsed.integrationLogs || INITIAL_LOGS,
          notifications: parsed.notifications || INITIAL_NOTIFICATIONS,
        };
      }
    } catch (err) {
      console.warn('Could not read existing db.json, falling back to clean initial state:', err);
    }

    return {
      users: INITIAL_USERS,
      customers: INITIAL_CUSTOMERS,
      conversations: INITIAL_CONVERSATIONS,
      messages: INITIAL_MESSAGES,
      connectedAccounts: INITIAL_ACCOUNTS,
      agentXConfig: INITIAL_AGENT_X_CONFIG,
      webhookEvents: INITIAL_WEBHOOK_EVENTS,
      integrationLogs: INITIAL_LOGS,
      notifications: INITIAL_NOTIFICATIONS,
    };
  }

  public save(): void {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist database file:', err);
    }
  }

  // --- Reset Entire Database to Clean State ---
  public resetToCleanState(): void {
    this.data = {
      users: INITIAL_USERS,
      customers: [],
      conversations: [],
      messages: [],
      connectedAccounts: INITIAL_ACCOUNTS.map((a) => ({ ...a, status: 'pending_auth', credentialsConfigured: false })),
      agentXConfig: { ...INITIAL_AGENT_X_CONFIG, isConnected: false, lastTestAt: null },
      webhookEvents: [],
      integrationLogs: [
        {
          id: `log_${Date.now()}`,
          source: 'System',
          level: 'info',
          message: 'All demo and test records were cleared. Platform reset to clean production state.',
          timestamp: Date.now(),
        },
      ],
      notifications: [
        {
          id: `notif_${Date.now()}`,
          title: 'Database Reset',
          titleAr: 'تم تصفير قاعدة البيانات',
          message: 'All temporary customer and conversation records have been wiped clean.',
          messageAr: 'تم حذف كافة السجلات والمحادثات التجريبية بنجاح.',
          type: 'system',
          read: false,
          timestamp: Date.now(),
        },
      ],
    };
    this.save();
  }

  // --- Users ---
  public getUsers(): User[] {
    return this.data.users;
  }
  public getUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }
  public addUser(user: User): User {
    this.data.users.push(user);
    this.save();
    return user;
  }
  public updateUserRole(id: string, role: 'Admin' | 'Manager' | 'Agent'): User | undefined {
    const u = this.data.users.find((user) => user.id === id);
    if (u) {
      u.role = role;
      this.save();
    }
    return u;
  }
  public updateUser(id: string, updates: Partial<User>): User | undefined {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx !== -1) {
      this.data.users[idx] = { ...this.data.users[idx], ...updates };
      this.save();
      return this.data.users[idx];
    }
    return undefined;
  }
  public deleteUser(id: string): boolean {
    const beforeLen = this.data.users.length;
    this.data.users = this.data.users.filter((u) => u.id !== id);
    this.save();
    return this.data.users.length < beforeLen;
  }

  // --- Customers ---
  public getCustomers(): Customer[] {
    return this.data.customers;
  }
  public getCustomerById(id: string): Customer | undefined {
    return this.data.customers.find((c) => c.id === id);
  }
  public addCustomer(cust: Customer): Customer {
    this.data.customers.unshift(cust);
    this.save();
    return cust;
  }
  public updateCustomer(id: string, updates: Partial<Customer>): Customer | undefined {
    const idx = this.data.customers.findIndex((c) => c.id === id);
    if (idx !== -1) {
      this.data.customers[idx] = { ...this.data.customers[idx], ...updates };
      this.save();
      return this.data.customers[idx];
    }
    return undefined;
  }
  public deleteCustomer(id: string): boolean {
    const beforeLen = this.data.customers.length;
    this.data.customers = this.data.customers.filter((c) => c.id !== id);
    this.save();
    return this.data.customers.length < beforeLen;
  }

  // --- Conversations ---
  public getConversations(): Conversation[] {
    return [...this.data.conversations].sort((a, b) => b.lastMessageAt - a.lastMessageAt);
  }
  public getConversationById(id: string): Conversation | undefined {
    return this.data.conversations.find((c) => c.id === id);
  }
  public updateConversation(id: string, updates: Partial<Conversation>): Conversation | undefined {
    const idx = this.data.conversations.findIndex((c) => c.id === id);
    if (idx !== -1) {
      this.data.conversations[idx] = { ...this.data.conversations[idx], ...updates };
      this.save();
      return this.data.conversations[idx];
    }
    return undefined;
  }
  public createConversation(conv: Conversation): Conversation {
    this.data.conversations.unshift(conv);
    this.save();
    return conv;
  }
  public deleteConversation(id: string): boolean {
    const beforeLen = this.data.conversations.length;
    this.data.conversations = this.data.conversations.filter((c) => c.id !== id);
    this.data.messages = this.data.messages.filter((m) => m.conversationId !== id);
    this.save();
    return this.data.conversations.length < beforeLen;
  }

  // --- Messages ---
  public getMessages(conversationId?: string): Message[] {
    if (!conversationId) return this.data.messages;
    return this.data.messages
      .filter((m) => m.conversationId === conversationId)
      .sort((a, b) => a.timestamp - b.timestamp);
  }
  public addMessage(msg: Message): Message {
    this.data.messages.push(msg);
    const conv = this.data.conversations.find((c) => c.id === msg.conversationId);
    if (conv) {
      conv.lastMessageSnippet = msg.text;
      conv.lastMessageAt = msg.timestamp;
      if (msg.senderType === 'customer') {
        conv.unreadCount = (conv.unreadCount || 0) + 1;
        if (conv.status === 'resolved') {
          conv.status = 'open';
        }
      }
    }
    this.save();
    return msg;
  }

  // --- Channels ---
  public getAccounts(): ConnectedAccount[] {
    return this.data.connectedAccounts;
  }
  public getAccountById(id: string): ConnectedAccount | undefined {
    return this.data.connectedAccounts.find((a) => a.id === id);
  }
  public updateAccount(id: string, updates: Partial<ConnectedAccount>): ConnectedAccount | undefined {
    const idx = this.data.connectedAccounts.findIndex((a) => a.id === id);
    if (idx !== -1) {
      this.data.connectedAccounts[idx] = { ...this.data.connectedAccounts[idx], ...updates };
      this.save();
      return this.data.connectedAccounts[idx];
    }
    return undefined;
  }

  // --- Agent X ---
  public getAgentXConfig(): AgentXConfig {
    return this.data.agentXConfig;
  }
  public updateAgentXConfig(updates: Partial<AgentXConfig>): AgentXConfig {
    this.data.agentXConfig = { ...this.data.agentXConfig, ...updates };
    this.save();
    return this.data.agentXConfig;
  }

  // --- Logs & Events ---
  public getLogs(limit: number = 50): IntegrationLog[] {
    return [...this.data.integrationLogs].sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
  }
  public addLog(log: Omit<IntegrationLog, 'id'>): IntegrationLog {
    const item: IntegrationLog = {
      ...log,
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    };
    this.data.integrationLogs.unshift(item);
    if (this.data.integrationLogs.length > 200) {
      this.data.integrationLogs.pop();
    }
    this.save();
    return item;
  }
  public clearLogs(): void {
    this.data.integrationLogs = [];
    this.save();
  }

  public getWebhookEvents(limit: number = 50): WebhookEvent[] {
    return [...this.data.webhookEvents].sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
  }
  public addWebhookEvent(evt: Omit<WebhookEvent, 'id'>): WebhookEvent {
    const item: WebhookEvent = {
      ...evt,
      id: `wh_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    };
    this.data.webhookEvents.unshift(item);
    if (this.data.webhookEvents.length > 200) {
      this.data.webhookEvents.pop();
    }
    this.save();
    return item;
  }

  // --- Notifications ---
  public getNotifications(): NotificationItem[] {
    return [...this.data.notifications].sort((a, b) => b.timestamp - a.timestamp);
  }
  public markNotificationRead(id: string): void {
    const n = this.data.notifications.find((notif) => notif.id === id);
    if (n) {
      n.read = true;
      this.save();
    }
  }
  public markAllNotificationsRead(): void {
    for (const n of this.data.notifications) {
      n.read = true;
    }
    this.save();
  }
  public addNotification(n: Omit<NotificationItem, 'id'>): NotificationItem {
    const item: NotificationItem = {
      ...n,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    };
    this.data.notifications.unshift(item);
    this.save();
    return item;
  }
}

export const db = new MemoryDatabase();
