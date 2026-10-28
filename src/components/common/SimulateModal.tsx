import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Send, Sparkles, X, MessageSquare } from 'lucide-react';

interface SimulateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const SimulateModal: React.FC<SimulateModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { t, isRTL, triggerRefresh, openConversation } = useApp();
  const [platform, setPlatform] = useState<'instagram' | 'facebook'>('instagram');
  const [customerName, setCustomerName] = useState('Yara Mansour');
  const [handle, setHandle] = useState('@yara_mansour');
  const [text, setText] = useState(
    'مساء الخير، لو سمحت عايزة أعرف إزاي أفعل خدمة بيكيا باي للدفع بالتقسيط لعملاء موقعي؟'
  );
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const presets = [
    {
      title: isRTL ? 'استفسار عن محفظة إنستاباي' : 'InstaPay Wallet Query',
      platform: 'instagram' as const,
      name: 'Nouran Samir',
      handle: '@nouran_samir',
      text: 'مرحباً، حولت مبلغ من إنستاباي ورصيد المحفظة لم يتحدث بعد، رقم العملية ٩٩١٨٢.',
    },
    {
      title: isRTL ? 'طلب ماكينة بيكيا باي POS' : 'POS Terminal Request',
      platform: 'facebook' as const,
      name: 'Khaled El-Banna',
      handle: 'facebook.com/khaled.elbanna',
      text: 'السلام عليكم، نحن شركة تجارة ملابس بالمهندسين ونريد طلب ٢ ماكينة نقاط بيع ذكية مع ربط الحساب البنكي.',
    },
    {
      title: isRTL ? 'استفسار رسوم وبوابة التقسيط' : 'Installment Gateway Inquiry',
      platform: 'instagram' as const,
      name: 'Ziad Galal',
      handle: '@ziad_galal',
      text: 'Hello, what are the transaction fees for Bekya Pay checkout with ValU and Aman installment?',
    },
  ];

  const handleApplyPreset = (p: typeof presets[0]) => {
    setPlatform(p.platform);
    setCustomerName(p.name);
    setHandle(p.handle);
    setText(p.text);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/webhooks/simulate-incoming', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          customerName,
          handle,
          text,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        triggerRefresh();
        onClose();
        if (onSuccess) onSuccess();
        if (data.conversation?.id) {
          openConversation(data.conversation.id);
        }
      }
    } catch (err) {
      console.error('Failed to simulate webhook:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div
        className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-100 text-blue-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">
                {isRTL ? 'محاكاة رسالة واردة من عميل' : 'Simulate Incoming Customer Message'}
              </h3>
              <p className="text-xs text-slate-500">
                {isRTL
                  ? 'محاكاة لحدث ويب هوك حقيقي من Instagram Graph API أو Facebook Messenger'
                  : 'Simulate live Meta Webhook event without external network tunneling'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              {isRTL ? 'القناة المستهدفة' : 'Target Messaging Platform'}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPlatform('instagram')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border text-sm font-medium transition-all ${
                  platform === 'instagram'
                    ? 'border-pink-500 bg-pink-50/70 text-pink-700 ring-2 ring-pink-500/20'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                Instagram DM (@bekyapay.eg)
              </button>
              <button
                type="button"
                onClick={() => setPlatform('facebook')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border text-sm font-medium transition-all ${
                  platform === 'facebook'
                    ? 'border-blue-500 bg-blue-50/70 text-blue-700 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                Facebook Messenger
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isRTL ? 'اسم العميل' : 'Customer Name'}
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isRTL ? 'اسم الحساب / Handle' : 'Handle / Profile ID'}
              </label>
              <input
                type="text"
                required
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                {isRTL ? 'نص الرسالة الواردة' : 'Message Text'}
              </label>
              <span className="text-[11px] text-slate-400">
                {isRTL ? 'نماذج سريعة:' : 'Quick Presets:'}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-md transition-colors"
                >
                  {p.title}
                </button>
              ))}
            </div>
            <textarea
              required
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              {loading ? (
                <span>{isRTL ? 'جاري الإرسال...' : 'Triggering Webhook...'}</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{isRTL ? 'إرسال الرسالة إلى الصندوق' : 'Send to Unified Inbox'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
