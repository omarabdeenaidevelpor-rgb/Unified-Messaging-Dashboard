import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Customer } from '../types';
import { PlatformBadge } from '../components/common/Badge';
import {
  Search,
  Users,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  MessageSquare,
  Tag,
  Star,
  ExternalLink,
  RotateCw,
  UserPlus,
  Trash2,
  X,
} from 'lucide-react';

export const CustomersPage: React.FC = () => {
  const { t, isRTL, openConversation, refreshCount, triggerRefresh } = useApp();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Add customer modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [platform, setPlatform] = useState<'instagram' | 'facebook'>('instagram');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Cairo');
  const [vip, setVip] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    async function loadCustomers() {
      setLoading(true);
      try {
        const url = search.trim()
          ? `/api/customers?search=${encodeURIComponent(search.trim())}`
          : '/api/customers';
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setCustomers(data.customers || []);
        }
      } catch (err) {
        console.error('Failed to load customers:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCustomers();
  }, [search, refreshCount]);

  const handleOpenCustomerChat = async (cust: Customer) => {
    try {
      const res = await fetch(`/api/customers/${cust.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.conversations && data.conversations.length > 0) {
          openConversation(data.conversations[0].id);
        } else {
          openConversation('');
        }
      }
    } catch (err) {
      console.error('Failed to open chat:', err);
    }
  };

  const handleDeleteCustomer = async (id: string, name: string) => {
    if (window.confirm(isRTL ? `هل أنت متأكد من حذف العميل ${name}؟` : `Delete customer ${name}?`)) {
      try {
        const res = await fetch(`/api/customers/${id}`, { method: 'DELETE' });
        if (res.ok) {
          triggerRefresh();
        }
      } catch (err) {
        console.error('Error deleting customer:', err);
      }
    }
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !handle.trim()) return;

    setCreating(true);
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          handle: handle.trim(),
          platform,
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          city: city.trim(),
          vip,
          tags: vip ? ['VIP Merchant', 'Manually Registered'] : ['Customer'],
        }),
      });
      if (res.ok) {
        setShowAddModal(false);
        setName('');
        setHandle('');
        setEmail('');
        setPhone('');
        triggerRefresh();
      }
    } catch (err) {
      console.error('Failed to create customer:', err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {t('customersPageTitle')}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">{t('customersPageDesc')}</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors self-start"
        >
          <UserPlus className="w-4 h-4" />
          <span>{isRTL ? 'إضافة عميل جديد' : 'Add New Customer'}</span>
        </button>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute top-2.5 start-3 text-slate-400" />
          <input
            type="text"
            placeholder={t('searchCustomers')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
          {customers.length} {isRTL ? 'عملاء مسجلين' : 'Customers Registered'}
        </span>
      </div>

      {/* Customers Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            <RotateCw className="w-5 h-5 animate-spin mx-auto mb-2 text-slate-400" />
            <span>{t('loading')}</span>
          </div>
        ) : customers.length === 0 ? (
          <div className="col-span-full py-16 px-6 bg-white rounded-xl border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-sm text-slate-800">
                {isRTL ? 'لا يوجد عملاء مسجلين حالياً' : 'No Customers Registered Yet'}
              </p>
              <p className="text-slate-500 text-xs mt-1 max-w-md mx-auto">
                {isRTL
                  ? 'يتم إنشاء ملفات العملاء تلقائياً عند استلام استفسارات من إنستغرام أو فيسبوك، أو يمكنك تسجيل عميل يدوياً.'
                  : 'Customer records are generated automatically as inquiries arrive from Meta, or you can register customers manually.'}
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isRTL ? 'تسجيل أول عميل' : 'Register First Customer'}</span>
            </button>
          </div>
        ) : (
          customers.map((cust) => (
            <div
              key={cust.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all"
            >
              <div>
                {/* Header Profile */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={cust.avatar}
                        alt={cust.name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100"
                      />
                      {cust.vip && (
                        <span className="absolute -top-1 -end-1 p-1 rounded-full bg-amber-400 text-amber-950 shadow-xs" title="VIP Merchant">
                          <Star className="w-3 h-3 fill-current" />
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{cust.name}</h3>
                      <p className="text-xs text-slate-400 font-mono">{cust.handle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <PlatformBadge platform={cust.platform} showLabel={false} />
                    <button
                      onClick={() => handleDeleteCustomer(cust.id, cust.name)}
                      className="text-slate-300 hover:text-red-600 p-1 rounded transition-colors"
                      title="Delete customer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{cust.city}</span>
                  </div>
                  {cust.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono">{cust.phone}</span>
                    </div>
                  )}
                  {cust.email && (
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{cust.email}</span>
                    </div>
                  )}
                </div>

                {/* Financial Summary */}
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs mb-3">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">
                      {t('totalOrders')}
                    </span>
                    <p className="font-bold text-slate-800 text-sm mt-0.5">
                      {cust.totalTransactions}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">
                      {t('totalSpent')}
                    </span>
                    <p className="font-bold text-slate-800 text-sm mt-0.5">
                      {cust.totalSpentEGP.toLocaleString()} EGP
                    </p>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {cust.tags.map((tg, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700"
                    >
                      {tg}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleOpenCustomerChat(cust)}
                className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{t('openChat')}</span>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div
            className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden"
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-900">
                {isRTL ? 'تسجيل عميل / تاجر جديد' : 'Register New Customer'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {isRTL ? 'اسم العميل' : 'Customer Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ahmed Mahmoud"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {isRTL ? 'الحساب / Handle' : 'Handle / Profile'}
                  </label>
                  <input
                    type="text"
                    required
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    placeholder="@ahmed_m"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {isRTL ? 'القناة' : 'Platform'}
                </label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-700"
                >
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook Messenger</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {isRTL ? 'رقم الهاتف' : 'Phone'}
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+20 100 ..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {isRTL ? 'المدينة' : 'City'}
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Cairo"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {isRTL ? 'البريد الإلكتروني' : 'Email'}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ahmed@example.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="vip-check"
                  checked={vip}
                  onChange={(e) => setVip(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <label htmlFor="vip-check" className="font-semibold text-slate-700">
                  {isRTL ? 'تعيين كتاجر مميز (VIP Merchant)' : 'Mark as VIP Merchant'}
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
                >
                  {creating ? 'Saving...' : isRTL ? 'حفظ العميل' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
