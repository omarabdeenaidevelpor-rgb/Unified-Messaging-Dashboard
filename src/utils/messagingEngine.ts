export interface RawMetaWebhookPayload {
  object: 'page' | 'instagram';
  entry: Array<{
    id: string;
    time: number;
    messaging?: Array<{
      sender: { id: string };
      recipient: { id: string };
      timestamp: number;
      message?: {
        mid: string;
        text: string;
        attachments?: Array<{ type: string; payload: { url: string } }>;
      };
      delivery?: { mids: string[]; watermark: number };
      read?: { watermark: number };
    }>;
  }>;
}

export interface ParsedWebhookMessage {
  platform: 'facebook' | 'instagram';
  accountId: string;
  senderId: string;
  recipientId: string;
  timestamp: number;
  messageId: string;
  text: string;
}

/**
 * Validates Meta Hub Challenge verification requests
 */
export function verifyMetaWebhookChallenge(
  mode?: string,
  token?: string,
  challenge?: string,
  expectedToken: string = 'bekya_meta_webhook_secret_2026'
): { isValid: boolean; challenge?: string } {
  if (mode === 'subscribe' && token === expectedToken && challenge) {
    return { isValid: true, challenge };
  }
  return { isValid: false };
}

/**
 * Parses incoming Meta Webhook messaging payload for Facebook and Instagram
 */
export function parseMetaWebhookPayload(payload: RawMetaWebhookPayload): ParsedWebhookMessage[] {
  const results: ParsedWebhookMessage[] = [];
  if (!payload || !Array.isArray(payload.entry)) return results;

  const platform = payload.object === 'instagram' ? 'instagram' : 'facebook';

  for (const entry of payload.entry) {
    if (!Array.isArray(entry.messaging)) continue;
    for (const msgEvent of entry.messaging) {
      if (msgEvent.message && msgEvent.message.text && msgEvent.message.mid) {
        results.push({
          platform,
          accountId: entry.id,
          senderId: msgEvent.sender.id,
          recipientId: msgEvent.recipient.id,
          timestamp: msgEvent.timestamp || Date.now(),
          messageId: msgEvent.message.mid,
          text: msgEvent.message.text.trim(),
        });
      }
    }
  }

  return results;
}

/**
 * Checks whether an incoming conversation is eligible for Agent X automated response
 */
export function canAgentXAutoReply(
  conversation: {
    status: 'open' | 'pending' | 'resolved';
    assignedToUserId?: string | null;
    isAiHandled: boolean;
  },
  config: {
    autoReplyEnabled: boolean;
    isConnected: boolean;
  }
): boolean {
  if (!config.isConnected || !config.autoReplyEnabled) {
    return false;
  }
  // If an human agent is explicitly handling and has locked or marked resolved, skip auto-reply
  if (conversation.status === 'resolved') {
    return false;
  }
  return conversation.isAiHandled || !conversation.assignedToUserId;
}

/**
 * Compute key dashboard operational metrics from conversations and messages
 */
export function computeDashboardStats(
  conversations: Array<{
    id: string;
    status: 'open' | 'pending' | 'resolved';
    unreadCount: number;
    isAiHandled: boolean;
  }>,
  messages: Array<{
    id: string;
    senderType: 'customer' | 'agent' | 'ai';
    timestamp: number;
  }>
) {
  const totalConversations = conversations.length;
  const openConversations = conversations.filter((c) => c.status === 'open').length;
  const pendingConversations = conversations.filter((c) => c.status === 'pending').length;
  const resolvedConversations = conversations.filter((c) => c.status === 'resolved').length;
  const unreadMessages = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
  const aiHandledCount = conversations.filter((c) => c.isAiHandled).length;

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startTimestamp = startOfToday.getTime();

  let messagesTodayReceived = 0;
  let messagesTodaySent = 0;

  for (const m of messages) {
    if (m.timestamp >= startTimestamp) {
      if (m.senderType === 'customer') {
        messagesTodayReceived++;
      } else {
        messagesTodaySent++;
      }
    }
  }

  const resolutionRatePct = totalConversations > 0
    ? Math.round((resolvedConversations / totalConversations) * 100)
    : 0;

  return {
    totalConversations,
    openConversations,
    pendingConversations,
    resolvedConversations,
    unreadMessages,
    messagesTodayReceived,
    messagesTodaySent,
    aiHandledCount,
    resolutionRatePct,
  };
}
