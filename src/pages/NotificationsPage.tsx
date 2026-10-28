import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { NotificationItem } from '../types';
import {
  Bell,
  CheckCircle,
  MessageSquare,
  Bot,
  Radio,
  Clock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const {
    t,
    isRTL,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    openConversation,
    setActiveTab,
  } = useApp();

  const [filterType, setFilterType] = useState<string>('all');

  const filteredNotifs = notifications.filter((n) => {
    if (filterType === 'all') return true;
    return n.type === filterType;
  });

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="w-4 h-4 text-blue-600" />;
      case 'agent_x':
        return <Bot className="w-4 h-4 text-purple-600" />;
      case 'channel':
        return <Radio className="w-4 h-4 text-emerald-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  const handleNotificationClick = (n: NotificationItem) => {
    markNotificationRead(n.id);
    if (n.link?.includes('conv_')) {
      const match = n.link.match(/id=(conv_\w+)/);
      if (match) openConversation(match[1]);
    } else if (n.link === '/ai-automation') {
      setActiveTab('ai-automation');
    } else if (n.link === '/channels') {
      setActiveTab('channels');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Bell className="w-7 h-7 text-blue-600" />
            <span>{t('notificationsPageTitle')}</span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">{t('notificationsPageDesc')}</p>
        </div>

        <button
          onClick={() => markAllNotificationsRead()}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors self-start"
        >
          <CheckCircle className="w-4 h-4 text-blue-600" />
          <span>{t('markAllRead')}</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {['all', 'message', 'agent_x', 'channel', 'system'].map((f) => (
          <button
            key={f}
            onClick={() => setFilterType(f)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors capitalize ${
              filterType === f
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {f === 'all' ? t('all') : f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {filteredNotifs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p>{t('noNotifications')}</p>
          </div>
        ) : (
          filteredNotifs.map((n) => (
            <div
              key={n.id}
              onClick={() => handleNotificationClick(n)}
              className={`p-4 sm:p-5 flex items-start gap-3.5 hover:bg-slate-50/80 cursor-pointer transition-colors ${
                !n.read ? 'bg-blue-50/30' : ''
              }`}
            >
              <div className="p-2 rounded-lg bg-slate-100 shrink-0 mt-0.5">
                {getIcon(n.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-sm text-slate-900 truncate">
                    {isRTL ? n.titleAr : n.title}
                  </h3>
                  <span className="text-[11px] text-slate-400 whitespace-nowrap">
                    {new Date(n.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {isRTL ? n.messageAr : n.message}
                </p>

                {n.link && (
                  <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700">
                    <span>{isRTL ? 'عرض التفاصيل' : 'View Details'}</span>
                    <ArrowRight className={`w-3 h-3 ${isRTL ? 'rotate-180' : ''}`} />
                  </div>
                )}
              </div>

              {!n.read && (
                <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-2" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
