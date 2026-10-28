import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  Globe,
  Sparkles,
  Bot,
  Menu,
  X,
  CheckCircle2,
  ChevronDown,
  UserCheck,
  LogOut,
} from 'lucide-react';
import { SimulateModal } from '../common/SimulateModal';

interface HeaderProps {
  onToggleMobileSidebar: () => void;
  mobileSidebarOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileSidebar,
  mobileSidebarOpen,
}) => {
  const {
    language,
    setLanguage,
    isRTL,
    t,
    currentUser,
    users,
    switchUser,
    logout,
    notifications,
    unreadNotifsCount,
    markNotificationRead,
    markAllNotificationsRead,
    openConversation,
    setActiveTab,
  } = useApp();

  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shadow-xs">
        {/* Left section: Mobile menu & Brand indicator */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileSidebar}
            aria-label="Toggle Navigation Menu"
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span>Meta Webhook: Ready</span>
              </span>

              <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                <Bot className="w-3.5 h-3.5 text-purple-600" />
                <span>Agent X: Ready to Link</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Section: Simulator, Notifications, Language, User profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Simulator Button */}
          <button
            onClick={() => setShowSimulateModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-all shadow-xs"
            title={isRTL ? 'محاكاة رسالة واردة من إنستغرام أو فيسبوك' : 'Simulate incoming customer message'}
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">
              {isRTL ? 'محاكاة رسالة واردة' : 'Simulate Inbound'}
            </span>
          </button>

          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors border border-slate-200/60"
              title={isRTL ? 'Switch to English' : 'التحويل إلى اللغة العربية'}
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>{language === 'en' ? 'العربية' : 'English'}</span>
            </button>
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifMenu(!showNotifMenu);
                setShowUserMenu(false);
              }}
              aria-label="Notifications"
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
              )}
            </button>

            {showNotifMenu && (
              <div
                className={`absolute top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 ${
                  isRTL ? 'left-0' : 'right-0'
                }`}
              >
                <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-sm text-slate-900">{t('navNotifications')}</span>
                    {unreadNotifsCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">
                        {unreadNotifsCount}
                      </span>
                    )}
                  </div>
                  {unreadNotifsCount > 0 && (
                    <button
                      onClick={() => markAllNotificationsRead()}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      {t('markAllRead')}
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      {t('noNotifications')}
                    </div>
                  ) : (
                    notifications.slice(0, 6).map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markNotificationRead(n.id);
                          if (n.link?.includes('conv_')) {
                            const match = n.link.match(/id=(conv_\w+)/);
                            if (match) openConversation(match[1]);
                          } else if (n.link === '/ai-automation') {
                            setActiveTab('ai-automation');
                          } else if (n.link === '/channels') {
                            setActiveTab('channels');
                          }
                          setShowNotifMenu(false);
                        }}
                        className={`p-3 text-xs hover:bg-slate-50 cursor-pointer transition-colors ${
                          !n.read ? 'bg-blue-50/40' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-slate-800">
                            {isRTL ? n.titleAr : n.title}
                          </p>
                          {!n.read && (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-slate-600 mt-0.5 text-[11px] line-clamp-2">
                          {isRTL ? n.messageAr : n.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-2 border-t border-slate-100 text-center">
                  <button
                    onClick={() => {
                      setActiveTab('notifications');
                      setShowNotifMenu(false);
                    }}
                    className="text-xs font-medium text-blue-600 hover:underline"
                  >
                    {t('viewAll')}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Active User Menu & Role Switcher */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifMenu(false);
              }}
              className="flex items-center gap-2 p-1 pl-2 rounded-lg hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
            >
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={currentUser?.name}
                className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-300"
              />
              <div className="hidden sm:block text-left text-xs">
                <div className="flex items-center gap-1.5">
                  <p className="font-semibold text-slate-800 leading-tight">{currentUser?.name}</p>
                  {(currentUser?.developerBadge || currentUser?.id === 'user_1') && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs" title="Verified AI Developer">
                      <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                      <span>AI Dev</span>
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 capitalize">{currentUser?.role}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showUserMenu && (
              <div
                className={`absolute top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 ${
                  isRTL ? 'left-0' : 'right-0'
                }`}
              >
                <div className="px-4 py-2 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      {t('currentSessionUser')}
                    </p>
                    {(currentUser?.developerBadge || currentUser?.id === 'user_1') && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        <Sparkles className="w-2.5 h-2.5 text-blue-600" />
                        AI Developer
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-slate-800 mt-1">{currentUser?.name}</p>
                  <p className="text-[11px] text-slate-500">{currentUser?.email}</p>
                  {(currentUser?.developerBadge || currentUser?.id === 'user_1') && (
                    <div className="mt-2 p-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
                      <p className="font-semibold text-blue-700">{t('developerBadge')}</p>
                      <p className="text-[10px] text-slate-400">{t('developerBadgeSub')}</p>
                    </div>
                  )}
                </div>

                <div className="py-1">
                  <p className="px-4 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {t('switchUser')}
                  </p>
                  {users.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        switchUser(u.id);
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center justify-between px-4 py-2 text-xs hover:bg-slate-50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-medium text-slate-800">{u.name}</p>
                          <p className="text-[10px] text-slate-400">{u.role} • {u.department}</p>
                        </div>
                      </div>
                      {currentUser?.id === u.id && (
                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Sign Out Button */}
                <div className="pt-1 mt-1 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors text-start font-medium cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-red-500 shrink-0" />
                    <span>{t('logout')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Simulator Modal */}
      <SimulateModal
        isOpen={showSimulateModal}
        onClose={() => setShowSimulateModal(false)}
      />
    </>
  );
};
