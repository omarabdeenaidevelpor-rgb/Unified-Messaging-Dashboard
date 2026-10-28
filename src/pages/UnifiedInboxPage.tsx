import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import {
  Conversation,
  Message,
  Customer,
  ConversationStatus,
  PlatformType,
} from '../types';
import { PlatformBadge, StatusBadge, PriorityBadge, SenderBadge } from '../components/common/Badge';
import {
  Search,
  Send,
  Sparkles,
  Bot,
  User,
  Check,
  CheckCheck,
  Clock,
  ChevronDown,
  Filter,
  CreditCard,
  MessageSquare,
  AlertCircle,
  Tag,
  MapPin,
  Phone,
  Mail,
  FileText,
  Save,
  RotateCw,
  ArrowLeft,
  ArrowRight,
  Info,
  X,
} from 'lucide-react';

export const UnifiedInboxPage: React.FC = () => {
  const {
    t,
    isRTL,
    selectedConversationId,
    setSelectedConversationId,
    currentUser,
    users,
    refreshCount,
    triggerRefresh,
  } = useApp();

  // State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSuccess, setNotesSuccess] = useState(false);
  const [simulatingAi, setSimulatingAi] = useState(false);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ConversationStatus>('all');
  const [channelFilter, setChannelFilter] = useState<'all' | PlatformType>('all');
  const [unreadOnly, setUnreadOnly] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations list
  const fetchConversations = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (channelFilter !== 'all') params.append('channel', channelFilter);
      if (unreadOnly) params.append('unreadOnly', 'true');
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await fetch(`/api/conversations?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);

        // If on desktop and no conversation currently selected, pick first
        const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;
        if (isDesktop && !selectedConversationId && data.conversations?.length > 0) {
          setSelectedConversationId(data.conversations[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoadingList(false);
    }
  }, [statusFilter, channelFilter, unreadOnly, searchQuery, selectedConversationId, setSelectedConversationId]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations, refreshCount]);

  // Fetch active conversation detail & messages
  const fetchActiveConversation = useCallback(async (id: string) => {
    setLoadingMessages(true);
    try {
      const res = await fetch(`/api/conversations/${id}`);
      if (res.ok) {
        const data = await res.json();
        setActiveConversation(data.conversation);
        setMessages(data.messages || []);
        setCustomerNotes(data.conversation?.customer?.notes || '');

        // Mark read
        if (data.conversation?.unreadCount > 0) {
          await fetch(`/api/conversations/${id}/read`, { method: 'POST' });
          setConversations((prev) =>
            prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
          );
        }
      }
    } catch (err) {
      console.error('Error fetching active conversation:', err);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    if (selectedConversationId) {
      fetchActiveConversation(selectedConversationId);
    } else {
      setActiveConversation(null);
      setMessages([]);
    }
  }, [selectedConversationId, fetchActiveConversation]);

  // Auto scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send outgoing reply
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!replyText.trim() || !activeConversation || sendingMessage) return;

    setSendingMessage(true);
    try {
      const res = await fetch(`/api/conversations/${activeConversation.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: replyText.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.message]);
        setReplyText('');

        // Update active conversation locally
        setActiveConversation((prev) =>
          prev
            ? {
                ...prev,
                lastMessageSnippet: data.message.text,
                lastMessageAt: data.message.timestamp,
                unreadCount: 0,
              }
            : null
        );

        // Update list snippet
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConversation.id
              ? {
                  ...c,
                  lastMessageSnippet: data.message.text,
                  lastMessageAt: data.message.timestamp,
                  unreadCount: 0,
                }
              : c
          )
        );
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSendingMessage(false);
    }
  };

  // Status Change
  const handleStatusChange = async (newStatus: ConversationStatus) => {
    if (!activeConversation) return;
    try {
      const res = await fetch(`/api/conversations/${activeConversation.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setActiveConversation((prev) => (prev ? { ...prev, status: newStatus } : null));
        setConversations((prev) =>
          prev.map((c) => (c.id === activeConversation.id ? { ...c, status: newStatus } : c))
        );
      }
    } catch (err) {
      console.error('Error changing status:', err);
    }
  };

  // Assignee Change
  const handleAssigneeChange = async (userId: string) => {
    if (!activeConversation) return;
    try {
      const res = await fetch(`/api/conversations/${activeConversation.id}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedToUserId: userId || null }),
      });
      if (res.ok) {
        const assignedUser = users.find((u) => u.id === userId) || null;
        setActiveConversation((prev) =>
          prev ? { ...prev, assignedToUserId: userId || null, assignedUser } : null
        );
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConversation.id
              ? { ...c, assignedToUserId: userId || null, assignedUser }
              : c
          )
        );
      }
    } catch (err) {
      console.error('Error assigning user:', err);
    }
  };

  // Toggle AI Auto-Pilot
  const handleToggleAi = async () => {
    if (!activeConversation) return;
    const newState = !activeConversation.isAiHandled;
    try {
      const res = await fetch(`/api/conversations/${activeConversation.id}/ai-toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAiHandled: newState }),
      });
      if (res.ok) {
        setActiveConversation((prev) => (prev ? { ...prev, isAiHandled: newState } : null));
        setConversations((prev) =>
          prev.map((c) => (c.id === activeConversation.id ? { ...c, isAiHandled: newState } : c))
        );
      }
    } catch (err) {
      console.error('Error toggling AI:', err);
    }
  };

  // Simulate Agent X automated response
  const handleSimulateAgentX = async () => {
    if (!activeConversation || simulatingAi) return;
    setSimulatingAi(true);
    try {
      const res = await fetch('/api/agent-x/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: activeConversation.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.message]);
        setActiveConversation((prev) =>
          prev
            ? {
                ...prev,
                isAiHandled: true,
                lastMessageSnippet: data.message.text,
                lastMessageAt: data.message.timestamp,
              }
            : null
        );
        triggerRefresh();
      }
    } catch (err) {
      console.error('Error simulating AI:', err);
    } finally {
      setSimulatingAi(false);
    }
  };

  // Save Customer Notes
  const handleSaveNotes = async () => {
    if (!activeConversation?.customer) return;
    setSavingNotes(true);
    try {
      const res = await fetch(`/api/customers/${activeConversation.customer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: customerNotes }),
      });
      if (res.ok) {
        setNotesSuccess(true);
        setTimeout(() => setNotesSuccess(false), 2500);
      }
    } catch (err) {
      console.error('Failed to save notes:', err);
    } finally {
      setSavingNotes(false);
    }
  };

  // Canned quick replies
  const quickReplies = [
    {
      title: t('quickReplyInstaPay'),
      text: isRTL
        ? 'عزيزي العميل، تتم معالجة تحويلات إنستاباي فورياً. برجاء التأكد من ظهور حالة المعاملة "ناجحة" في تطبيق البنك وتزويدنا برقم الإشعار RRN لمطابقته.'
        : 'Dear customer, InstaPay transfers are processed in real time. Please ensure the status shows "Successful" in your banking app and provide the RRN reference number.',
    },
    {
      title: t('quickReplyPos'),
      text: isRTL
        ? 'توفر بيكيا باي ماكينات نقاط بيع ذكية مع دعم الدفع اللاتلامسي والتقسيط والربط مع الحسابات البنكية المصرية. التوريد يتم خلال ٤٨ ساعة عمل.'
        : 'Bekya Pay provides Android Smart POS terminals with NFC, installment support, and settlement to Egyptian bank accounts within 48 hours.',
    },
    {
      title: t('quickReplyInstallments'),
      text: isRTL
        ? 'يمكن لعملائك تقسيط المشتريات على ٦ أو ١٢ أو ٢٤ شهراً عبر فاليو (ValU)، أمان، وسهولة بعمولة تاجر تبدأ من ١.٨٪ وبدون إجراءات ورقية معقدة.'
        : 'Your customers can split payments across 6, 12, or 24 months via ValU, Aman, and Souhoola with competitive merchant MDR starting at 1.8%.',
    },
    {
      title: t('quickReplyKyc'),
      text: isRTL
        ? 'لترقية حدود المحفظة أو الحساب التجاري، يرجى إرسال صورة سارية من بطاقة الرقم القومي أو السجل التجاري والبطاقة الضريبية.'
        : 'To upgrade wallet limits or merchant tier, please upload a valid national ID card copy or commercial register and tax card.',
    },
  ];

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col lg:flex-row bg-slate-50 overflow-hidden">
      {/* =========================================================================
          COLUMN 1: CONVERSATIONS LIST & FILTERS
         ========================================================================= */}
      <div
        className={`w-full lg:w-80 xl:w-96 flex flex-col shrink-0 bg-white border-r border-slate-200 ${
          activeConversation ? 'hidden lg:flex' : 'flex'
        }`}
      >
        {/* Header & Search */}
        <div className="p-4 border-b border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="font-bold text-base text-slate-900">{t('inboxTitle')}</h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
              {conversations.length}
            </span>
          </div>

          {/* Search Field */}
          <div className="relative">
            <Search className="w-4 h-4 absolute top-2.5 start-3 text-slate-400" />
            <input
              type="text"
              placeholder={t('searchConversations')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          {/* Channel Tabs */}
          <div className="flex rounded-lg bg-slate-100 p-1 text-xs">
            <button
              onClick={() => setChannelFilter('all')}
              className={`flex-1 py-1 rounded-md font-medium transition-all ${
                channelFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('all')}
            </button>
            <button
              onClick={() => setChannelFilter('instagram')}
              className={`flex-1 py-1 rounded-md font-medium transition-all flex items-center justify-center gap-1 ${
                channelFilter === 'instagram'
                  ? 'bg-white text-pink-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
              <span>IG</span>
            </button>
            <button
              onClick={() => setChannelFilter('facebook')}
              className={`flex-1 py-1 rounded-md font-medium transition-all flex items-center justify-center gap-1 ${
                channelFilter === 'facebook'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span>FB</span>
            </button>
          </div>

          {/* Status Filters Bar */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
            {(['all', 'open', 'pending', 'resolved'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-full whitespace-nowrap font-medium transition-colors ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st === 'all'
                  ? t('all')
                  : st === 'open'
                  ? t('open')
                  : st === 'pending'
                  ? t('pending')
                  : t('resolved')}
              </button>
            ))}

            <button
              onClick={() => setUnreadOnly(!unreadOnly)}
              className={`px-2 py-1 rounded-full whitespace-nowrap font-medium transition-colors ${
                unreadOnly
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t('unread')}
            </button>
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {loadingList ? (
            <div className="py-12 text-center text-xs text-slate-400">
              <RotateCw className="w-4 h-4 animate-spin mx-auto mb-2 text-slate-400" />
              <span>{t('loading')}</span>
            </div>
          ) : conversations.length === 0 ? (
            <div className="py-16 px-6 text-center text-xs space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-sm text-slate-800">
                  {isRTL ? 'لا توجد محادثات نشطة' : 'No Active Conversations'}
                </p>
                <p className="text-slate-500 mt-1 leading-relaxed text-[11px]">
                  {isRTL
                    ? 'سيتم إدراج الرسائل الواردة فور إرسالها من العملاء عبر إنستغرام وفيسبوك.'
                    : 'Customer messages from Instagram DM and Messenger will appear here automatically.'}
                </p>
              </div>
              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => (window as any).__openSimulateModal?.()}
                  className="w-full py-2 px-3 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                >
                  {isRTL ? 'محاكاة رسالة واردة للاختبار' : 'Simulate Incoming Message'}
                </button>
              </div>
            </div>
          ) : (
            conversations.map((conv) => {
              const isSelected = selectedConversationId === conv.id;
              return (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConversationId(conv.id)}
                  className={`p-3.5 cursor-pointer transition-all border-l-4 ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-600'
                      : 'hover:bg-slate-50 border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Customer Avatar & Channel Icon */}
                    <div className="relative shrink-0">
                      <img
                        src={
                          conv.customer?.avatar ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
                        }
                        alt={conv.customer?.name}
                        className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200"
                      />
                      <div className="absolute -bottom-1 -end-1">
                        <PlatformBadge platform={conv.platform} showLabel={false} />
                      </div>
                    </div>

                    {/* Meta & Snippet */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="font-semibold text-xs text-slate-900 truncate">
                          {conv.customer?.name || 'Customer'}
                        </p>
                        <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                          {new Date(conv.lastMessageAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-1 mb-1.5 font-normal">
                        {conv.lastMessageSnippet}
                      </p>

                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5">
                          <StatusBadge status={conv.status} isAr={isRTL} />
                          {conv.isAiHandled && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700">
                              <Bot className="w-2.5 h-2.5" />
                              <span>AI</span>
                            </span>
                          )}
                        </div>

                        {conv.unreadCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white shrink-0">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* =========================================================================
          COLUMN 2: ACTIVE CONVERSATION CHAT WINDOW
         ========================================================================= */}
      <div
        className={`flex-1 flex flex-col bg-slate-100 border-r border-slate-200 min-w-0 ${
          activeConversation ? 'flex' : 'hidden lg:flex'
        }`}
      >
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="h-16 px-3 sm:px-6 bg-white border-b border-slate-200 flex items-center justify-between gap-2 shadow-xs shrink-0">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                {/* Back to list button on mobile / tablet */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveConversation(null);
                    setSelectedConversationId(null);
                  }}
                  className="lg:hidden p-1.5 -ms-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center justify-center shrink-0"
                  title={t('backToInbox')}
                  aria-label={t('backToInbox')}
                >
                  {isRTL ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
                </button>

                <img
                  src={
                    activeConversation.customer?.avatar ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
                  }
                  alt={activeConversation.customer?.name}
                  className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h2 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                      {activeConversation.customer?.name}
                    </h2>
                    <PlatformBadge platform={activeConversation.platform} showLabel={false} />
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono truncate">
                    {activeConversation.customer?.handle} • {activeConversation.topic}
                  </p>
                </div>
              </div>

              {/* Status and Controls */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {/* AI Toggle Switch */}
                <button
                  type="button"
                  onClick={handleToggleAi}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    activeConversation.isAiHandled
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                  title={
                    activeConversation.isAiHandled
                      ? t('aiAutomationOn')
                      : t('aiAutomationOff')
                  }
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">
                    {activeConversation.isAiHandled ? 'Agent X: ON' : 'Agent X: PAUSED'}
                  </span>
                </button>

                {/* Status Dropdown */}
                <select
                  value={activeConversation.status}
                  onChange={(e) =>
                    handleStatusChange(e.target.value as ConversationStatus)
                  }
                  className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="open">{isRTL ? 'مفتوحة' : 'Open'}</option>
                  <option value="pending">{isRTL ? 'قيد الانتظار' : 'Pending'}</option>
                  <option value="resolved">{isRTL ? 'تم الحل' : 'Resolved'}</option>
                </select>

                {/* Assignee Dropdown */}
                <select
                  value={activeConversation.assignedToUserId || ''}
                  onChange={(e) => handleAssigneeChange(e.target.value)}
                  className="hidden md:block text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t('unassigned')}</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>

                {/* Customer Details Toggle on Mobile / Tablet */}
                <button
                  type="button"
                  onClick={() => setShowCustomerDetails(!showCustomerDetails)}
                  className={`p-2 rounded-lg border text-xs font-semibold transition-colors lg:hidden ${
                    showCustomerDetails
                      ? 'bg-blue-50 text-blue-700 border-blue-300'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                  title={t('customerDetails')}
                  aria-label={t('customerDetails')}
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Messages Stream */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {loadingMessages ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  <RotateCw className="w-5 h-5 animate-spin mx-auto mb-2 text-slate-400" />
                  <span>{t('loading')}</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  {t('noConversationsFound')}
                </div>
              ) : (
                messages.map((msg) => {
                  const isIncoming = msg.senderType === 'customer';
                  const isAi = msg.senderType === 'ai';

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        isIncoming ? 'items-start' : 'items-end'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        <SenderBadge senderType={msg.senderType} isAr={isRTL} />
                        <span className="text-[10px] text-slate-400">
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      {/* Bubble */}
                      <div
                        className={`max-w-md lg:max-w-lg rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                          isIncoming
                            ? 'bg-white text-slate-900 border border-slate-200/80 rounded-tl-xs'
                            : isAi
                            ? 'bg-purple-600 text-white rounded-tr-xs shadow-purple-600/20'
                            : 'bg-blue-600 text-white rounded-tr-xs shadow-blue-600/20'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      </div>

                      {/* Delivery Status Indicator */}
                      {!isIncoming && (
                        <div className="flex items-center gap-1 mt-0.5 px-1 text-[10px] text-slate-400">
                          {msg.deliveryStatus === 'read' ? (
                            <span className="inline-flex items-center gap-0.5 text-blue-600 font-medium">
                              <CheckCheck className="w-3 h-3" />
                              <span>{isRTL ? 'تمت القراءة' : 'Read'}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 text-slate-400">
                              <Check className="w-3 h-3" />
                              <span>{isRTL ? 'تم التسليم' : 'Delivered'}</span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Canned Replies Bar */}
            <div className="px-4 py-2 bg-white border-t border-slate-200 flex items-center gap-2 overflow-x-auto text-xs shrink-0">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                <FileText className="w-3 h-3" />
                <span>{t('quickReplies')}:</span>
              </span>
              {quickReplies.map((qr, idx) => (
                <button
                  key={idx}
                  onClick={() => setReplyText(qr.text)}
                  className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 whitespace-nowrap text-xs transition-colors shrink-0"
                >
                  {qr.title}
                </button>
              ))}
            </div>

            {/* Message Composer */}
            <div className="p-4 bg-white border-t border-slate-200 shrink-0">
              <form onSubmit={handleSendMessage} className="space-y-2">
                <div className="relative">
                  <textarea
                    rows={2}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder={t('typeMessagePlaceholder')}
                    className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none"
                  />
                </div>

                <div className="flex items-center justify-between">
                  {/* Simulate AI Action Button */}
                  <button
                    type="button"
                    onClick={handleSimulateAgentX}
                    disabled={simulatingAi}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>
                      {simulatingAi
                        ? isRTL
                          ? 'جاري صياغة الرد الذكي...'
                          : 'Agent X Thinking...'
                        : t('simulateAiResponse')}
                    </span>
                  </button>

                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={!replyText.trim() || sendingMessage}
                    className="inline-flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all disabled:opacity-40"
                  >
                    <Send className="w-4 h-4" />
                    <span>{sendingMessage ? t('sending') : t('send')}</span>
                  </button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-400">
              <MessageSquare className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-800">
                {isRTL ? 'صندوق الوارد الموحد جاهز' : 'Unified Inbox Ready'}
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {isRTL
                  ? 'اختر محادثة من القائمة للرد الفوري، أو استخدم زر المحاكاة بالأعلى لتجربة تدفق الرسائل الواردة.'
                  : 'Select a conversation from the left to reply, or use the Simulate Inbound button above to test real-time message ingestion.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          COLUMN 3: CUSTOMER PROFILE & INTEGRATION METADATA (DESKTOP)
         ========================================================================= */}
      {activeConversation && activeConversation.customer && (
        <div className="hidden lg:block w-72 xl:w-80 bg-white border-l border-slate-200 p-5 overflow-y-auto shrink-0 space-y-6">
          {/* Customer Avatar & Header */}
          <div className="text-center pb-4 border-b border-slate-100">
            <div className="relative inline-block mx-auto mb-2">
              <img
                src={activeConversation.customer.avatar}
                alt={activeConversation.customer.name}
                className="w-16 h-16 rounded-full object-cover ring-2 ring-slate-100 shadow-xs"
              />
              {activeConversation.customer.vip && (
                <span className="absolute bottom-0 right-0 px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-400 text-amber-950 uppercase shadow-xs">
                  VIP
                </span>
              )}
            </div>
            <h3 className="font-bold text-sm text-slate-900">
              {activeConversation.customer.name}
            </h3>
            <p className="text-xs text-slate-500 font-mono">
              {activeConversation.customer.handle}
            </p>
          </div>

          {/* Customer Profile Details */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px] text-slate-400">
              {t('customerInfo')}
            </h4>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{activeConversation.customer.city}</span>
              </div>
              {activeConversation.customer.phone && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-mono">{activeConversation.customer.phone}</span>
                </div>
              )}
              {activeConversation.customer.email && (
                <div className="flex items-center gap-2 text-slate-600 truncate">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{activeConversation.customer.email}</span>
                </div>
              )}
            </div>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">
                  {t('totalOrders')}
                </p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">
                  {activeConversation.customer.totalTransactions}
                </p>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">
                  {t('totalSpent')}
                </p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">
                  {activeConversation.customer.totalSpentEGP.toLocaleString()} EGP
                </p>
              </div>
            </div>

            {/* Tags */}
            <div className="pt-2">
              <p className="text-[10px] uppercase font-bold text-slate-400 mb-1.5">
                {t('tags')}
              </p>
              <div className="flex flex-wrap gap-1">
                {activeConversation.customer.tags.map((tg, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700"
                  >
                    <Tag className="w-2.5 h-2.5 text-slate-400" />
                    {tg}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Agent Private Notes */}
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px] text-slate-400">
                {t('notes')}
              </h4>
              {notesSuccess && (
                <span className="text-[10px] text-emerald-600 font-semibold">
                  {t('notesSaved')}
                </span>
              )}
            </div>
            <textarea
              rows={3}
              value={customerNotes}
              onChange={(e) => setCustomerNotes(e.target.value)}
              placeholder="Internal customer notes (visible to Bekya agents only)..."
              className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none"
            />
            <button
              onClick={handleSaveNotes}
              disabled={savingNotes}
              className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingNotes ? 'Saving...' : t('saveNotes')}</span>
            </button>
          </div>

          {/* Integration & Channel Metadata */}
          <div className="space-y-2 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px] text-slate-400">
              {t('channelMetadata')}
            </h4>
            <div className="flex items-center justify-between">
              <span>{t('channel')}:</span>
              <span className="font-semibold capitalize text-slate-700">
                {activeConversation.platform}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>{t('platformId')}:</span>
              <span className="font-mono text-slate-700">
                {activeConversation.channelAccountId}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>{t('threadId')}:</span>
              <span className="font-mono text-slate-700">{activeConversation.id}</span>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          COLUMN 3: MOBILE & TABLET SLIDE-OVER DRAWER
         ========================================================================= */}
      {showCustomerDetails && activeConversation && activeConversation.customer && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setShowCustomerDetails(false)}
          />
          <div
            className={`relative ms-auto w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl p-5 overflow-y-auto z-10 space-y-6 ${
              isRTL ? 'mr-auto ml-0' : 'ml-auto mr-0'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">{t('customerDetails')}</h3>
              <button
                type="button"
                onClick={() => setShowCustomerDetails(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Avatar & Header */}
            <div className="text-center pb-4 border-b border-slate-100">
              <div className="relative inline-block mx-auto mb-2">
                <img
                  src={activeConversation.customer.avatar}
                  alt={activeConversation.customer.name}
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-slate-100 shadow-xs"
                />
                {activeConversation.customer.vip && (
                  <span className="absolute bottom-0 right-0 px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-400 text-amber-950 uppercase shadow-xs">
                    VIP
                  </span>
                )}
              </div>
              <h3 className="font-bold text-sm text-slate-900">
                {activeConversation.customer.name}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {activeConversation.customer.handle}
              </p>
            </div>

            {/* Customer Profile Details */}
            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px] text-slate-400">
                {t('customerInfo')}
              </h4>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{activeConversation.customer.city}</span>
                </div>
                {activeConversation.customer.phone && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono">{activeConversation.customer.phone}</span>
                  </div>
                )}
                {activeConversation.customer.email && (
                  <div className="flex items-center gap-2 text-slate-600 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{activeConversation.customer.email}</span>
                  </div>
                )}
              </div>

              {/* Financial Overview Cards */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">
                    {t('totalOrders')}
                  </p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">
                    {activeConversation.customer.totalTransactions}
                  </p>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">
                    {t('totalSpent')}
                  </p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">
                    {activeConversation.customer.totalSpentEGP.toLocaleString()} EGP
                  </p>
                </div>
              </div>

              {/* Tags */}
              <div className="pt-2">
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1.5">
                  {t('tags')}
                </p>
                <div className="flex flex-wrap gap-1">
                  {activeConversation.customer.tags.map((tg, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700"
                    >
                      <Tag className="w-2.5 h-2.5 text-slate-400" />
                      {tg}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Agent Private Notes */}
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px] text-slate-400">
                  {t('notes')}
                </h4>
                {notesSuccess && (
                  <span className="text-[10px] text-emerald-600 font-semibold">
                    {t('notesSaved')}
                  </span>
                )}
              </div>
              <textarea
                rows={3}
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                placeholder="Internal customer notes..."
                className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none"
              />
              <button
                onClick={handleSaveNotes}
                disabled={savingNotes}
                className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingNotes ? 'Saving...' : t('saveNotes')}</span>
              </button>
            </div>

            {/* Integration & Channel Metadata */}
            <div className="space-y-2 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px] text-slate-400">
                {t('channelMetadata')}
              </h4>
              <div className="flex items-center justify-between">
                <span>{t('channel')}:</span>
                <span className="font-semibold capitalize text-slate-700">
                  {activeConversation.platform}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>{t('platformId')}:</span>
                <span className="font-mono text-slate-700">
                  {activeConversation.channelAccountId}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>{t('threadId')}:</span>
                <span className="font-mono text-slate-700">{activeConversation.id}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
