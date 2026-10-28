import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User } from '../types';
import {
  UserCheck,
  UserPlus,
  Shield,
  CheckCircle2,
  Clock,
  Sparkles,
  X,
  Trash2,
  Key,
  Eye,
  EyeOff,
  Lock,
  CheckSquare,
  Square,
  AlertTriangle,
  Award,
  Check,
  RefreshCw,
} from 'lucide-react';

export const TeamMembersPage: React.FC = () => {
  const { t, isRTL, users, currentUser, switchUser, triggerRefresh } = useApp();

  // Create Staff Modal State
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Bekya@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'Admin' | 'Manager' | 'Agent'>('Agent');
  const [department, setDepartment] = useState('Customer Support');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([
    'reply_messages',
  ]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Delete Confirmation State
  const [memberToDelete, setMemberToDelete] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  // View Credentials Modal State
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [copiedPass, setCopiedPass] = useState(false);

  const isAdmin = currentUser?.role === 'Admin' || currentUser?.id === 'user_1';

  // Permission Options
  const permissionOptions = [
    { id: 'reply_messages', label: isRTL ? 'الرد على رسائل العملاء' : 'Reply to Customer Inquiries' },
    { id: 'manage_users', label: isRTL ? 'إدارة الموظفين وتعيين الصلاحيات' : 'Manage Staff Accounts & Roles' },
    { id: 'manage_channels', label: isRTL ? 'ربط وإدارة قنوات Meta' : 'Manage Meta Channels & Webhooks' },
    { id: 'manage_ai', label: isRTL ? 'إعداد وضبط محرك Agent X' : 'Configure Agent X AI Automation' },
    { id: 'view_reports', label: isRTL ? 'الاطلاع على التقارير والإحصائيات' : 'View Analytics & Performance' },
    { id: 'settings', label: isRTL ? 'إدارة إعدادات النظام وقاعدة البيانات' : 'System Settings & Backups' },
  ];

  // Auto-generate strong password
  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
    let result = 'Bekya@';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(result);
  };

  // Toggle permission checkbox
  const togglePermission = (permId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]
    );
  };

  // Quick department selection
  const departmentsList = [
    { en: 'Customer Support', ar: 'خدمة العملاء' },
    { en: 'Operations & Settlement', ar: 'العمليات والتسوية' },
    { en: 'Merchant Sales & POS', ar: 'مبيعات التجار ونقاط البيع' },
    { en: 'Engineering & Operations', ar: 'الهندسة التقنية والعمليات' },
    { en: 'Risk & KYC Compliance', ar: 'المخاطر والامتثال' },
  ];

  // Update role presets
  const handleRolePresetChange = (newRole: 'Admin' | 'Manager' | 'Agent') => {
    setRole(newRole);
    if (newRole === 'Admin') {
      setSelectedPermissions([
        'all',
        'manage_users',
        'manage_channels',
        'manage_ai',
        'reply_messages',
        'view_reports',
        'settings',
      ]);
    } else if (newRole === 'Manager') {
      setSelectedPermissions(['manage_channels', 'reply_messages', 'view_reports']);
    } else {
      setSelectedPermissions(['reply_messages']);
    }
  };

  // Submit Staff Creation
  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setErrorMessage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          role,
          department,
          password: password.trim() || 'Bekya@2026',
          permissions: selectedPermissions,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to create staff account');
        return;
      }

      setShowInviteModal(false);
      setName('');
      setEmail('');
      setPassword('Bekya@2026');
      setSelectedPermissions(['reply_messages']);
      triggerRefresh();
    } catch (err) {
      console.error('Failed to create staff account:', err);
      setErrorMessage('Network connection error');
    } finally {
      setLoading(false);
    }
  };

  // Update member role
  const handleRoleChange = async (userId: string, newRole: 'Admin' | 'Manager' | 'Agent') => {
    if (!isAdmin) return;
    try {
      await fetch(`/api/team/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      triggerRefresh();
    } catch (err) {
      console.error('Failed to update role:', err);
    }
  };

  // Toggle active/suspended status
  const handleToggleActive = async (member: User) => {
    if (!isAdmin || member.id === 'user_1') return;
    try {
      const newStatus = !member.isActive;
      await fetch(`/api/team/${member.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus }),
      });
      triggerRefresh();
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  // Confirm delete employee
  const handleDeleteMember = async () => {
    if (!memberToDelete || memberToDelete.id === 'user_1') return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/team/${memberToDelete.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setMemberToDelete(null);
        triggerRefresh();
      }
    } catch (err) {
      console.error('Failed to delete member:', err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                {t('teamPageTitle')}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {t('teamPageDesc')}
              </p>
            </div>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              setErrorMessage(null);
              generatePassword();
              setShowInviteModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>{t('createStaffAccount')}</span>
          </button>
        )}
      </div>

      {/* Super Admin Control Callout */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-xl p-5 shadow-sm border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <img
              src={currentUser?.avatar}
              alt={currentUser?.name}
              className="w-14 h-14 rounded-full object-cover ring-2 ring-blue-500 shadow-md"
            />
            {(currentUser?.developerBadge || currentUser?.id === 'user_1') && (
              <span className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-950 p-1 rounded-full shadow-xs" title="Super Admin & Lead Developer">
                <Sparkles className="w-3 h-3" />
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-500/30 text-blue-300 border border-blue-500/40">
                {currentUser?.role === 'Admin' ? 'Super Admin' : currentUser?.role}
              </span>
              <p className="font-bold text-base">{currentUser?.name}</p>
              {(currentUser?.developerBadge || currentUser?.id === 'user_1') && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  {t('developerBadge')}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-1">
              {currentUser?.email} • {currentUser?.department}
            </p>
            <p className="text-[11px] text-blue-300/80 mt-0.5 font-medium">
              {isAdmin
                ? isRTL
                  ? 'تمتلك كامل صلاحيات المدير: إنشاء حسابات الموظفين، تحديد كلمات المرور، وإدارة الأذونات.'
                  : 'Full Super Admin authority: Create staff accounts, set credentials, and manage roles.'
                : isRTL
                ? 'جلسة موظف: يمكنك الرد على المحادثات ومتابعة المهام الموكلة إليك.'
                : 'Staff session: Reply to customer conversations and handle assigned tickets.'}
            </p>
          </div>
        </div>

        {/* Test Session Switcher */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-xs text-slate-300 self-stretch md:self-auto bg-slate-800/80 p-3 rounded-lg border border-slate-700/60">
          <span className="text-[11px] font-medium text-slate-400">
            {isRTL ? 'اختبار جلسة موظف:' : 'Simulate Session:'}
          </span>
          <select
            value={currentUser?.id}
            onChange={(e) => switchUser(e.target.value)}
            className="w-full sm:w-auto bg-slate-900 border border-slate-700 text-white text-xs font-semibold rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Team Roster Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <span>{isRTL ? 'سجل أعضاء الفريق والموظفين' : 'Staff Members & Account Roster'}</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
              {users.length}
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {users.map((member) => {
            const isRootAdmin = member.id === 'user_1';
            const isSuspended = member.isActive === false;

            return (
              <div
                key={member.id}
                className={`bg-white rounded-xl border p-5 shadow-xs flex flex-col justify-between transition-all ${
                  isRootAdmin
                    ? 'border-blue-300 ring-1 ring-blue-100 shadow-sm'
                    : isSuspended
                    ? 'border-slate-200 opacity-60 bg-slate-50'
                    : 'border-slate-200'
                }`}
              >
                <div>
                  {/* Member Header */}
                  <div className="flex items-start justify-between gap-2 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100 shadow-xs"
                        />
                        <span
                          className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full ring-2 ring-white ${
                            isSuspended
                              ? 'bg-slate-400'
                              : member.status === 'online'
                              ? 'bg-emerald-500'
                              : 'bg-amber-500'
                          }`}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-bold text-sm text-slate-900 truncate">
                            {member.name}
                          </h3>
                          {isRootAdmin && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-100 text-blue-700">
                              <Sparkles className="w-2.5 h-2.5" />
                              Lead Dev
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate">{member.email}</p>
                        <p className="text-[11px] text-blue-600 font-medium mt-0.5">
                          {member.department}
                        </p>
                      </div>
                    </div>

                    {/* Member Status Badge */}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                        isSuspended
                          ? 'bg-red-100 text-red-700'
                          : member.role === 'Admin'
                          ? 'bg-purple-100 text-purple-700'
                          : member.role === 'Manager'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {isSuspended ? 'Suspended' : member.role}
                    </span>
                  </div>

                  {/* Permissions & Details */}
                  <div className="py-3 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">{t('role')}:</span>
                      {isAdmin && !isRootAdmin ? (
                        <select
                          value={member.role}
                          onChange={(e) =>
                            handleRoleChange(
                              member.id,
                              e.target.value as 'Admin' | 'Manager' | 'Agent'
                            )
                          }
                          className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-slate-700"
                        >
                          <option value="Admin">{t('admin')}</option>
                          <option value="Manager">{t('manager')}</option>
                          <option value="Agent">{t('agent')}</option>
                        </select>
                      ) : (
                        <span className="font-semibold text-slate-800">
                          {isRootAdmin ? 'Super Admin' : member.role}
                        </span>
                      )}
                    </div>

                    {/* Granular Permissions Badges */}
                    <div className="pt-1">
                      <p className="text-[10px] uppercase font-bold text-slate-400 mb-1.5">
                        {isRTL ? 'الصلاحيات النشطة:' : 'Active Privileges:'}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {isRootAdmin || member.permissions?.includes('all') ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {isRTL ? 'تحكم كامل بالنظام (Full Access)' : 'Full Root Access'}
                          </span>
                        ) : member.permissions && member.permissions.length > 0 ? (
                          member.permissions.map((p) => (
                            <span
                              key={p}
                              className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700"
                            >
                              {p === 'reply_messages'
                                ? isRTL
                                  ? 'الرد على العملاء'
                                  : 'Replies'
                                : p === 'manage_channels'
                                ? isRTL
                                  ? 'قنوات Meta'
                                  : 'Channels'
                                : p === 'manage_ai'
                                ? 'Agent X'
                                : p === 'view_reports'
                                ? isRTL
                                  ? 'التقارير'
                                  : 'Reports'
                                : p}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">
                            Standard Agent
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions for Admin */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  {/* View Credentials Button */}
                  <button
                    onClick={() => {
                      setViewingUser(member);
                      setCopiedPass(false);
                    }}
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                    title={isRTL ? 'عرض بيانات الدخول' : 'View Credentials'}
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>{isRTL ? 'بيانات الحساب' : 'Credentials'}</span>
                  </button>

                  {/* Actions for Non-root accounts */}
                  {isAdmin && !isRootAdmin && (
                    <div className="flex items-center gap-2">
                      {/* Active/Suspend Toggle */}
                      <button
                        onClick={() => handleToggleActive(member)}
                        className={`text-[11px] font-medium px-2 py-1 rounded-md transition-colors ${
                          isSuspended
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                        }`}
                      >
                        {isSuspended
                          ? isRTL
                            ? 'تنشيط'
                            : 'Activate'
                          : isRTL
                          ? 'تعليق'
                          : 'Suspend'}
                      </button>

                      {/* Delete Member */}
                      <button
                        onClick={() => setMemberToDelete(member)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title={t('deleteEmployee')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {isRootAdmin && (
                    <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                      <Award className="w-3 h-3 text-amber-500" />
                      <span>Permanent Root</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          CREATE EMPLOYEE ACCOUNT MODAL (ADMIN ONLY)
         ========================================================================= */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in"
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    {t('createStaffAccount')}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {isRTL
                      ? 'إنشاء حساب موظف جديد وتعيين كلمة المرور والصلاحيات'
                      : 'Provision new employee credentials, department, and role'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="p-6 space-y-4 text-xs">
              {errorMessage && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t('memberName')} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mahmoud Farouk"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-xs"
                />
              </div>

              {/* Work Email */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t('email')} *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. mahmoud@bekyapay.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-xs"
                />
              </div>

              {/* Initial Password & Generator */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">
                    {t('employeePassword')} *
                  </label>
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>{t('generatePassword')}</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-2 end-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Role & Department */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t('role')} *
                  </label>
                  <select
                    value={role}
                    onChange={(e) => handleRolePresetChange(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Agent">{t('agent')}</option>
                    <option value="Manager">{t('manager')}</option>
                    <option value="Admin">{t('admin')}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t('department')}
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {departmentsList.map((dep, idx) => (
                      <option key={idx} value={dep.en}>
                        {isRTL ? dep.ar : dep.en}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Granular Permissions Checklist */}
              <div className="pt-2">
                <label className="block font-semibold text-slate-700 mb-2">
                  {t('permissions')}
                </label>
                <div className="space-y-1.5 p-3 rounded-lg bg-slate-50 border border-slate-200/80 max-h-36 overflow-y-auto">
                  {permissionOptions.map((opt) => {
                    const isChecked =
                      selectedPermissions.includes(opt.id) ||
                      selectedPermissions.includes('all') ||
                      role === 'Admin';
                    return (
                      <label
                        key={opt.id}
                        className="flex items-center gap-2 cursor-pointer hover:text-blue-700 select-none text-[11px]"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={role === 'Admin'}
                          onChange={() => togglePermission(opt.id)}
                          className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                        />
                        <span className={isChecked ? 'font-semibold text-slate-800' : 'text-slate-600'}>
                          {opt.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-5 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all disabled:opacity-50"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{loading ? 'Creating...' : t('createStaffAccount')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW CREDENTIALS MODAL
         ========================================================================= */}
      {viewingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div
            className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden"
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  {isRTL ? 'بيانات حساب الموظف' : 'Account Credentials'}
                </h3>
              </div>
              <button
                onClick={() => setViewingUser(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">
                    {t('memberName')}:
                  </span>
                  <p className="font-semibold text-slate-800">{viewingUser.name}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">
                    {t('email')}:
                  </span>
                  <p className="font-mono text-slate-800">{viewingUser.email}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">
                    {t('employeePassword')}:
                  </span>
                  <p className="font-mono text-blue-700 font-bold">
                    {viewingUser.password || '••••••••'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">
                    {t('role')}:
                  </span>
                  <p className="font-semibold capitalize text-slate-800">
                    {viewingUser.role} • {viewingUser.department}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const creds = `Bekya Pay Credentials:\nEmail: ${viewingUser.email}\nPassword: ${viewingUser.password || 'Bekya@2026'}`;
                    navigator.clipboard.writeText(creds);
                    setCopiedPass(true);
                    setTimeout(() => setCopiedPass(false), 2000);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  {copiedPass ? <Check className="w-3.5 h-3.5" /> : <Key className="w-3.5 h-3.5" />}
                  <span>{copiedPass ? t('copied') : isRTL ? 'نسخ البيانات' : 'Copy Credentials'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewingUser(null)}
                  className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  {isRTL ? 'إغلاق' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          DELETE CONFIRMATION MODAL
         ========================================================================= */}
      {memberToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div
            className="bg-white rounded-xl shadow-2xl border border-red-200 w-full max-w-sm overflow-hidden"
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            <div className="p-5 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>

              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  {t('deleteEmployee')}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {t('deleteEmployeeConfirm')}
                </p>
                <p className="text-xs font-bold text-slate-800 mt-2">
                  {memberToDelete.name} ({memberToDelete.email})
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setMemberToDelete(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={handleDeleteMember}
                  className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : t('delete')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
