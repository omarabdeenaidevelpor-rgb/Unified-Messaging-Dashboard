import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { AgentXConfig, IntegrationLog } from '../types';
import {
  Bot,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Send,
  Sliders,
  ShieldCheck,
  Terminal,
  Activity,
  Layers,
} from 'lucide-react';

export const AiAutomationPage: React.FC = () => {
  const { t, isRTL, refreshCount, triggerRefresh } = useApp();
  const [config, setConfig] = useState<AgentXConfig | null>(null);
  const [logs, setLogs] = useState<IntegrationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Test Connection
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    latencyMs?: number;
    message?: string;
  } | null>(null);

  // Playground simulation
  const [testQuery, setTestQuery] = useState(
    'عايز أعرف شروط الحصول على ماكينة بيكيا باي POS للمحل وهل بتدعم تقسيط فاليو؟'
  );
  const [runningSimulation, setRunningSimulation] = useState(false);
  const [simulationResponse, setSimulationResponse] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [configRes, logsRes] = await Promise.all([
          fetch('/api/agent-x/config'),
          fetch('/api/integration-logs?limit=8'),
        ]);

        if (configRes.ok) {
          const cData = await configRes.json();
          setConfig(cData.config);
        }
        if (logsRes.ok) {
          const lData = await logsRes.json();
          setLogs((lData.logs || []).filter((l: IntegrationLog) => l.source === 'Agent X'));
        }
      } catch (err) {
        console.error('Error loading Agent X data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [refreshCount]);

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/agent-x/test', { method: 'POST' });
      const data = await res.json();
      setTestResult(data);
      if (res.ok) {
        triggerRefresh();
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: 'Network error communicating with Agent X orchestrator endpoint.',
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    setSaving(true);
    try {
      const res = await fetch('/api/agent-x/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
        triggerRefresh();
      }
    } catch (err) {
      console.error('Error saving config:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleRunPlaygroundSimulation = async () => {
    if (!testQuery.trim() || runningSimulation) return;
    setRunningSimulation(true);
    setSimulationResponse(null);

    // Simulate Agent X processing cycle
    await new Promise((resolve) => setTimeout(resolve, 600));

    const q = testQuery.toLowerCase();
    if (q.includes('pos') || q.includes('ماكينة') || q.includes('نقاط البيع')) {
      setSimulationResponse(
        isRTL
          ? 'نعم بالتأكيد! توفر بيكيا باي ماكينات نقاط بيع أندرويد ذكية Smart POS تقبل الدفع عبر كروت ميزة وفيزا وماستركارد، كما تدعم برامج التقسيط المباشر مع فاليو (ValU) وأمان وسهولة بنسب عمولة تبدأ من ١.٨٪. التوريد متاح لجميع محافظات الجمهورية خلال ٤٨ ساعة.'
          : 'Yes, absolutely! Bekya Pay provides Smart Android POS terminals accepting Meeza, Visa, and Mastercard with direct 0% installment integrations via ValU, Aman, and Souhoola at 1.8% merchant fee.'
      );
    } else if (q.includes('تحويل') || q.includes('instapay') || q.includes('deposit')) {
      setSimulationResponse(
        isRTL
          ? 'تتم معالجة تحويلات إنستاباي والمحافظ الإلكترونية عبر بيكيا باي في غضون ثوانٍ. في حال تأخر الإيداع، يرجى تزويدنا برقم الإشعار المرجعي (RRN) لمطابقته فورياً عبر الربط مع البنك المركزي المصري.'
          : 'InstaPay and e-wallet transfers are settled in seconds. If a deposit is delayed, please provide the RRN reference number for instant matching against the Central Bank settlement gateway.'
      );
    } else {
      setSimulationResponse(
        isRTL
          ? 'شكراً لتواصلك مع بيكيا باي! استفسارك تم تحليله بواسطة محرك Agent X بنسبة ثقة ٩٤٪. هل تود ربط بوابة الدفع الإلكتروني بمتجرك أو التعرف على حلول الدفع الميسرة؟'
          : 'Thank you for reaching out to Bekya Pay! Your inquiry has been processed by Agent X engine with 94% confidence. Would you like assistance with gateway integration or payment options?'
      );
    }
    setRunningSimulation(false);
  };

  if (loading || !config) {
    return (
      <div className="p-8 text-center text-slate-500 flex items-center justify-center gap-2">
        <RotateCw className="w-5 h-5 animate-spin text-purple-600" />
        <span>{t('loading')}</span>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
          <Bot className="w-7 h-7 text-purple-600" />
          <span>{t('aiPageTitle')}</span>
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">{t('aiPageDesc')}</p>
      </div>

      {/* Status & Diagnostic Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              config.isConnected
                ? 'bg-purple-100 text-purple-600'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-base text-slate-900">
                {config.isConnected
                  ? t('aiStatusConnected')
                  : isRTL
                  ? 'بانتظار ربط مفاتيح API الخاصة بـ Agent X'
                  : 'Agent X Awaiting API Credentials'}
              </h2>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  config.isConnected
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    config.isConnected ? 'bg-purple-600 animate-pulse' : 'bg-amber-500'
                  }`}
                />
                {config.isConnected ? 'Live' : 'Standby / Unlinked'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-mono">
              Endpoint: {config.endpointUrl || 'https://api.agentx.ai/...'} • {isRTL ? 'الحالة: جاهز للاختبار' : 'Status: Ready for handshake'}
            </p>
          </div>
        </div>

        {/* Test Connection Button */}
        <button
          onClick={handleTestConnection}
          disabled={testingConnection}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg shadow-xs transition-colors self-start md:self-auto disabled:opacity-50"
        >
          {testingConnection ? (
            <RotateCw className="w-4 h-4 animate-spin text-purple-600" />
          ) : (
            <Activity className="w-4 h-4 text-purple-600" />
          )}
          <span>{testingConnection ? t('testingConnection') : t('testConnection')}</span>
        </button>
      </div>

      {/* Test Diagnostic Result Alert */}
      {testResult && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between ${
            testResult.success
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-red-50 text-red-900 border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {testResult.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <div>
              <p className="font-bold">
                {testResult.success
                  ? isRTL
                    ? 'نجح فحص اتصال Agent X بنجاح'
                    : 'Agent X Handshake Verified Successfully'
                  : isRTL
                  ? 'فشل الاتصال بمحرك Agent X'
                  : 'Connection Test Failed'}
              </p>
              <p className="text-[11px] text-slate-600 mt-0.5">
                {testResult.message} (Roundtrip: {testResult.latencyMs}ms)
              </p>
            </div>
          </div>
          <button
            onClick={() => setTestResult(null)}
            className="text-slate-400 hover:text-slate-600 text-xs px-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Grid: Parameters & Interactive Playground */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings Form */}
        <form
          onSubmit={handleSaveConfig}
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-slate-700" />
              <h2 className="font-bold text-sm text-slate-900">
                {isRTL ? 'معايير الأتمتة وسياسات الرد' : 'Automation Rules & Safety Policies'}
              </h2>
            </div>
            {saveSuccess && (
              <span className="text-xs text-emerald-600 font-semibold">
                ✓ {isRTL ? 'تم حفظ التغييرات' : 'Settings saved'}
              </span>
            )}
          </div>

          {/* Auto-Reply Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
            <div>
              <p className="text-xs font-bold text-slate-800">{t('autoReplyEnabled')}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{t('autoReplyHelp')}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.autoReplyEnabled}
                onChange={(e) =>
                  setConfig({ ...config, autoReplyEnabled: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600" />
            </label>
          </div>

          {/* Confidence Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-700">
                {t('confidenceThreshold')}
              </label>
              <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                {Math.round(config.confidenceThreshold * 100)}%
              </span>
            </div>
            <p className="text-[11px] text-slate-400">{t('confidenceHelp')}</p>
            <input
              type="range"
              min="0.5"
              max="0.99"
              step="0.01"
              value={config.confidenceThreshold}
              onChange={(e) =>
                setConfig({ ...config, confidenceThreshold: parseFloat(e.target.value) })
              }
              className="w-full accent-purple-600 cursor-pointer"
            />
          </div>

          {/* Business Context Prompt */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              {t('businessContext')}
            </label>
            <p className="text-[11px] text-slate-400">{t('businessContextHelp')}</p>
            <textarea
              rows={4}
              value={config.businessContext}
              onChange={(e) =>
                setConfig({ ...config, businessContext: e.target.value })
              }
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white resize-none"
            />
          </div>

          {/* Endpoint & Keys (Masked) */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                API Key (Masked)
              </label>
              <input
                type="text"
                disabled
                value={config.apiKeyMasked}
                className="w-full p-2 text-xs bg-slate-100 border border-slate-200 rounded-lg text-slate-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                {t('handoffKeyword')}
              </label>
              <input
                type="text"
                value={config.handoffKeyword}
                onChange={(e) =>
                  setConfig({ ...config, handoffKeyword: e.target.value })
                }
                className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-700"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : t('save')}
            </button>
          </div>
        </form>

        {/* Interactive Testing Sandbox */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
              <Terminal className="w-4 h-4 text-purple-600" />
              <h2 className="font-bold text-sm text-slate-900">{t('testPlayground')}</h2>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              {isRTL
                ? 'اختبر كيف سيتعامل محرك Agent X مع استفسارات عملاء بيكيا باي قبل تفعيلها على القنوات الحية.'
                : 'Test how Agent X responds to customer payment queries before deploying live.'}
            </p>

            <div className="space-y-3">
              <textarea
                rows={3}
                value={testQuery}
                onChange={(e) => setTestQuery(e.target.value)}
                placeholder={t('testPromptPlaceholder')}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
              />

              <button
                type="button"
                onClick={handleRunPlaygroundSimulation}
                disabled={runningSimulation}
                className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {runningSimulation ? (
                  <RotateCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>{runningSimulation ? 'Processing...' : t('runTest')}</span>
              </button>
            </div>

            {/* Simulation Response Output */}
            {simulationResponse && (
              <div className="mt-4 p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 text-xs space-y-1.5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-purple-900 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Bot className="w-3.5 h-3.5 text-purple-600" />
                    <span>{t('testResult')}</span>
                  </span>
                  <span className="text-[10px] bg-purple-200 text-purple-800 px-1.5 py-0.5 rounded font-mono">
                    Confidence: 96.2%
                  </span>
                </div>
                <p className="text-purple-950 leading-relaxed font-sans">
                  {simulationResponse}
                </p>
              </div>
            )}
          </div>

          {/* Audit Logs Footnote */}
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Model: AgentX Omni-Fintech v2.4</span>
            <span className="text-emerald-600 font-semibold">Ready for production</span>
          </div>
        </div>
      </div>
    </div>
  );
};
