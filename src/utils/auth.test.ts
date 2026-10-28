import { test } from 'node:test';
import assert from 'node:assert/strict';

function verifyCredentials(user: { password?: string; isActive?: boolean }, inputPass: string): { valid: boolean; error?: string } {
  if (user.isActive === false) {
    return { valid: false, error: 'Account suspended' };
  }
  if (!user.password || user.password !== inputPass.trim()) {
    return { valid: false, error: 'Invalid password' };
  }
  return { valid: true };
}

function hasPermission(userPermissions: string[], required: string): boolean {
  if (userPermissions.includes('all')) return true;
  return userPermissions.includes(required);
}

test('verifyCredentials allows active user with matching password', () => {
  const user = { password: 'Omar@Admin2026', isActive: true };
  const res = verifyCredentials(user, 'Omar@Admin2026');
  assert.equal(res.valid, true);
  assert.equal(res.error, undefined);
});

test('verifyCredentials rejects incorrect password', () => {
  const user = { password: 'Omar@Admin2026', isActive: true };
  const res = verifyCredentials(user, 'WrongPassword123');
  assert.equal(res.valid, false);
  assert.equal(res.error, 'Invalid password');
});

test('verifyCredentials blocks suspended account even with correct password', () => {
  const user = { password: 'Secret@123', isActive: false };
  const res = verifyCredentials(user, 'Secret@123');
  assert.equal(res.valid, false);
  assert.equal(res.error, 'Account suspended');
});

test('hasPermission grants full access when user has "all" permission', () => {
  const superAdminPerms = ['all', 'manage_users'];
  assert.equal(hasPermission(superAdminPerms, 'settings'), true);
  assert.equal(hasPermission(superAdminPerms, 'delete_anything'), true);
});

test('hasPermission checks granular access for non-admin staff', () => {
  const agentPerms = ['reply_messages'];
  assert.equal(hasPermission(agentPerms, 'reply_messages'), true);
  assert.equal(hasPermission(agentPerms, 'manage_users'), false);
});
