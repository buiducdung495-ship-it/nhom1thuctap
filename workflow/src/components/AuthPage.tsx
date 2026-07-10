import React, { useState } from 'react';
import { User } from '../types';
import { Shield, Sparkles, UserCheck, Key, Phone, Mail, UserPlus, LogIn, Briefcase, DollarSign } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 font-sans text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Visual background accents */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-5xl flex flex-col lg:flex-row gap-8 items-stretch z-10">
        
        {/* Left Info Panel */}
        <div className="flex-1 flex flex-col justify-between p-8 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-8 text-indigo-500/20">
            <Sparkles size={120} className="animate-pulse" />
          </div>

          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-lg shadow-indigo-600/30">
                <Shield size={24} className="animate-spin-slow" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white">WORKFLOW ENGINE</h1>
                <p className="text-xs text-indigo-400 font-mono">Hệ thống Phê duyệt & Quản trị Tài sản Doanh nghiệp</p>
              </div>
            </div>

            <div className="space-y-6 mt-8">
              <h2 className="text-2xl font-extrabold text-white leading-tight">
                Tối ưu hóa và tự động hóa quy trình nội bộ doanh nghiệp của bạn
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Nền tảng hợp nhất giúp kéo thả biểu mẫu, cấu hình duyệt đa cấp tự động theo luồng hành chính, quản lý bàn giao, mua sắm thanh lý tài sản cố định và hỗ trợ trực tuyến bằng Trợ lý AI thông minh.
              </p>

              {/* Core capabilities list */}
              <div className="space-y-3.5 pt-4">
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-xs shrink-0 mt-0.5">✓</div>
                  <p className="text-xs text-slate-300"><strong>Phân quyền vai trò:</strong> Admin tối cao, Trưởng phòng phê duyệt và Nhân sự mượn thiết bị.</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-xs shrink-0 mt-0.5">✓</div>
                  <p className="text-xs text-slate-300"><strong>Đăng nhập chính chủ:</strong> Xác thực nhanh qua Email công ty hoặc Số điện thoại cùng với Mã nhân viên nội bộ.</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-xs shrink-0 mt-0.5">✓</div>
                  <p className="text-xs text-slate-300"><strong>Độ bảo mật tuyệt đối:</strong> Mã nhân viên thay thế mật khẩu phức tạp giúp đăng nhập nhanh gọn.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800/60 pt-6 mt-8">
            <p className="text-[11px] text-slate-500 font-mono">
              UTC: 2026-06-25 • Hệ thống đã kiểm định An toàn Thông tin ISO 27001
            </p>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="w-full lg:w-[480px] bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between shadow-2xl">
          
          <div>
            {/* Header / Tabs */}
            <div className="flex border-b border-slate-800 pb-4 mb-6">
              <button
                onClick={() => { setIsLogin(true); setErrorMsg(null); }}
                className={`flex-1 pb-2 text-center text-sm font-bold transition-all relative cursor-pointer ${
                  isLogin ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <span>ĐĂNG NHẬP</span>
                {isLogin && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />}
              </button>
              <button
                onClick={() => { setIsLogin(false); setErrorMsg(null); }}
                className={`flex-1 pb-2 text-center text-sm font-bold transition-all relative cursor-pointer ${
                  !isLogin ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <span>ĐĂNG KÝ MỚI</span>
                {!isLogin && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full" />}
              </button>
            </div>

            {/* Error and Success alerts */}
            {errorMsg && (
              <div className="mb-4 p-3.5 bg-rose-500/10 border border-rose-500/25 text-rose-300 rounded-xl text-xs flex items-start gap-2 animate-slide-up">
                <span className="shrink-0 mt-0.5">⚠️</span>
                <p className="leading-relaxed">{errorMsg}</p>
              </div>
            )}
            {successMsg && (
              <div className="mb-4 p-3.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 rounded-xl text-xs flex items-start gap-2 animate-slide-up">
                <span className="shrink-0 mt-0.5">✓</span>
                <p className="leading-relaxed">{successMsg}</p>
              </div>
            )}

            {/* Active Mode Forms */}
            {isLogin ? (
              show2FA ? (
                <form onSubmit={handleVerify2FA} className="space-y-4 animate-slide-up">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      Mã xác thực OTP (2FA)
                    </label>
                    <p className="text-xs text-slate-400 mb-2">Vui lòng nhập mã bảo mật 4 chữ số gửi qua tin nhắn.</p>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-500">
                        <Shield size={15} />
                      </span>
                      <input
                        type="text"
                        placeholder="1234"
                        maxLength={4}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl py-2 pl-9 pr-4 text-xs text-white focus:outline-none transition-colors text-center tracking-[0.5em] font-mono text-lg"
                        required
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShow2FA(false)}
                      className="w-1/3 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors"
                    >
                      Quay lại
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`w-2/3 py-2.5 px-4 rounded-xl text-xs font-bold flex justify-center items-center transition-all ${
                        isLoading ? 'bg-emerald-600/50 text-emerald-200 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                      }`}
                    >
                      {isLoading ? 'ĐANG XÁC THỰC...' : 'XÁC NHẬN OTP'}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      Email công ty hoặc Số điện thoại
                    </label>
                    <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500">
                      <Mail size={15} />
                    </span>
                    <input
                      type="text"
                      placeholder="dat.nguyen@company.com hoặc 0945678901"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-xl py-2 pl-9 pr-4 text-xs text-white focus:outline-none transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Mã nhân viên (ID)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500">
                      <Key size={15} />
                    </span>
                    <input
                      type="text"
                      placeholder="Ví dụ: emp-1, mgr-tech"
                      value={loginEmployeeId}
                      onChange={(e) => setLoginEmployeeId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-xl py-2 pl-9 pr-4 text-xs text-white focus:outline-none transition-colors"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-lg shadow-indigo-600/20 flex items-center justify-center space-x-2 mt-6 cursor-pointer disabled:opacity-50"
                >
                  <LogIn size={15} />
                  <span>{isLoading ? 'Đang xác thực...' : 'Xác thực & Đăng nhập'}</span>
                </button>
              </form>
              )
            ) : (
              <form onSubmit={handleRegister} className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
                
                {/* ID (Mã NV) */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Mã nhân viên tự chọn (Bắt buộc để đăng nhập)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500">
                      <Key size={15} />
                    </span>
                    <input
                      type="text"
                      placeholder="Ví dụ: emp-9, mgr-sales"
                      value={regEmployeeId}
                      onChange={(e) => setRegEmployeeId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-xl py-2 pl-9 pr-4 text-xs text-white focus:outline-none transition-colors"
                      required
                    />
                  </div>
                </div>

                {/* Name */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Họ và tên nhân viên
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500">
                      <UserCheck size={15} />
                    </span>
                    <input
                      type="text"
                      placeholder="Ví dụ: Trần Hoàng Long"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-xl py-2 pl-9 pr-4 text-xs text-white focus:outline-none transition-colors"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Email công việc
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500">
                      <Mail size={15} />
                    </span>
                    <input
                      type="email"
                      placeholder="Ví dụ: long.tran@company.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-xl py-2 pl-9 pr-4 text-xs text-white focus:outline-none transition-colors"
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Số điện thoại liên hệ
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500">
                      <Phone size={15} />
                    </span>
                    <input
                      type="text"
                      placeholder="Ví dụ: 0915123456"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-xl py-2 pl-9 pr-4 text-xs text-white focus:outline-none transition-colors"
                      required
                    />
                  </div>
                </div>

                {/* Grid for Dept & Role */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      Phòng ban
                    </label>
                    <select
                      value={regDepartment}
                      onChange={(e) => setRegDepartment(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                    >
                      <option value="Tech">Công nghệ (Tech)</option>
                      <option value="HR">Nhân sự (HR)</option>
                      <option value="Finance">Tài chính (Finance)</option>
                      <option value="Sales">Kinh doanh (Sales)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      Vị trí / Vai trò
                    </label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                    >
                      <option value="employee">Nhân viên (Employee)</option>
                      <option value="manager">Trưởng phòng (Manager)</option>
                    </select>
                  </div>
                </div>

                {/* Salary */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Mức lương đề xuất (VNĐ)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500">
                      <DollarSign size={15} />
                    </span>
                    <input
                      type="number"
                      placeholder="Mức lương đề xuất..."
                      value={regSalary}
                      onChange={(e) => setRegSalary(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-xl py-2 pl-9 pr-4 text-xs text-white focus:outline-none transition-colors"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-lg shadow-purple-600/20 flex items-center justify-center space-x-2 mt-4 cursor-pointer disabled:opacity-50"
                >
                  <UserPlus size={15} />
                  <span>{isLoading ? 'Đang tạo tài khoản...' : 'Đăng ký thành viên'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Persona Demo Login Quick Helper */}
          {isLogin && (
            <div className="mt-6 pt-5 border-t border-slate-800/60">
              <span className="block text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-2.5">
                Nhấp nhanh tài khoản Demo (Vai trò đại diện)
              </span>
              
              {/* Filter Tabs */}
              <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1 scrollbar-thin">
                {(['all', 'admin', 'manager', 'employee'] as const).map((roleOption) => (
                  <button
                    key={roleOption}
                    type="button"
                    onClick={() => setSelectedRoleFilter(roleOption)}
                    className={`px-2 py-1 text-[9px] font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer border ${
                      selectedRoleFilter === roleOption
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    {roleOption === 'all' ? 'Tất cả' : roleOption === 'admin' ? 'Admin' : roleOption === 'manager' ? 'Quản lý' : 'Nhân viên'}
                  </button>
                ))}
              </div>

              {/* Scrollable grid of filtered users */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                {filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleDemoSelect(user)}
                    className="p-2 text-left bg-slate-950 border border-slate-800/80 hover:border-indigo-500/50 hover:bg-indigo-950/20 rounded-xl text-[11px] text-slate-300 hover:text-slate-100 transition-all flex items-center space-x-2 cursor-pointer"
                  >
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      className="w-6 h-6 rounded-full object-cover shrink-0 border border-slate-700" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="truncate flex-1 min-w-0">
                      <p className="font-bold truncate text-[11px]">{user.name}</p>
                      <p className="text-[9px] font-mono text-slate-500 flex items-center justify-between">
                        <span>{user.id}</span>
                        <span className={`text-[8px] px-1 rounded uppercase font-bold border ${
                          user.role === 'admin' 
                            ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
                            : user.role === 'manager' 
                              ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' 
                              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        }`}>
                          {user.role}
                        </span>
                      </p>
                    </div>
                  </button>
                ))}
                {filteredUsers.length === 0 && (
                  <div className="col-span-2 py-4 text-center text-xs text-slate-500 font-mono">
                    Không tìm thấy nhân viên nào thuộc nhóm này.
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
