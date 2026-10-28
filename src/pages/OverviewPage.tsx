import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { DashboardStats, Conversation, ConnectedAccount, AgentXConfig } from '../types';
import { PlatformBadge, StatusBadge, PriorityBadge } from '../components/common/Badge';
import {
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Bot,
  Radio,
  ArrowUpRight,
  Sparkles,
  Inbox,
  Send,
  Shield,
  Activity,
  Layers,
} from 'lucide-react';

export const OverviewPage: React.FC = () => {
  const { t, isRTL, openConversation, setActiveTab, refreshCount } = useApp();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentConversations, setRecentConversations] = useState<Conversation[]>([]);
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [agentX, setAgentX] = useState<AgentXConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsRes, convRes, channelsRes, agentXRes] = await Promise.all([
          fetch('/api/stats'),
          fetch('/api/conversations'),
          fetch('/api/channels'),
          fetch('/api/agent-x/config'),
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        if (convRes.ok) {
          const convData = await convRes.json();
          setRecentConversations((convData.conversations || []).slice(0, 5));
        }

        if (channelsRes.ok) {
          const chData = await channelsRes.json();
          setAccounts(chData.accounts || []);
        }

        if (agentXRes.ok) {
          const axData = await agentXRes.json();
          setAgentX(axData.config);
        }
      } catch (err) {
        console.error('Failed to load overview data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [refreshCount]);

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 flex items-center justify-center gap-2">
        <Activity className="w-5 h-5 animate-spin text-blue-600" />
        <span>{t('loading')}</span>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Title & Environment Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {t('overviewTitle')}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">{t('overviewDesc')}</p>
        </div>

        <button
          onClick={() => setActiveTab('inbox')}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors self-start"
        >
          <Inbox className="w-4 h-4" />
          <span>{t('navInbox')}</span>
        </button>
      </div>

      {/* Production & Verification Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-4 flex items-start gap-3 text-xs shadow-xs">
        <Shield className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <div className="flex-1">
          <span className="font-bold">
            {isRTL ? 'بيئة التشغيل الإنتاجية الموحدة:' : 'Production Workspace Active:'}{' '}
          </span>
          <span className="text-slate-300">
            {isRTL
              ? 'تم تفريغ كافة البيانات التجريبية. نظام الاستقبال الموحد نشط وبانتظار أحداث الويب هوك من إنستغرام وفيسبوك مسنجر.'
              : 'All mock data cleared. Omnichannel webhook receiver is live and ready for Meta Instagram and Facebook Messenger integration.'}
          </span>
        </div>
      </div>

      {/* Primary KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">{t('statTotalConversations')}</span>
            <MessageSquare className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {stats?.totalConversations || 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {isRTL ? 'إجمالي الرسائل الواردة' : 'Total inbound'}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">{t('statOpenConversations')}</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600">
            {stats?.openConversations || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {stats?.pendingConversations || 0} {t('pending')}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">{t('statUnreadMessages')}</span>
            <Inbox className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {stats?.unreadMessages || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {isRTL ? 'تحتاج استجابة' : 'Needs attention'}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">{t('statReceivedToday')}</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {stats?.messagesTodayReceived || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {isRTL ? 'وارد القنوات' : 'Inbound DMs'}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">{t('statSentToday')}</span>
            <Send className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {stats?.messagesTodaySent || 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {isRTL ? 'ردود الموظفين والـ AI' : 'Replies & AI'}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">{t('statAiHandled')}</span>
            <Bot className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-700">
            {stats?.aiHandledCount || 0}
          </div>
          <div className="text-[11px] text-purple-600 font-medium mt-1">
            {stats?.resolutionRatePct || 0}% {isRTL ? 'نسبة الحل' : 'resolved'}
          </div>
        </div>
      </div>

      {/* Middle Grid: Platform Status & Agent X Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Connected Channels Widget */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-blue-600" />
              <h2 className="font-bold text-sm text-slate-900">
                {t('connectedChannelsTitle')}
              </h2>
            </div>
            <button
              onClick={() => setActiveTab('channels')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            >
              {isRTL ? 'إدارة القنوات' : 'Manage Channels'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accounts.map((acc) => {
              const isConnected = acc.status === 'connected';
              return (
                <div
                  key={acc.id}
                  className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <PlatformBadge platform={acc.platform} />
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                          isConnected ? 'text-emerald-600' : 'text-amber-600'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
                          }`}
                        />
                        {isConnected ? t('connected') : isRTL ? 'بانتظار الضبط' : 'Pending Setup'}
                      </span>
                    </div>
                    <p className="font-bold text-sm text-slate-900">{acc.accountName}</p>
                    <p className="text-xs text-slate-500 font-mono">{acc.handle}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
                    <span>
                      {isConnected
                        ? isRTL
                          ? 'الويب هوك: مفعل'
                          : 'Webhook: Active'
                        : isRTL
                        ? 'الويب هوك: جاهز للربط'
                        : 'Webhook: Ready to link'}
                    </span>
                    <button
                      onClick={() => setActiveTab('channels')}
                      className="text-blue-600 font-semibold hover:underline"
                    >
                      {isRTL ? 'ضبط البيانات' : 'Configure'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Agent X Status Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-purple-600" />
                <h2 className="font-bold text-sm text-slate-900">
                  {t('agentXStatusTitle')}
                </h2>
              </div>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                  agentX?.isConnected
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    agentX?.isConnected ? 'bg-purple-600 animate-pulse' : 'bg-slate-400'
                  }`}
                />
                {agentX?.isConnected ? 'Live' : 'Standby'}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">{t('aiModel')}</span>
                <span className="font-medium text-slate-800">
                  {agentX?.modelVariant || 'AgentX Omni-Fintech v2.4'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">{t('aiLatency')}</span>
                <span className="font-mono text-slate-700 font-semibold">
                  {agentX?.lastTestLatencyMs ? `${agentX.lastTestLatencyMs}ms` : (isRTL ? 'غير مفحوص' : 'Untested')}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">{t('autoReplyEnabled')}</span>
                <span className="font-semibold text-slate-800">
                  {agentX?.autoReplyEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500">{isRTL ? 'حالة الاعتماد' : 'Integration'}</span>
                <span className="font-semibold text-blue-600">
                  {agentX?.isConnected ? 'Linked' : 'Ready to Configure'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('ai-automation')}
            className="mt-4 w-full py-2 px-3 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors text-center"
          >
            {isRTL ? 'إعدادات الأتمتة واختبار المحرك' : 'Open AI Automation Settings'}
          </button>
        </div>
      </div>

      {/* Bottom Grid: Recent Inquiries & Integration Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Conversations */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm text-slate-900">
              {t('recentConversationsTitle')}
            </h2>
            <button
              onClick={() => setActiveTab('conversations')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            >
              {t('viewAll')}
            </button>
          </div>

          {recentConversations.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 space-y-2">
              <MessageSquare className="w-8 h-8 mx-auto text-slate-300" />
              <p className="font-semibold text-slate-700">
                {isRTL ? 'لا توجد استفسارات عملاء حالياً' : 'No Customer Inquiries Yet'}
              </p>
              <p className="text-[11px] text-slate-400">
                {isRTL
                  ? 'ستظهر هنا المحادثات الواردة فور إرسال العملاء لرسائل عبر قنوات Meta.'
                  : 'Customer messages from Meta channels will appear here automatically.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left" dir={isRTL ? 'rtl' : 'ltr'}>
                <thead className="text-[11px] font-semibold text-slate-400 uppercase bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">{isRTL ? 'العميل' : 'Customer'}</th>
                    <th className="py-2.5 px-3">{isRTL ? 'القناة' : 'Channel'}</th>
                    <th className="py-2.5 px-3">{isRTL ? 'آخر رسالة' : 'Last Snippet'}</th>
                    <th className="py-2.5 px-3">{isRTL ? 'الحالة' : 'Status'}</th>
                    <th className="py-2.5 px-3">{isRTL ? 'إجراء' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentConversations.map((conv) => (
                    <tr key={conv.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <img
                            src={
                              conv.customer?.avatar ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
                            }
                            alt={conv.customer?.name}
                            className="w-7 h-7 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-semibold text-slate-800">
                              {conv.customer?.name}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              {conv.customer?.handle}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <PlatformBadge platform={conv.platform} showLabel={false} />
                      </td>
                      <td className="py-3 px-3 max-w-xs">
                        <p className="truncate text-slate-600">{conv.lastMessageSnippet}</p>
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge status={conv.status} isAr={isRTL} />
                      </td>
                      <td className="py-3 px-3">
                        <button
                          onClick={() => openConversation(conv.id)}
                          className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                        >
                          {isRTL ? 'فتح الشات' : 'Open'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Integration Activity Feed */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm text-slate-900">
              {t('recentActivityTitle')}
            </h2>
            <button
              onClick={() => setActiveTab('channels')}
              className="text-xs text-slate-500 hover:text-slate-800 hover:underline"
            >
              {isRTL ? 'السجلات' : 'Logs'}
            </button>
          </div>

          <div className="space-y-3">
            {stats?.recentLogs && stats.recentLogs.length > 0 ? (
              stats.recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/60 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-slate-600">{log.source}</span>
                    <span className="text-slate-400">
                      {new Date(log.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-slate-700 leading-snug">{log.message}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">
                {t('noActivityYet')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Developer Seal Banner - AI Developer: Omar Abdeen */}
      <div className="rounded-xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-4 border border-blue-500/30 text-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-blue-500/30 ring-1 ring-white/20">
            <Sparkles className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-wide">
                {t('developerBadge')}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-500/30 text-blue-300 border border-blue-400/30">
                Official Developer Seal
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {isRTL
                ? 'تم بناء وهندسة منصة بيكيا باي الموحدة وفق أعلى معايير أداء الذكاء الاصطناعي وبوابات الدفع الإلكترونية'
                : 'Architected and built for Bekya Pay with enterprise omnichannel integration and Agent X AI intelligence.'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 self-end sm:self-center font-mono">
          <span>v2.4.0-prod</span>
          <span>•</span>
          <span className="text-emerald-400">System Healthy</span>
        </div>
      </div>
    </div>
  );
};
