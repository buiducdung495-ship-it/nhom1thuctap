import React, { useState } from 'react';
import { User } from '../types';
import {
  Shield,
  Sparkles,
  UserCheck,
  Key,
  Phone,
  Mail,
  UserPlus,
  LogIn,
  Briefcase,
  DollarSign,
  Search,
  ChevronRight,
  Info,
  Layers,
  FileText,
  Calendar,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

interface AuthPageProps {
  onLoginSuccess: (user: User) => void;
  allUsers: User[];
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess, allUsers }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginEmployeeId, setLoginEmployeeId] = useState('');
  
  // Register Form States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regDepartment, setRegDepartment] = useState<'Tech' | 'HR' | 'Finance' | 'Sales' | 'Admin'>('Tech');
  const [regRole, setRegRole] = useState<'admin' | 'manager' | 'employee'>('employee');
  const [regEmployeeId, setRegEmployeeId] = useState('');
  const [regSalary, setRegSalary] = useState(15000000);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedRoleFilter, setSelectedRoleFilter] = useState<'all' | 'admin' | 'manager' | 'employee'>('all');

  const [show2FA, setShow2FA] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  const filteredUsers = allUsers.filter(u => {
    if (selectedRoleFilter === 'all') return true;
    return u.role === selectedRoleFilter;
  });

  // Quick select/demo login helper
  const handleDemoSelect = (user: User) => {
    setLoginIdentifier(user.email || user.phoneNumber || '');
    setLoginEmployeeId(user.id);
    setErrorMsg(null);
  };

  const handleLoginSubmit = async (e?: React.FormEvent, skip2FA = false) => {
    if (e) e.preventDefault();
    if (!loginIdentifier || !loginEmployeeId) {
      setErrorMsg('Vui lòng nhập Email/Số điện thoại và Mã nhân viên.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: loginIdentifier,
          employeeId: loginEmployeeId,
          skip2FA
        })
      });

      const data = await response.json();
      
      if (response.status === 202 && data.require2FA) {
        setShow2FA(true);
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || 'Đăng nhập thất bại.');
      }

      onLoginSuccess(data.user);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify2FA = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length < 4) {
      setErrorMsg('Mã OTP không hợp lệ (mẫu: 1234)');
      return;
    }
    handleLoginSubmit(undefined, true);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPhone || !regEmployeeId) {
      setErrorMsg('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: regEmployeeId,
          name: regName,
          email: regEmail,
          phoneNumber: regPhone,
          role: regRole,
          department: regDepartment,
          salary: Number(regSalary)
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Đăng ký tài khoản thất bại.');
      }

      setSuccessMsg('Đăng ký tài khoản thành công! Bạn có thể sử dụng thông tin này để đăng nhập ngay.');
      
      // Auto fill login fields and switch to login
      setLoginIdentifier(regEmail);
      setLoginEmployeeId(regEmployeeId);
      setIsLogin(true);
      
      // Clear register form
      setRegName('');
      setRegEmail('');
      setRegPhone('');
      setRegEmployeeId('');
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#ebf0f5] flex flex-col items-center justify-center p-4 sm:p-6 font-sans text-slate-700 relative overflow-hidden" id="siohioma-auth-screen">
      {/* Visual ambient soft blue background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#2f80ed]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-400/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main unified dual panel layout */}
      <div className="w-full max-w-5xl bg-white rounded-3xl border border-[#e2eae8] shadow-2xl flex flex-col lg:flex-row gap-0 overflow-hidden z-10 min-h-[640px]">
        
        {/* Left Interactive Branded Workspace Preview (matching screenshots style) */}
        <div className="lg:w-[45%] bg-[#f4f7f6] p-8 flex flex-col justify-between border-r border-[#e2eae8] relative">
          
          {/* Brand header */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              {/* JIN Logo from screenshot */}
              <div className="bg-[#2f80ed] w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md shadow-[#2f80ed]/25 tracking-wider">
                JIN
              </div>
              <div>
                <h1 className="text-sm font-extrabold tracking-tight text-[#0a2e24]">SIOHIOMA WORKFLOW</h1>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Internal Workspace Platform</p>
              </div>
            </div>

            {/* Simulated UI Cards mirroring the image mockup to look exactly like screenshot app previews */}
            <div className="space-y-4 mt-8 pointer-events-none select-none">
              
              <div className="p-3 bg-white border border-[#e2eae8] rounded-xl shadow-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#2f80ed] flex items-center justify-center">
                    <FileText size={14} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-800">Yêu cầu mượn MacBook M3</p>
                    <p className="text-[9px] text-slate-400">Hành chính · Kim Tiểu Nam</p>
                  </div>
                </div>
                <span className="text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-full">
                  Đang duyệt
                </span>
              </div>

              <div className="p-3 bg-white border border-[#e2eae8] rounded-xl shadow-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CheckCircle size={14} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-800">Xin nghỉ phép năm (5 ngày)</p>
                    <p className="text-[9px] text-slate-400">Nhân sự · Nguyễn Hoàng Đạt</p>
                  </div>
                </div>
                <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full">
                  Hoàn tất
                </span>
              </div>

              {/* Decorative mini summary metric cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#e9f5f0] border border-[#d2ebe1] rounded-xl">
                  <span className="text-[8px] font-bold text-emerald-800 uppercase tracking-wider">KPI Hoàn Tất</span>
                  <p className="text-xl font-bold text-[#0a2e24] mt-0.5">92.4%</p>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
                  <span className="text-[8px] font-bold text-blue-800 uppercase tracking-wider">Thiết Bị Sẵn Có</span>
                  <p className="text-xl font-bold text-blue-950 mt-0.5">148 máy</p>
                </div>
              </div>

              {/* Mini illustration styled avatar bar from screenshot */}
              <div className="p-3.5 bg-[#ebf0f5] rounded-xl border border-[#e2eae8]/60 flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-1.5">
                  <div className="flex -space-x-1.5">
                    <div className="w-5 h-5 rounded-full bg-slate-300 border border-white text-[8px] flex items-center justify-center font-bold">A</div>
                    <div className="w-5 h-5 rounded-full bg-slate-400 border border-white text-[8px] flex items-center justify-center font-bold">B</div>
                    <div className="w-5 h-5 rounded-full bg-blue-500 border border-white text-[8px] text-white flex items-center justify-center font-bold">+5</div>
                  </div>
                  <span className="font-semibold text-slate-600">Thành viên phòng ban vừa đăng nhập</span>
                </div>
                <span className="w-1.5 h-1.5 rounded-full bg-[#12b76a]" />
              </div>

            </div>
          </div>

          {/* Bottom branding footer */}
          <div className="border-t border-[#e2eae8] pt-4 mt-6">
            <h3 className="text-xs font-bold text-[#0a2e24]">Quản trị Quy trình Công việc Toàn diện</h3>
            <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
              Tối ưu hóa các tờ trình phê duyệt, văn bản đến/đi, bàn giao tài sản thiết bị, chấm công nghỉ phép và hỗ trợ bởi Trợ lý AI tiên tiến.
            </p>
            <div className="flex items-center gap-2 mt-3 text-[9px] font-mono text-slate-400">
              <span className="px-2 py-0.5 bg-slate-200/50 rounded text-slate-600">SSL SECURE</span>
              <span>•</span>
              <span>UTC: 2026</span>
            </div>
          </div>

        </div>

        {/* Right Tab Form Panel (Pure modern white, with beautiful Siohioma aesthetic) */}
        <div className="flex-1 bg-white p-6 sm:p-8 flex flex-col justify-between">
          
          <div>
            {/* Nav Tabs using beautiful corporate blue (#2f80ed) */}
            <div className="flex border-b border-[#e2eae8] pb-4 mb-6">
              <button
                onClick={() => { setIsLogin(true); setErrorMsg(null); }}
                className={`flex-1 pb-2 text-center text-xs font-bold transition-all relative cursor-pointer tracking-wider ${
                  isLogin ? 'text-[#2f80ed]' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <span>ĐĂNG NHẬP HỆ THỐNG</span>
                {isLogin && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2f80ed] rounded-full" />}
              </button>
              <button
                onClick={() => { setIsLogin(false); setErrorMsg(null); }}
                className={`flex-1 pb-2 text-center text-xs font-bold transition-all relative cursor-pointer tracking-wider ${
                  !isLogin ? 'text-[#2f80ed]' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <span>ĐĂNG KÝ THÀNH VIÊN MỚI</span>
                {!isLogin && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2f80ed] rounded-full" />}
              </button>
            </div>

            {/* Error and Success alerts */}
            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-xs flex items-start gap-2.5 animate-slide-up">
                <span className="shrink-0 mt-0.5">⚠️</span>
                <p className="leading-relaxed font-semibold">{errorMsg}</p>
              </div>
            )}
            {successMsg && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-xs flex items-start gap-2.5 animate-slide-up">
                <span className="shrink-0 mt-0.5">✓</span>
                <p className="leading-relaxed font-semibold">{successMsg}</p>
              </div>
            )}

            {/* Active Mode Forms */}
            {isLogin ? (
              show2FA ? (
                <form onSubmit={handleVerify2FA} className="space-y-4 animate-slide-up">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Mã xác thực OTP (2FA)
                    </label>
                    <p className="text-xs text-slate-500 mb-2">Vui lòng nhập mã bảo mật 4 chữ số vừa được gửi qua SMS.</p>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-400">
                        <Shield size={16} />
                      </span>
                      <input
                        type="text"
                        placeholder="1234"
                        maxLength={4}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-[#f8fafc] border border-[#e2eae8] focus:border-[#2f80ed] focus:ring-1 focus:ring-[#2f80ed] rounded-xl py-2.5 pl-9 pr-4 text-xs focus:outline-none transition-all text-center tracking-[0.5em] font-mono text-lg text-slate-800"
                        required
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="flex gap-2.5">
                    <button
                      type="button"
                      onClick={() => setShow2FA(false)}
                      className="w-1/3 py-2.5 px-4 bg-[#f1f5f9] hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Quay lại
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`w-2/3 py-2.5 px-4 rounded-xl text-xs font-bold flex justify-center items-center transition-all cursor-pointer ${
                        isLoading ? 'bg-emerald-400 text-white cursor-not-allowed' : 'bg-[#12b76a] hover:bg-[#0fa65e] text-white shadow-md shadow-emerald-500/10'
                      }`}
                    >
                      {isLoading ? 'ĐANG XÁC THỰC...' : 'XÁC NHẬN OTP'}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Email công ty hoặc Số điện thoại
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3 text-slate-400">
                        <Mail size={14} />
                      </span>
                      <input
                        type="text"
                        placeholder="long.tran@company.com hoặc 0915123456"
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        className="w-full bg-[#f8fafc] border border-[#e2eae8] focus:ring-1 focus:ring-[#2f80ed] focus:border-[#2f80ed] rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition-all font-medium"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Mã nhân viên (ID)
                      </label>
                      <span className="text-[9px] text-[#2f80ed] font-semibold cursor-pointer hover:underline">Quên mã nhân viên?</span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3 text-slate-400">
                        <Key size={14} />
                      </span>
                      <input
                        type="text"
                        placeholder="Mã ID, ví dụ: emp-1, mgr-tech"
                        value={loginEmployeeId}
                        onChange={(e) => setLoginEmployeeId(e.target.value)}
                        className="w-full bg-[#f8fafc] border border-[#e2eae8] focus:ring-1 focus:ring-[#2f80ed] focus:border-[#2f80ed] rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition-all font-medium"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#2f80ed] hover:bg-[#1c71dd] text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-md shadow-blue-500/10 flex items-center justify-center space-x-2 mt-6 cursor-pointer disabled:opacity-50"
                  >
                    <LogIn size={14} />
                    <span>{isLoading ? 'Đang xác thực hệ thống...' : 'Đăng nhập vào Hệ thống'}</span>
                  </button>
                </form>
              )
            ) : (
              <form onSubmit={handleRegister} className="space-y-3.5 max-h-[340px] overflow-y-auto pr-1">
                
                {/* ID (Mã NV) */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Mã nhân viên tự chọn (Dùng để Đăng nhập)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400">
                      <Key size={14} />
                    </span>
                    <input
                      type="text"
                      placeholder="Ví dụ: emp-9, mgr-sales"
                      value={regEmployeeId}
                      onChange={(e) => setRegEmployeeId(e.target.value)}
                      className="w-full bg-[#f8fafc] border border-[#e2eae8] focus:border-[#2f80ed] focus:ring-1 focus:ring-[#2f80ed] rounded-xl py-2 pl-9 text-xs text-slate-800 focus:outline-none transition-colors font-medium"
                      required
                    />
                  </div>
                </div>

                {/* Name */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Họ và tên nhân viên
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400">
                      <UserCheck size={14} />
                    </span>
                    <input
                      type="text"
                      placeholder="Ví dụ: Nguyễn Thế Khải"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full bg-[#f8fafc] border border-[#e2eae8] focus:border-[#2f80ed] focus:ring-1 focus:ring-[#2f80ed] rounded-xl py-2 pl-9 text-xs text-slate-800 focus:outline-none transition-colors font-medium"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Email doanh nghiệp
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400">
                      <Mail size={14} />
                    </span>
                    <input
                      type="email"
                      placeholder="Ví dụ: khai.nguyen@siohioma.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full bg-[#f8fafc] border border-[#e2eae8] focus:border-[#2f80ed] focus:ring-1 focus:ring-[#2f80ed] rounded-xl py-2 pl-9 text-xs text-slate-800 focus:outline-none transition-colors font-medium"
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Số điện thoại di động
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400">
                      <Phone size={14} />
                    </span>
                    <input
                      type="text"
                      placeholder="Ví dụ: 0912345678"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full bg-[#f8fafc] border border-[#e2eae8] focus:border-[#2f80ed] focus:ring-1 focus:ring-[#2f80ed] rounded-xl py-2 pl-9 text-xs text-slate-800 focus:outline-none transition-colors font-medium"
                      required
                    />
                  </div>
                </div>

                {/* Grid for Dept & Role */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Phòng ban
                    </label>
                    <select
                      value={regDepartment}
                      onChange={(e) => setRegDepartment(e.target.value as any)}
                      className="w-full bg-[#f8fafc] border border-[#e2eae8] focus:border-[#2f80ed] focus:ring-1 focus:ring-[#2f80ed] rounded-xl py-2 px-2.5 text-xs text-slate-800 focus:outline-none font-medium"
                    >
                      <option value="Tech">Công nghệ (Tech)</option>
                      <option value="HR">Nhân sự (HR)</option>
                      <option value="Finance">Tài chính (Finance)</option>
                      <option value="Sales">Kinh doanh (Sales)</option>
                      <option value="Admin">Hành chính (Admin)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Vai trò công tác
                    </label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value as any)}
                      className="w-full bg-[#f8fafc] border border-[#e2eae8] focus:border-[#2f80ed] focus:ring-1 focus:ring-[#2f80ed] rounded-xl py-2 px-2.5 text-xs text-slate-800 focus:outline-none font-medium"
                    >
                      <option value="employee">Nhân viên (Employee)</option>
                      <option value="manager">Trưởng phòng (Manager)</option>
                      <option value="admin">Quản trị cấp cao (Admin)</option>
                    </select>
                  </div>
                </div>

                {/* Salary */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Mức lương đăng ký (VNĐ)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400">
                      <DollarSign size={14} />
                    </span>
                    <input
                      type="number"
                      placeholder="Mức lương..."
                      value={regSalary}
                      onChange={(e) => setRegSalary(Number(e.target.value))}
                      className="w-full bg-[#f8fafc] border border-[#e2eae8] focus:border-[#2f80ed] focus:ring-1 focus:ring-[#2f80ed] rounded-xl py-2 pl-9 text-xs text-slate-800 focus:outline-none transition-colors font-medium"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#12b76a] hover:bg-[#0fa65e] text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-md shadow-emerald-500/10 flex items-center justify-center space-x-2 mt-4 cursor-pointer disabled:opacity-50"
                >
                  <UserPlus size={14} />
                  <span>{isLoading ? 'Đang đăng ký tài khoản...' : 'Đăng ký Tài khoản Mới'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Persona Demo Login Quick Helper (Beautiful grid with matching avatar badges and role tags) */}
          {isLogin && (
            <div className="mt-6 pt-5 border-t border-[#e2eae8]">
              <div className="flex items-center justify-between mb-3">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  TÀI KHOẢN KHIỂM THỬ KHẢO SÁT HỆ THỐNG
                </span>
                <span className="text-[9px] bg-blue-50 text-[#2f80ed] px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                  MOCK DB
                </span>
              </div>
              
              {/* Filter Tabs for Roles */}
              <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1">
                {(['all', 'admin', 'manager', 'employee'] as const).map((roleOption) => (
                  <button
                    key={roleOption}
                    type="button"
                    onClick={() => setSelectedRoleFilter(roleOption)}
                    className={`px-2.5 py-1 text-[9px] font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer border ${
                      selectedRoleFilter === roleOption
                        ? 'bg-[#2f80ed] border-[#2f80ed] text-white shadow-xs'
                        : 'bg-slate-50 border-[#e2eae8] text-slate-400 hover:text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {roleOption === 'all' ? 'Tất cả' : roleOption === 'admin' ? 'Admin' : roleOption === 'manager' ? 'Quản lý' : 'Nhân viên'}
                  </button>
                ))}
              </div>

              {/* Scrollable grid of demo users with rich visual borders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[140px] overflow-y-auto pr-1">
                {filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleDemoSelect(user)}
                    className="p-2 text-left bg-[#f8fafc] border border-[#e2eae8] hover:border-[#2f80ed] hover:bg-[#2f80ed]/5 rounded-xl text-xs text-slate-700 hover:text-slate-900 transition-all flex items-center space-x-2.5 cursor-pointer"
                  >
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      className="w-6 h-6 rounded-full object-cover shrink-0 border border-[#e2eae8]" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="truncate flex-1 min-w-0">
                      <p className="font-bold truncate text-[11px] text-slate-900">{user.name}</p>
                      <p className="text-[9px] font-mono text-slate-400 flex items-center justify-between mt-0.5">
                        <span>{user.id}</span>
                        <span className={`text-[8px] px-1.5 rounded-md font-bold uppercase tracking-wide border ${
                          user.role === 'admin' 
                            ? 'bg-rose-50 border-rose-100 text-rose-700' 
                            : user.role === 'manager' 
                              ? 'bg-amber-50 border-amber-100 text-amber-700' 
                              : 'bg-emerald-50 border-emerald-100 text-emerald-700'
                        }`}>
                          {user.role}
                        </span>
                      </p>
                    </div>
                  </button>
                ))}
                {filteredUsers.length === 0 && (
                  <div className="col-span-2 py-4 text-center text-xs text-slate-400 font-mono border border-dashed border-[#e2eae8] rounded-xl">
                    Không tìm thấy tài khoản thuộc vai trò này.
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
