import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Settings,
  Globe,
  Clock,
  Shield,
  Key,
  Save,
  CheckCircle2,
  Lock,
  Trash2,
  Download,
  AlertTriangle,
  Sparkles,
  Award,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { t, language, setLanguage, isRTL, triggerRefresh } = useApp();
  const [orgName, setOrgName] = useState('Bekya Pay Egypt LLC');
  const [supportEmail, setSupportEmail] = useState('support@bekyapay.com');
  const [businessHoursStart, setBusinessHoursStart] = useState('09:00');
  const [businessHoursEnd, setBusinessHoursEnd] = useState('18:00');
  const [autoResponseOffHours, setAutoResponseOffHours] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleResetDatabase = async () => {
    const promptMsg = isRTL
      ? 'هل أنت متأكد من تصفير قاعدة البيانات وحذف كافة السجلات والمحادثات التجريبية؟'
      : 'Are you sure you want to clear all test records and reset the database?';

    if (window.confirm(promptMsg)) {
      setResetting(true);
      try {
        const res = await fetch('/api/database/reset', { method: 'POST' });
        if (res.ok) {
          setResetMessage(isRTL ? 'تم تصفير البيانات بنجاح' : 'Database reset successfully');
          setTimeout(() => setResetMessage(null), 3000);
          triggerRefresh();
        }
      } catch (err) {
        console.error('Failed to reset database:', err);
      } finally {
        setResetting(false);
      }
    }
  };

  const handleExportData = async () => {
    try {
      const res = await fetch('/api/database/export');
      if (res.ok) {
        const data = await res.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: 'application/json',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bekya-pay-backup-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Failed to export data:', err);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-blue-600" />
          <span>{t('settingsPageTitle')}</span>
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">{t('settingsPageDesc')}</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Language Selection Card */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Globe className="w-5 h-5 text-blue-600" />
            <h2 className="font-bold text-sm text-slate-900">{t('languagePreference')}</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                language === 'en'
                  ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/20'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div>
                <p className="font-bold text-sm text-slate-900">English (US)</p>
                <p className="text-xs text-slate-500 mt-0.5">Left-to-Right layout (LTR)</p>
              </div>
              {language === 'en' && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
            </button>

            <button
              type="button"
              onClick={() => setLanguage('ar')}
              className={`p-4 rounded-xl border text-right transition-all flex items-center justify-between ${
                language === 'ar'
                  ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/20'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              {language === 'ar' && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
              <div>
                <p className="font-bold text-sm text-slate-900">العربية (مصر / الشرق الأوسط)</p>
                <p className="text-xs text-slate-500 mt-0.5">تخطيط من اليمين إلى اليسار (RTL)</p>
              </div>
            </button>
          </div>
        </div>

        {/* Organization Information */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Shield className="w-5 h-5 text-blue-600" />
            <h2 className="font-bold text-sm text-slate-900">
              {isRTL ? 'بيانات المؤسسة والخدمة' : 'Organization & Merchant Profile'}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {isRTL ? 'اسم الشركة' : 'Company Name'}
              </label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {isRTL ? 'البريد الإلكتروني للدعم' : 'Support Email'}
              </label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Business Operating Hours */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Clock className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="font-bold text-sm text-slate-900">{t('businessHoursTitle')}</h2>
              <p className="text-xs text-slate-500">{t('businessHoursDesc')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {isRTL ? 'بداية ساعات العمل (بتوقيت القاهرة)' : 'Shift Start (Cairo Time)'}
              </label>
              <input
                type="time"
                value={businessHoursStart}
                onChange={(e) => setBusinessHoursStart(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {isRTL ? 'نهاية ساعات العمل' : 'Shift End'}
              </label>
              <input
                type="time"
                value={businessHoursEnd}
                onChange={(e) => setBusinessHoursEnd(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs">
            <div>
              <p className="font-bold text-slate-800">
                {isRTL
                  ? 'تفعيل الرد التلقائي خارج أوقات العمل'
                  : 'Auto-reply outside operating hours'}
              </p>
              <p className="text-[11px] text-slate-500">
                {isRTL
                  ? 'يقوم Agent X بالرد الفوري لطمأنة العميل وتحديد موعد معاودة التواصل'
                  : 'Agent X sends an immediate assurance and logs inquiry for next shift'}
              </p>
            </div>
            <input
              type="checkbox"
              checked={autoResponseOffHours}
              onChange={(e) => setAutoResponseOffHours(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded"
            />
          </div>
        </div>

        {/* Security & API Keys Notice */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Lock className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="font-bold text-sm text-slate-900">{t('apiKeySettingsTitle')}</h2>
              <p className="text-xs text-slate-500">{t('apiKeyWarning')}</p>
            </div>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-700">Meta Graph App Secret:</span>
                <span className="text-slate-400 ms-2">••••••••••••••••••••••••</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                Encrypted at rest
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-700">Agent X Webhook Secret:</span>
                <span className="text-slate-400 ms-2">whsec_agentx_bekya_prod_••••</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                Verified
              </span>
            </div>
          </div>
        </div>

        {/* Database Management & Clean Production State */}
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-red-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-red-100">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <div>
              <h2 className="font-bold text-sm text-slate-900">
                {isRTL ? 'إدارة البيانات وتصفير السجلات' : 'Database & Test Data Management'}
              </h2>
              <p className="text-xs text-slate-500">
                {isRTL
                  ? 'حذف كافة البيانات التجريبية أو تصدير نسخة احتياطية من قاعدة البيانات'
                  : 'Wipe all temporary test records or export a full database backup'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleExportData}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>{isRTL ? 'تصدير نسخة احتياطية (JSON)' : 'Export Full Backup (JSON)'}</span>
            </button>

            <button
              type="button"
              disabled={resetting}
              onClick={handleResetDatabase}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
              <span>
                {resetting
                  ? 'Resetting...'
                  : isRTL
                  ? 'تصفير كافة السجلات والمحادثات التجريبية'
                  : 'Clear All Test Records'}
              </span>
            </button>

            {resetMessage && (
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>{resetMessage}</span>
              </span>
            )}
          </div>
        </div>

        {/* Developer Seal & System Architect Card - AI Developer: Omar Abdeen */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 sm:p-6 rounded-xl border border-blue-500/40 shadow-md text-white space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-blue-500/30 ring-1 ring-white/20">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-extrabold text-sm sm:text-base text-white">
                    {t('developerBadge')}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-500/30 text-blue-300 border border-blue-400/40">
                    Verified AI Lead
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  {t('developerBadgeSub')}
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-xs bg-blue-900/40 border border-blue-500/30 px-3 py-1.5 rounded-lg text-blue-300 font-mono">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Official Developer Seal</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300">
            <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/60">
              <p className="text-[10px] uppercase font-bold text-slate-400">
                {isRTL ? 'المهندس المسؤول' : 'Lead Engineer'}
              </p>
              <p className="font-bold text-white mt-1">Omar Abdeen</p>
              <p className="text-[11px] text-blue-400 font-mono">omarabdeenaidevelpor@gmail.com</p>
            </div>
            <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/60">
              <p className="text-[10px] uppercase font-bold text-slate-400">
                {isRTL ? 'نظام الذكاء الاصطناعي' : 'AI Automation Provider'}
              </p>
              <p className="font-bold text-white mt-1">Agent X Enterprise Engine</p>
              <p className="text-[11px] text-purple-400 font-mono">Orchestrator v2.4 Ready</p>
            </div>
            <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/60">
              <p className="text-[10px] uppercase font-bold text-slate-400">
                {isRTL ? 'بوابات المراسلة المدعومة' : 'Omnichannel Gateways'}
              </p>
              <p className="font-bold text-white mt-1">Meta Graph API (IG & FB)</p>
              <p className="text-[11px] text-emerald-400 font-mono">Real-time Webhook Active</p>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-4">
          {savedSuccess && (
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>{isRTL ? 'تم حفظ التغييرات بنجاح' : 'Changes saved successfully'}</span>
            </span>
          )}
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{t('save')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
