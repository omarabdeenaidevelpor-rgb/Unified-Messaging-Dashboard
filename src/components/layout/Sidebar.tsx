import React from 'react';
import { useApp } from '../../context/AppContext';
import { NavTab } from '../../types';
import {
  LayoutDashboard,
  Inbox,
  MessageSquare,
  Users,
  Bot,
  Radio,
  UserCheck,
  BarChart3,
  Bell,
  Settings,
  CreditCard,
  CheckCircle,
  Sparkles,
  LogOut,
} from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { activeTab, setActiveTab, t, isRTL, unreadNotifsCount, currentUser, logout } = useApp();

  const navItems: Array<{
    id: NavTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }> = [
    { id: 'overview', label: t('navOverview'), icon: LayoutDashboard },
    { id: 'inbox', label: t('navInbox'), icon: Inbox },
    { id: 'conversations', label: t('navConversations'), icon: MessageSquare },
    { id: 'customers', label: t('navCustomers'), icon: Users },
    { id: 'ai-automation', label: t('navAiAutomation'), icon: Bot },
    { id: 'channels', label: t('navChannels'), icon: Radio },
    { id: 'team', label: t('navTeam'), icon: UserCheck },
    { id: 'reports', label: t('navReports'), icon: BarChart3 },
    { id: 'notifications', label: t('navNotifications'), icon: Bell, badge: unreadNotifsCount },
    { id: 'settings', label: t('navSettings'), icon: Settings },
  ];

  const handleNavClick = (id: NavTab) => {
    setActiveTab(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 z-40 h-screen w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 transition-transform duration-200 ease-in-out md:translate-x-0 ${
          mobileOpen
            ? 'translate-x-0'
            : isRTL
            ? 'translate-x-full md:translate-x-0'
            : '-translate-x-full md:translate-x-0'
        } ${isRTL ? 'right-0 border-l border-slate-800' : 'left-0 border-r border-slate-800'}`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-800/80">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-white">
                {t('brandName')}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              {isRTL ? 'منصة المراسلة الموحدة' : 'Unified Inbox'}
            </p>
          </div>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {isRTL ? 'القوائم الرئيسية' : 'Main Menu'}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-sm shadow-blue-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive
                        ? 'bg-white text-blue-700'
                        : 'bg-red-500 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Current Active User Tile with Logout */}
        {currentUser && (
          <div className="px-3 py-2 border-t border-slate-800/80 bg-slate-900/60">
            <div className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-slate-800/50 border border-slate-800">
              <div className="flex items-center gap-2 min-w-0">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-700 shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-200 truncate leading-tight">
                    {currentUser.name}
                  </p>
                  <p className="text-[10px] text-slate-400 capitalize truncate">
                    {currentUser.role}
                  </p>
                </div>
              </div>
              <button
                onClick={() => logout()}
                title={t('logout')}
                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700/60 rounded-md transition-colors shrink-0 cursor-pointer"
                aria-label={t('logout')}
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Developer Seal - AI Developer: Omar Abdeen */}
        <div className="px-3 py-2.5 border-t border-slate-800/80 bg-gradient-to-b from-slate-900 to-slate-950">
          <div className="rounded-xl bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 p-2.5 border border-blue-500/30 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-sm shadow-blue-500/30 ring-1 ring-white/10">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-white tracking-tight truncate">
                    {t('developerBadge')}
                  </span>
                </div>
                <p className="text-[10px] text-blue-300/80 font-medium truncate">
                  {t('developerBadgeSub')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Integration Status Pill */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
          <div className="rounded-lg bg-slate-800/60 p-2.5 border border-slate-800 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-medium text-slate-400">
                {isRTL ? 'حالة الربط' : 'Integration Status'}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-400">
                <CheckCircle className="w-3 h-3" />
                Ready
              </span>
            </div>
            <div className="space-y-1 text-[10px]">
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Instagram DM</span>
                <span className="text-blue-400 font-mono">Ready</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Facebook Page</span>
                <span className="text-blue-400 font-mono">Ready</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Agent X AI</span>
                <span className="text-purple-400 font-mono">Ready</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
