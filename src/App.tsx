import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { OverviewPage } from './pages/OverviewPage';
import { UnifiedInboxPage } from './pages/UnifiedInboxPage';
import { ConversationsPage } from './pages/ConversationsPage';
import { CustomersPage } from './pages/CustomersPage';
import { AiAutomationPage } from './pages/AiAutomationPage';
import { ConnectedChannelsPage } from './pages/ConnectedChannelsPage';
import { TeamMembersPage } from './pages/TeamMembersPage';
import { ReportsPage } from './pages/ReportsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';

const AppContent: React.FC = () => {
  const { activeTab, isRTL, isAuthenticated, authLoading } = useApp();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // If verifying authentication state, show clean loading splash
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/30 animate-pulse mb-4">
          B
        </div>
        <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
          <span className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span>Bekya Pay Unified Dashboard...</span>
        </div>
      </div>
    );
  }

  // If not authenticated, render the dedicated Login Page
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderActivePage = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewPage />;
      case 'inbox':
        return <UnifiedInboxPage />;
      case 'conversations':
        return <ConversationsPage />;
      case 'customers':
        return <CustomersPage />;
      case 'ai-automation':
        return <AiAutomationPage />;
      case 'channels':
        return <ConnectedChannelsPage />;
      case 'team':
        return <TeamMembersPage />;
      case 'reports':
        return <ReportsPage />;
      case 'notifications':
        return <NotificationsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <OverviewPage />;
    }
  };

  return (
    <div
      className="min-h-screen bg-slate-50 text-slate-900 flex flex-row antialiased selection:bg-blue-600 selection:text-white"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Sidebar Navigation */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          mobileSidebarOpen={mobileSidebarOpen}
        />

        <main className="flex-1 overflow-y-auto">
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
