import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Conversation, ConversationStatus, PlatformType } from '../types';
import { PlatformBadge, StatusBadge, PriorityBadge } from '../components/common/Badge';
import { Search, Filter, MessageSquare, ArrowRight, Bot, RotateCw, Trash2 } from 'lucide-react';

export const ConversationsPage: React.FC = () => {
  const { t, isRTL, openConversation, refreshCount, triggerRefresh } = useApp();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ConversationStatus>('all');
  const [channelFilter, setChannelFilter] = useState<'all' | PlatformType>('all');

  useEffect(() => {
    async function loadConversations() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (statusFilter !== 'all') params.append('status', statusFilter);
        if (channelFilter !== 'all') params.append('channel', channelFilter);
        if (search.trim()) params.append('search', search.trim());

        const res = await fetch(`/api/conversations?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setConversations(data.conversations || []);
        }
      } catch (err) {
        console.error('Failed to load conversations:', err);
      } finally {
        setLoading(false);
      }
    }
    loadConversations();
  }, [statusFilter, channelFilter, search, refreshCount]);

  const handleDeleteConversation = async (id: string) => {
    if (window.confirm(isRTL ? 'هل أنت متأكد من حذف هذه المحادثة وكافة رسائلها؟' : 'Delete this conversation and its messages?')) {
      try {
        const res = await fetch(`/api/conversations/${id}`, { method: 'DELETE' });
        if (res.ok) {
          triggerRefresh();
        }
      } catch (err) {
        console.error('Error deleting conversation:', err);
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {t('conversationsPageTitle')}
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">{t('conversationsPageDesc')}</p>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute top-2.5 start-3 text-slate-400" />
          <input
            type="text"
            placeholder={t('searchConversations')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">{isRTL ? 'كافة الحالات' : 'All Statuses'}</option>
            <option value="open">{isRTL ? 'مفتوحة' : 'Open'}</option>
            <option value="pending">{isRTL ? 'قيد الانتظار' : 'Pending'}</option>
            <option value="resolved">{isRTL ? 'تم الحل' : 'Resolved'}</option>
          </select>

          {/* Channel Filter */}
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value as any)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">{isRTL ? 'كافة القنوات' : 'All Channels'}</option>
            <option value="instagram">Instagram DM</option>
            <option value="facebook">Facebook Messenger</option>
          </select>
        </div>
      </div>

      {/* Conversations Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left" dir={isRTL ? 'rtl' : 'ltr'}>
            <thead className="text-[11px] font-semibold text-slate-400 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">{isRTL ? 'العميل' : 'Customer'}</th>
                <th className="py-3 px-4">{isRTL ? 'القناة' : 'Platform'}</th>
                <th className="py-3 px-4">{isRTL ? 'الموضوع والرسالة' : 'Topic & Snippet'}</th>
                <th className="py-3 px-4">{isRTL ? 'الحالة' : 'Status'}</th>
                <th className="py-3 px-4">{isRTL ? 'الأولوية' : 'Priority'}</th>
                <th className="py-3 px-4">{isRTL ? 'الموظف المسؤول' : 'Assignee'}</th>
                <th className="py-3 px-4">{isRTL ? 'التوقيت' : 'Time'}</th>
                <th className="py-3 px-4 text-center">{isRTL ? 'إجراء' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <RotateCw className="w-5 h-5 animate-spin mx-auto mb-2 text-slate-400" />
                    <span>{t('loading')}</span>
                  </td>
                </tr>
              ) : conversations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400 space-y-2">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-700">
                      {isRTL ? 'لا توجد محادثات مسجلة' : 'No Conversations Recorded'}
                    </p>
                    <p className="text-xs text-slate-400">
                      {isRTL
                        ? 'ستظهر هنا كافة المحادثات الواردة من قنوات التواصل الاجتماعي فور استقبالها.'
                        : 'All incoming customer messages from social channels will be logged here.'}
                    </p>
                  </td>
                </tr>
              ) : (
                conversations.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={
                            c.customer?.avatar ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
                          }
                          alt={c.customer?.name}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <p className="font-semibold text-slate-900">{c.customer?.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {c.customer?.handle}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <PlatformBadge platform={c.platform} />
                    </td>
                    <td className="py-3 px-4 max-w-sm">
                      <p className="font-medium text-slate-800 text-[11px] mb-0.5">
                        {c.topic}
                      </p>
                      <p className="text-slate-500 truncate">{c.lastMessageSnippet}</p>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={c.status} isAr={isRTL} />
                    </td>
                    <td className="py-3 px-4">
                      <PriorityBadge priority={c.priority} isAr={isRTL} />
                    </td>
                    <td className="py-3 px-4">
                      {c.isAiHandled ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                          <Bot className="w-3 h-3 text-purple-600" />
                          <span>Agent X</span>
                        </span>
                      ) : c.assignedUser ? (
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <img
                            src={c.assignedUser.avatar}
                            alt={c.assignedUser.name}
                            className="w-5 h-5 rounded-full object-cover"
                          />
                          <span>{c.assignedUser.name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">{t('unassigned')}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                      {new Date(c.lastMessageAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      {new Date(c.lastMessageAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openConversation(c.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          <span>{isRTL ? 'فتح' : 'Open'}</span>
                          <ArrowRight className={`w-3 h-3 ${isRTL ? 'rotate-180' : ''}`} />
                        </button>
                        <button
                          onClick={() => handleDeleteConversation(c.id)}
                          className="p-1.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete conversation"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
