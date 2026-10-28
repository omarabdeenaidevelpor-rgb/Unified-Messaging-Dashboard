import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ConnectedAccount, WebhookEvent } from '../types';
import { PlatformBadge } from '../components/common/Badge';
import { SimulateModal } from '../components/common/SimulateModal';
import {
  Radio,
  Copy,
  Check,
  RotateCw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Terminal,
  Settings2,
  X,
  Key,
} from 'lucide-react';

export const ConnectedChannelsPage: React.FC = () => {
  const { t, isRTL, refreshCount, triggerRefresh } = useApp();
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [webhookEvents, setWebhookEvents] = useState<WebhookEvent[]>([]);
  const [metaConfig, setMetaConfig] = useState<{
    webhookUrl: string;
    verifyToken: string;
    metaApiVersion: string;
    supportedEvents: string[];
    appStatus: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [showSimModal, setShowSimModal] = useState(false);

  // Configure Channel Modal State
  const [configModalAccount, setConfigModalAccount] = useState<ConnectedAccount | null>(null);
  const [accountName, setAccountName] = useState('');
  const [handle, setHandle] = useState('');
  const [pageId, setPageId] = useState('');
  const [appId, setAppId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [savingConfig, setSavingConfig] = useState(false);

  useEffect(() => {
    async function loadChannels() {
      try {
        const [channelsRes, logsRes] = await Promise.all([
          fetch('/api/channels'),
          fetch('/api/integration-logs?limit=10'),
        ]);

        if (channelsRes.ok) {
          const cData = await channelsRes.json();
          setAccounts(cData.accounts || []);
          setMetaConfig(cData.metaConfig);
        }
        if (logsRes.ok) {
          const lData = await logsRes.json();
          setWebhookEvents(lData.webhookEvents || []);
        }
      } catch (err) {
        console.error('Error loading channels:', err);
      } finally {
        setLoading(false);
      }
    }
    loadChannels();
  }, [refreshCount]);

  const handleOpenConfigModal = (acc: ConnectedAccount) => {
    setConfigModalAccount(acc);
    setAccountName(acc.accountName);
    setHandle(acc.handle);
    setPageId(acc.pageId || '');
    setAppId(acc.appId || '');
    setAccessToken('');
  };

  const handleSaveChannelConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configModalAccount) return;

    setSavingConfig(true);
    try {
      const res = await fetch(`/api/channels/${configModalAccount.id}/configure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountName,
          handle,
          pageId,
          appId,
          accountId: pageId,
        }),
      });
      if (res.ok) {
        setConfigModalAccount(null);
        triggerRefresh();
      }
    } catch (err) {
      console.error('Failed to configure channel:', err);
    } finally {
      setSavingConfig(false);
    }
  };

  const handleToggleChannel = async (id: string) => {
    try {
      const res = await fetch(`/api/channels/${id}/toggle`, { method: 'POST' });
      if (res.ok) {
        triggerRefresh();
      }
    } catch (err) {
      console.error('Error toggling channel:', err);
    }
  };

  const handleSyncChannel = async (id: string) => {
    setSyncingId(id);
    try {
      const res = await fetch(`/api/channels/${id}/sync`, { method: 'POST' });
      if (res.ok) {
        triggerRefresh();
      }
    } catch (err) {
      console.error('Error syncing channel:', err);
    } finally {
      setSyncingId(null);
    }
  };

  const copyToClipboard = (text: string, type: 'url' | 'token') => {
    navigator.clipboard.writeText(text);
    if (type === 'url') {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } else {
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header & Simulator CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Radio className="w-7 h-7 text-blue-600" />
            <span>{t('channelsPageTitle')}</span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">{t('channelsPageDesc')}</p>
        </div>

        <button
          onClick={() => setShowSimModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg shadow-sm transition-colors self-start"
        >
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>{isRTL ? 'محاكاة حدث ويب هوك وارد' : 'Simulate Inbound Webhook'}</span>
        </button>
      </div>

      {/* Connected Accounts Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {accounts.map((acc) => {
          const isConnected = acc.status === 'connected';
          return (
            <div
              key={acc.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <PlatformBadge platform={acc.platform} />
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      isConnected
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
                      }`}
                    />
                    {isConnected
                      ? t('connected')
                      : isRTL
                      ? 'بانتظار ضبط الربط'
                      : 'Pending Credentials'}
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-900">{acc.accountName}</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{acc.handle}</p>

                <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400">Account ID:</span>
                    <span className="font-mono text-slate-800">
                      {acc.accountId || (isRTL ? 'غير محدد' : 'Not configured')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-400">App ID:</span>
                    <span className="font-mono text-slate-800">
                      {acc.appId || (isRTL ? 'غير محدد' : 'Not configured')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-400">{t('lastSync')}:</span>
                    <span className="text-slate-700">
                      {acc.lastSyncAt
                        ? new Date(acc.lastSyncAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : isRTL
                        ? 'لم تتم بعد'
                        : 'Never'}
                    </span>
                  </div>
                </div>

                {/* Permissions */}
                <div className="mt-3">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                    Meta Permissions Required:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {acc.permissions.map((p, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-600"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions Bar */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenConfigModal(acc)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  <span>{isRTL ? 'ضبط بيانات الربط' : 'Configure Channel'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSyncChannel(acc.id)}
                    disabled={syncingId === acc.id || !isConnected}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-40"
                  >
                    <RotateCw
                      className={`w-3.5 h-3.5 ${syncingId === acc.id ? 'animate-spin' : ''}`}
                    />
                    <span>{t('syncNow')}</span>
                  </button>

                  <button
                    onClick={() => handleToggleChannel(acc.id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      isConnected
                        ? 'text-red-600 hover:bg-red-50 border border-red-200'
                        : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                    }`}
                  >
                    {isConnected ? t('disconnect') : t('reconnect')}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Meta Webhook Endpoint Configuration */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <h2 className="font-bold text-sm text-slate-900">
              {t('metaWebhookConfig')}
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-500">
            Graph API {metaConfig?.metaApiVersion || 'v21.0'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Callback URL */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">{t('callbackUrl')}</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={metaConfig?.webhookUrl || 'https://.../api/webhooks/meta'}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
              <button
                onClick={() =>
                  metaConfig?.webhookUrl && copyToClipboard(metaConfig.webhookUrl, 'url')
                }
                className="p-2 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg shrink-0 transition-colors"
                title="Copy Callback URL"
              >
                {copiedUrl ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Verify Token */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700">{t('verifyToken')}</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={metaConfig?.verifyToken || 'bekya_meta_webhook_secret_2026'}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
              <button
                onClick={() =>
                  metaConfig?.verifyToken && copyToClipboard(metaConfig.verifyToken, 'token')
                }
                className="p-2 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg shrink-0 transition-colors"
                title="Copy Verify Token"
              >
                {copiedToken ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Setup Guide Steps */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-xs text-slate-700 space-y-2">
          <p className="font-bold text-slate-900">{t('metaSetupGuide')}:</p>
          <p>{t('metaSetupStep1')}</p>
          <p>{t('metaSetupStep2')}</p>
          <p>{t('metaSetupStep3')}</p>
          <p>{t('metaSetupStep4')}</p>
        </div>
      </div>

      {/* Webhook Events Receipts Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-slate-600" />
            <h2 className="font-bold text-sm text-slate-900">
              {isRTL ? 'سجل أحداث خطاف الويب هوك المستلمة' : 'Recent Inbound Webhook Receipts'}
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {webhookEvents.length} events logged
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left" dir={isRTL ? 'rtl' : 'ltr'}>
            <thead className="text-[11px] font-semibold text-slate-400 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Event ID</th>
                <th className="py-2.5 px-3">{isRTL ? 'المنصة' : 'Platform'}</th>
                <th className="py-2.5 px-3">{isRTL ? 'النوع' : 'Event Type'}</th>
                <th className="py-2.5 px-3">{isRTL ? 'الحالة' : 'Status'}</th>
                <th className="py-2.5 px-3">{isRTL ? 'المرسل' : 'Sender'}</th>
                <th className="py-2.5 px-3">{isRTL ? 'التوقيت' : 'Time'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {webhookEvents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-sans">
                    {isRTL
                      ? 'لا توجد أحداث ويب هوك واردة بعد. ستظهر الأحداث فور إرسال رسائل من العملاء.'
                      : 'No inbound webhook events logged yet. Events will appear here upon customer messages.'}
                  </td>
                </tr>
              ) : (
                webhookEvents.slice(0, 6).map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 text-slate-600">{evt.id}</td>
                    <td className="py-2.5 px-3">
                      <PlatformBadge platform={evt.platform} showLabel={false} />
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">{evt.eventType}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {evt.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{evt.senderId}</td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {new Date(evt.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Configure Channel Modal */}
      {configModalAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div
            className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden"
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <PlatformBadge platform={configModalAccount.platform} />
                <h3 className="font-bold text-slate-900">
                  {isRTL ? 'ضبط بيانات الحساب والقناة' : 'Configure Account Credentials'}
                </h3>
              </div>
              <button
                onClick={() => setConfigModalAccount(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveChannelConfig} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {isRTL ? 'اسم الحساب' : 'Account Name'}
                </label>
                <input
                  type="text"
                  required
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {isRTL ? 'اسم المستخدم / المعرف' : 'Handle / Profile'}
                </label>
                <input
                  type="text"
                  required
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Meta Page ID
                  </label>
                  <input
                    type="text"
                    required
                    value={pageId}
                    onChange={(e) => setPageId(e.target.value)}
                    placeholder="10849204812394"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Meta App ID
                  </label>
                  <input
                    type="text"
                    value={appId}
                    onChange={(e) => setAppId(e.target.value)}
                    placeholder="89104819230912"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Meta Page Access Token
                </label>
                <input
                  type="password"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  placeholder="EAA..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  {isRTL
                    ? 'يتم تخزين المفتاح مشفراً على الخادم ويستخدم لإرسال الردود الرسمية.'
                    : 'Encrypted at rest on the backend and used for outbound message delivery.'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setConfigModalAccount(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={savingConfig}
                  className="px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
                >
                  {savingConfig
                    ? 'Saving...'
                    : isRTL
                    ? 'حفظ وتفعيل القناة'
                    : 'Save & Connect Channel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Simulator Modal */}
      <SimulateModal
        isOpen={showSimModal}
        onClose={() => setShowSimModal(false)}
      />
    </div>
  );
};
