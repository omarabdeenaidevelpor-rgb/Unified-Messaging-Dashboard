import React from 'react';
import { ConversationStatus, PlatformType, SenderType } from '../../types';
import { Bot, User, ShieldCheck } from 'lucide-react';

export const PlatformBadge: React.FC<{ platform: PlatformType; showLabel?: boolean }> = ({
  platform,
  showLabel = true,
}) => {
  if (platform === 'instagram') {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold text-pink-700 bg-pink-50 border border-pink-200"
        title="Instagram DM"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
        {showLabel && <span>Instagram</span>}
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200"
      title="Facebook Messenger"
    >
      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
        <path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.91 1.455 5.514 3.734 7.18V22l3.413-1.874c.91.252 1.873.389 2.853.389 5.523 0 10-4.145 10-9.257C22 6.145 17.523 2 12 2zm1.008 12.449l-2.56-2.73-5 2.73 5.498-5.836 2.622 2.73 4.938-2.73-5.498 5.836z" />
      </svg>
      {showLabel && <span>Messenger</span>}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: ConversationStatus; isAr?: boolean }> = ({
  status,
  isAr,
}) => {
  const configs = {
    open: {
      label: isAr ? 'مفتوحة' : 'Open',
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500',
    },
    pending: {
      label: isAr ? 'قيد الانتظار' : 'Pending',
      className: 'bg-amber-50 text-amber-700 border-amber-200',
      dot: 'bg-amber-500',
    },
    resolved: {
      label: isAr ? 'تم الحل' : 'Resolved',
      className: 'bg-slate-100 text-slate-600 border-slate-200',
      dot: 'bg-slate-400',
    },
  };

  const item = configs[status] || configs.open;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${item.className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${item.dot}`} />
      <span>{item.label}</span>
    </span>
  );
};

export const PriorityBadge: React.FC<{
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isAr?: boolean;
}> = ({ priority, isAr }) => {
  const map = {
    urgent: {
      label: isAr ? 'عاجل' : 'Urgent',
      cls: 'bg-red-50 text-red-700 border-red-200',
    },
    high: {
      label: isAr ? 'أولوية عالية' : 'High Priority',
      cls: 'bg-orange-50 text-orange-700 border-orange-200',
    },
    medium: {
      label: isAr ? 'متوسطة' : 'Medium',
      cls: 'bg-slate-50 text-slate-600 border-slate-200',
    },
    low: {
      label: isAr ? 'منخفضة' : 'Low',
      cls: 'bg-slate-50 text-slate-500 border-slate-200',
    },
  };

  const p = map[priority] || map.medium;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${p.cls}`}
    >
      {p.label}
    </span>
  );
};

export const SenderBadge: React.FC<{ senderType: SenderType; isAr?: boolean }> = ({
  senderType,
  isAr,
}) => {
  if (senderType === 'ai') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
        <Bot className="w-3 h-3 text-purple-600" />
        <span>Agent X AI</span>
      </span>
    );
  }
  if (senderType === 'agent') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
        <ShieldCheck className="w-3 h-3 text-blue-600" />
        <span>{isAr ? 'موظف بيكيا' : 'Bekya Agent'}</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
      <User className="w-3 h-3 text-slate-500" />
      <span>{isAr ? 'العميل' : 'Customer'}</span>
    </span>
  );
};
