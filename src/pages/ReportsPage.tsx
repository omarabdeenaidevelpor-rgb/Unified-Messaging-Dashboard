import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  Bot,
  Smile,
  RotateCw,
  PieChart,
  MessageSquare,
} from 'lucide-react';

interface ReportData {
  summary: {
    totalConversations: number;
    totalMessages: number;
    aiResolutionRate: number;
    firstResponseTimeMinutes: number;
    averageHandlingTimeMinutes: number;
    customerSatisfactionPct: number;
  };
  channelDistribution: Array<{
    channel: string;
    count: number;
    percentage: number;
  }>;
  hourlyActivity: Array<{
    hour: string;
    instagram: number;
    facebook: number;
    aiHandled: number;
  }>;
  topTopics: Array<{
    topic: string;
    count: number;
    sentiment: string;
  }>;
}

export const ReportsPage: React.FC = () => {
  const { t, isRTL, refreshCount } = useApp();
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      try {
        const res = await fetch('/api/reports');
        if (res.ok) {
          const report = await res.json();
          setData(report);
        }
      } catch (err) {
        console.error('Failed to load reports:', err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, [refreshCount]);

  if (loading || !data) {
    return (
      <div className="p-8 text-center text-slate-500 flex items-center justify-center gap-2">
        <RotateCw className="w-5 h-5 animate-spin text-blue-600" />
        <span>{t('loading')}</span>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
          <BarChart3 className="w-7 h-7 text-blue-600" />
          <span>{t('reportsPageTitle')}</span>
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">{t('reportsPageDesc')}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">{t('resolutionRate')}</span>
            <Bot className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-700">
            {data.summary.aiResolutionRate}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {isRTL ? 'مغلقة بدون تدخل بشري' : 'Deflected without human touch'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">{t('statAvgResponseTime')}</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {data.summary.firstResponseTimeMinutes} min
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">
            -42% {isRTL ? 'تحسن مع Agent X' : 'faster with Agent X'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">{t('statCsat')}</span>
            <Smile className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">
            {data.summary.customerSatisfactionPct}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {isRTL ? 'تقييم ممتاز من العملاء' : 'Excellent feedback'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">{isRTL ? 'إجمالي الرسائل' : 'Total Messages'}</span>
            <MessageSquare className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {data.summary.totalMessages}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {data.summary.totalConversations} {t('navConversations')}
          </p>
        </div>
      </div>

      {/* Hourly Message Traffic & Channel Share */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hourly Activity Bar Chart Representation */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-sm text-slate-900">
              {t('hourlyActivityTitle')}
            </h2>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-pink-500" />
                <span className="text-slate-600">Instagram</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
                <span className="text-slate-600">Facebook</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-purple-500" />
                <span className="text-slate-600">Agent X AI</span>
              </span>
            </div>
          </div>

          <div className="h-64 flex items-end justify-between gap-3 pt-6 px-2">
            {data.hourlyActivity.map((bar, idx) => {
              const maxVal = 35;
              const igHeight = Math.round((bar.instagram / maxVal) * 100);
              const fbHeight = Math.round((bar.facebook / maxVal) * 100);
              const aiHeight = Math.round((bar.aiHandled / maxVal) * 100);

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div className="w-full flex items-end justify-center gap-1 h-48">
                    <div
                      style={{ height: `${igHeight}%` }}
                      className="w-2.5 sm:w-3.5 bg-pink-500 rounded-t-sm transition-all"
                      title={`Instagram: ${bar.instagram}`}
                    />
                    <div
                      style={{ height: `${fbHeight}%` }}
                      className="w-2.5 sm:w-3.5 bg-blue-500 rounded-t-sm transition-all"
                      title={`Facebook: ${bar.facebook}`}
                    />
                    <div
                      style={{ height: `${aiHeight}%` }}
                      className="w-2.5 sm:w-3.5 bg-purple-500 rounded-t-sm transition-all"
                      title={`Agent X AI: ${bar.aiHandled}`}
                    />
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">{bar.hour}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Channel Volume Distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="font-bold text-sm text-slate-900 mb-4">
              {t('channelShareTitle')}
            </h2>

            <div className="space-y-4">
              {data.channelDistribution.map((ch, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{ch.channel}</span>
                    <span className="font-mono font-bold text-slate-600">
                      {ch.count} ({ch.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      style={{ width: `${ch.percentage}%` }}
                      className={`h-full rounded-full ${
                        idx === 0 ? 'bg-pink-500' : 'bg-blue-500'
                      }`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-xs text-slate-500">
            <p className="font-semibold text-slate-700 mb-1">
              {isRTL ? 'ملاحظة الأداء:' : 'Performance Note:'}
            </p>
            <p>
              {isRTL
                ? 'إنستغرام يشكل النسبة الأكبر من استفسارات نقاط البيع وبطاقات التقسيط للشباب.'
                : 'Instagram generates the largest share of merchant POS and installment inquiries.'}
            </p>
          </div>
        </div>
      </div>

      {/* Top Customer Topics */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <h2 className="font-bold text-sm text-slate-900 mb-4">
          {t('topInquiriesTitle')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.topTopics.map((topic, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Topic #{idx + 1}
                </span>
                <p className="font-bold text-xs text-slate-900 mt-1 leading-snug">
                  {topic.topic}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">{topic.count} Inquiries</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    topic.sentiment === 'urgent'
                      ? 'bg-red-100 text-red-700'
                      : topic.sentiment === 'positive'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {topic.sentiment}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
