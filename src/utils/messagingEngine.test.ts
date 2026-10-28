import test from 'node:test';
import assert from 'node:assert/strict';
import {
  verifyMetaWebhookChallenge,
  parseMetaWebhookPayload,
  canAgentXAutoReply,
  computeDashboardStats,
  RawMetaWebhookPayload,
} from './messagingEngine';

test('verifyMetaWebhookChallenge correctly verifies valid Meta handshake', () => {
  const result = verifyMetaWebhookChallenge(
    'subscribe',
    'bekya_meta_webhook_secret_2026',
    'challenge_code_12345',
    'bekya_meta_webhook_secret_2026'
  );
  assert.equal(result.isValid, true);
  assert.equal(result.challenge, 'challenge_code_12345');
});

test('verifyMetaWebhookChallenge rejects mismatched token or wrong mode', () => {
  const badToken = verifyMetaWebhookChallenge(
    'subscribe',
    'wrong_token',
    'challenge_123'
  );
  assert.equal(badToken.isValid, false);

  const badMode = verifyMetaWebhookChallenge(
    'unknown',
    'bekya_meta_webhook_secret_2026',
    'challenge_123'
  );
  assert.equal(badMode.isValid, false);
});

test('parseMetaWebhookPayload parses Instagram and Messenger events correctly', () => {
  const payload: RawMetaWebhookPayload = {
    object: 'instagram',
    entry: [
      {
        id: 'ig_acc_999',
        time: 1715000000000,
        messaging: [
          {
            sender: { id: 'user_cairo_1' },
            recipient: { id: 'bekyapay_official' },
            timestamp: 1715000001000,
            message: {
              mid: 'm_mid_test_101',
              text: 'Hello, how can I pay via Bekya wallet?',
            },
          },
        ],
      },
    ],
  };

  const parsed = parseMetaWebhookPayload(payload);
  assert.equal(parsed.length, 1);
  assert.equal(parsed[0].platform, 'instagram');
  assert.equal(parsed[0].senderId, 'user_cairo_1');
  assert.equal(parsed[0].messageId, 'm_mid_test_101');
  assert.equal(parsed[0].text, 'Hello, how can I pay via Bekya wallet?');
});

test('canAgentXAutoReply respects configuration and conversation status', () => {
  const activeConfig = { isConnected: true, autoReplyEnabled: true };
  const disabledConfig = { isConnected: true, autoReplyEnabled: false };

  // Should allow for AI-handled unassigned conversation
  assert.equal(
    canAgentXAutoReply(
      { status: 'open', isAiHandled: true, assignedToUserId: null },
      activeConfig
    ),
    true
  );

  // Should reject if autoReply is disabled
  assert.equal(
    canAgentXAutoReply(
      { status: 'open', isAiHandled: true, assignedToUserId: null },
      disabledConfig
    ),
    false
  );

  // Should reject if conversation is resolved
  assert.equal(
    canAgentXAutoReply(
      { status: 'resolved', isAiHandled: true, assignedToUserId: null },
      activeConfig
    ),
    false
  );
});

test('computeDashboardStats aggregates counts and resolution percentages correctly', () => {
  const conversations = [
    { id: 'c1', status: 'open' as const, unreadCount: 2, isAiHandled: true },
    { id: 'c2', status: 'resolved' as const, unreadCount: 0, isAiHandled: false },
    { id: 'c3', status: 'pending' as const, unreadCount: 1, isAiHandled: true },
    { id: 'c4', status: 'open' as const, unreadCount: 0, isAiHandled: false },
  ];

  const now = Date.now();
  const messages = [
    { id: 'm1', senderType: 'customer' as const, timestamp: now },
    { id: 'm2', senderType: 'agent' as const, timestamp: now },
    { id: 'm3', senderType: 'customer' as const, timestamp: now - 86400000 * 2 }, // 2 days ago
  ];

  const stats = computeDashboardStats(conversations, messages);
  assert.equal(stats.totalConversations, 4);
  assert.equal(stats.openConversations, 2);
  assert.equal(stats.pendingConversations, 1);
  assert.equal(stats.resolvedConversations, 1);
  assert.equal(stats.unreadMessages, 3);
  assert.equal(stats.aiHandledCount, 2);
  assert.equal(stats.resolutionRatePct, 25);
  assert.equal(stats.messagesTodayReceived, 1);
  assert.equal(stats.messagesTodaySent, 1);
});
