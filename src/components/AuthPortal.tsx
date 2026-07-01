import React, { useState } from 'react';
import { User, Role, Company } from '../types';
import { Shield, Lock, Mail, User as UserIcon, Building, Key, Award, ArrowRight, LogIn, Plus, ListFilter, AlertTriangle } from 'lucide-react';

interface AuthPortalProps {
  users: User[];
  companies: Company[];
  onLogin: (user: User) => void;
  onRegister: (newUser: User, newCompany?: Company) => void;
}

export default function AuthPortal({ users, companies, onLogin, onRegister }: AuthPortalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Filter out pending companies from being selected during registration
  const activeCompanies = companies.filter(c => c.active !== false);

  // Register state
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [registerRole, setRegisterRole] = useState<Role>('staff');
  const [registerDept, setRegisterDept] = useState('Hành chính Nhân sự');
  const [registerSignature, setRegisterSignature] = useState('');
  
  // Company register state
  const [companyOption, setCompanyOption] = useState<'existing' | 'new'>('existing');
  const [selectedCompanyId, setSelectedCompanyId] = useState(activeCompanies[0]?.id || 'com_1');
  
  // New company details
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyTaxCode, setNewCompanyTaxCode] = useState('');
  const [newCompanyDesc, setNewCompanyDesc] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!email.trim()) {
      setError('Vui lòng nhập Email hoặc Tên đăng nhập.');
      return;
    }

    if (!password) {
      setError('Vui lòng nhập mật khẩu.');
      return;
    }

    // Authenticate with users list
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!foundUser) {
      setError('Tài khoản không chính xác hoặc không tồn tại trên hệ thống.');
      return;
    }

    // Check password
    const expectedPassword = foundUser.password || '123'; // '123' as default fallback for seeded users
    if (password !== expectedPassword) {
      setError('Mật khẩu nhập vào không chính xác.');
      return;
    }

    if (!foundUser.active) {
      if (foundUser.role === 'admin') {
        setError('Tài khoản Quản trị hệ thống này đã bị khóa hoặc chưa kích hoạt.');
      } else {
        // Find if company is active
        const userCompany = companies.find(c => c.id === foundUser.companyId);
        if (userCompany && userCompany.active === false) {
          setError(`Doanh nghiệp "${foundUser.companyName}" đang CHỜ DUYỆT thành lập bởi Admin trang web. Bạn chưa thể đăng nhập cho đến khi công ty được phê duyệt.`);
        } else {
          setError(`Tài khoản của bạn tại ${foundUser.companyName} hiện đang CHỜ DUYỆT hoặc BỊ KHÓA. Vui lòng liên hệ Lãnh đạo/Nhân sự của công ty bạn để phê duyệt kích hoạt.`);
        }
      }
      return;
    }

    // Also check if company is approved/active (for non-system-admin roles)
    if (foundUser.role !== 'admin' && foundUser.companyId !== 'system') {
      const userCompany = companies.find(c => c.id === foundUser.companyId);
      if (userCompany && userCompany.active === false) {
        setError(`Doanh nghiệp "${foundUser.companyName}" đang ở trạng thái CHỜ DUYỆT hoặc BỊ KHÓA bởi Admin trang web. Vui lòng chờ website kích hoạt doanh nghiệp để vận hành.`);
        return;
      }
    }

    onLogin(foundUser);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!registerName.trim() || !registerEmail.trim() || !registerDept.trim()) {
      setError('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }

    if (!registerPassword) {
      setError('Vui lòng nhập mật khẩu để bảo vệ tài khoản.');
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      setError('Mật khẩu nhập lại không khớp. Vui lòng kiểm tra lại.');
      return;
    }

    if (companyOption === 'new' && !newCompanyName.trim()) {
      setError('Vui lòng nhập tên công ty cần khai báo.');
      return;
    }

    // Check if email already registered
    const emailExists = users.some(u => u.email.toLowerCase() === registerEmail.toLowerCase().trim());
    if (emailExists) {
      setError('Địa chỉ email hoặc tên đăng nhập này đã được sử dụng trên hệ thống.');
      return;
    }

    let finalCompanyId = selectedCompanyId;
    let finalCompanyName = companies.find(c => c.id === selectedCompanyId)?.name || 'Công ty mới';
    let newCompanyObj: Company | undefined = undefined;

    if (companyOption === 'new') {
      const newId = `com_${Date.now()}`;
      newCompanyObj = {
        id: newId,
        name: newCompanyName.trim(),
        taxCode: newCompanyTaxCode.trim(),
        description: newCompanyDesc.trim() || 'Công ty thành viên mới',
        active: false // Newly registered companies are pending System Admin approval
      };
      finalCompanyId = newId;
      finalCompanyName = newCompanyName.trim();
    }

    // Auto-generate signature code for roles other than staff
    let finalSignature = undefined;
    const resolvedRole = companyOption === 'new' ? 'leader' : registerRole;
    if (resolvedRole !== 'staff') {
      finalSignature = registerSignature.trim() || `SIG-${registerName.split(' ').map(n => n[0]).join('').toUpperCase()}-${Math.floor(Math.random() * 9000) + 1000}`;
    }

    // All registered users start as pending (active: false) until approved
    // If a company is registered, its leader is pending until Admin website approves the company.
    // If registering for an existing active company, user is pending until company leader approves them.
    const isActive = false;

    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: registerName,
      email: registerEmail.trim(),
      role: resolvedRole,
      department: companyOption === 'new' ? 'Ban Giám đốc' : registerDept,
      active: isActive,
      companyId: finalCompanyId,
      companyName: finalCompanyName,
      signatureCode: finalSignature,
      password: registerPassword
    };

    onRegister(newUser, newCompanyObj);

    if (companyOption === 'new') {
      setSuccessMessage(`ĐĂNG KÝ DOANH NGHIỆP THÀ THÀNH CÔNG! Công ty "${finalCompanyName}" đã được gửi lên Ban Quản Trị trang web duyệt. Tài khoản Lãnh đạo của bạn (${registerEmail}) cũng đang ở trạng thái CHỜ DUYỆT. Vui lòng chờ Admin kích hoạt.`);
      setEmail(registerEmail);
      setIsLogin(true);
    } else {
      setSuccessMessage(`ĐĂNG KÝ TÀI KHOẢN THÀNH CÔNG! Tài khoản thuộc công ty "${finalCompanyName}" đã được khởi tạo ở trạng thái CHỜ DUYỆT. Vui lòng chờ Giám đốc/Lãnh đạo của công ty bạn duyệt kích hoạt.`);
      setEmail(registerEmail);
      setIsLogin(true);
    }

    // Reset fields
    setRegisterName('');
    setRegisterEmail('');
    setRegisterPassword('');
    setRegisterConfirmPassword('');
    setRegisterRole('staff');
    setRegisterDept('Hành chính Nhân sự');
    setRegisterSignature('');
    setNewCompanyName('');
    setNewCompanyTaxCode('');
    setNewCompanyDesc('');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-6" id="auth-portal-screen">
      <div className="max-w-md w-full bg-white rounded-2xl border border-gray-150 shadow-lg overflow-hidden flex flex-col">
        
        {/* Header decoration */}
        <div className="bg-slate-900 text-white p-6 text-center space-y-2 relative">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto shadow-md">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-base font-black tracking-tight uppercase">HỆ THỐNG KÝ SỐ LIÊN DOANH NGHIỆP</h2>
            <p className="text-xxs text-indigo-300 font-bold uppercase tracking-wider">Cổng ký duyệt & Quản trị văn bản số tập trung</p>
          </div>
        </div>

        {/* Dynamic portal panels */}
        <div className="p-6 sm:p-8 flex-1">
          {error && (
            <div className="mb-5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg p-3.5 text-xs font-semibold animate-shake flex gap-2 items-start">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg p-3.5 text-xs font-semibold">
              {successMessage}
            </div>
          )}

          {isLogin ? (
            /* LOGIN PANEL */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-sm font-extrabold text-gray-800 uppercase tracking-wide">Đăng Nhập Hệ Thống</h3>
                <p className="text-xxs text-gray-400 mt-1">Sử dụng tài khoản nội bộ công ty để thực hiện luồng ký duyệt.</p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1" htmlFor="login-email-input">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  Email hoặc Tên đăng nhập
                </label>
                <input
                  id="login-email-input"
                  type="text"
                  placeholder="ví dụ: admin hoặc vana@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs bg-gray-50 border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-150 focus:bg-white"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1" htmlFor="login-password-input">
                  <Lock className="w-3.5 h-3.5 text-gray-400" />
                  Mật khẩu
                </label>
                <input
                  id="login-password-input"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs bg-gray-50 border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-150 focus:bg-white"
                  required
                />
              </div>

              {/* Shortcut account hints for demo ease */}
              <div className="bg-slate-50 border border-slate-150 p-3 rounded-lg text-xxs space-y-2">
                <span className="font-bold text-indigo-700 block uppercase tracking-wider text-[10px]">Tài khoản dùng thử nhanh:</span>
                
                <div className="space-y-2">
                  <div className="border-b border-gray-200 pb-1.5 flex justify-between items-center">
                    <span className="font-semibold text-gray-500 block text-[9px] uppercase">Hệ thống Quản trị Web (Không thuộc công ty nào)</span>
                    <button
                      type="button"
                      onClick={() => { setEmail('admin'); setPassword('admin'); }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[9px] px-2 py-1 rounded cursor-pointer"
                    >
                      Admin (admin / admin)
                    </button>
                  </div>

                  <div className="border-b border-gray-200 pb-1.5">
                    <span className="font-semibold text-gray-500 block text-[9px] uppercase">1. VinaTech (Công ty 1) - Mật khẩu: 123</span>
                    <div className="grid grid-cols-2 gap-1.5 mt-1">
                      <button
                        type="button"
                        onClick={() => { setEmail('vana@company.com'); setPassword('123'); }}
                        className="text-left bg-white hover:bg-indigo-50 border border-gray-200 p-1.5 rounded truncate font-medium text-gray-600 cursor-pointer"
                      >
                        vana@company.com (Staff)
                      </button>
                      <button
                        type="button"
                        onClick={() => { setEmail('minhc@company.com'); setPassword('123'); }}
                        className="text-left bg-white hover:bg-indigo-50 border border-gray-200 p-1.5 rounded truncate font-medium text-gray-600 cursor-pointer"
                      >
                        minhc@company.com (Reviewer)
                      </button>
                      <button
                        type="button"
                        onClick={() => { setEmail('thuye@company.com'); setPassword('123'); }}
                        className="text-left bg-white hover:bg-indigo-50 border border-gray-200 p-1.5 rounded truncate font-medium text-gray-600 cursor-pointer"
                      >
                        thuye@company.com (CEO)
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="font-semibold text-gray-500 block text-[9px] uppercase">2. VinaGroup (Công ty 2) - Mật khẩu: 123</span>
                    <div className="grid grid-cols-2 gap-1.5 mt-1">
                      <button
                        type="button"
                        onClick={() => { setEmail('linh.pk@vinagroup.com'); setPassword('123'); }}
                        className="text-left bg-white hover:bg-indigo-50 border border-gray-200 p-1.5 rounded truncate font-medium text-gray-600 cursor-pointer"
                      >
                        linh.pk@vinagroup.com (Staff)
                      </button>
                      <button
                        type="button"
                        onClick={() => { setEmail('quan.nm@vinagroup.com'); setPassword('123'); }}
                        className="text-left bg-white hover:bg-indigo-50 border border-gray-200 p-1.5 rounded truncate font-medium text-gray-600 cursor-pointer"
                      >
                        quan.nm@vinagroup.com (CEO)
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1 shadow-sm cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                Đăng nhập hệ thống
              </button>
            </form>
          ) : (
            /* REGISTER PANEL WITH MULTI-COMPANY CAPABILITY */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="text-center mb-2">
                <h3 className="text-sm font-extrabold text-gray-800 uppercase tracking-wide">Đăng Ký Thành Viên</h3>
                <p className="text-xxs text-gray-400 mt-1">Gia nhập công ty hiện tại hoặc khai báo doanh nghiệp mới của bạn.</p>
              </div>

              {/* COMPANY OPTION SELECTOR */}
              <div className="bg-slate-50 border border-slate-150 rounded-lg p-2.5 space-y-2">
                <span className="text-xxs font-bold text-gray-500 uppercase tracking-wide block">Khai báo doanh nghiệp:</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCompanyOption('existing')}
                    className={`p-2 text-xxs font-bold rounded-lg border transition-all flex items-center justify-center gap-1 ${
                      companyOption === 'existing'
                        ? 'bg-white border-indigo-600 text-indigo-600 shadow-xxs'
                        : 'border-gray-200 text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    <ListFilter className="w-3.5 h-3.5" />
                    Chọn công ty sẵn có
                  </button>
                  <button
                    type="button"
                    onClick={() => setCompanyOption('new')}
                    className={`p-2 text-xxs font-bold rounded-lg border transition-all flex items-center justify-center gap-1 ${
                      companyOption === 'new'
                        ? 'bg-white border-indigo-600 text-indigo-600 shadow-xxs'
                        : 'border-gray-200 text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Khai báo công ty mới
                  </button>
                </div>

                {companyOption === 'existing' ? (
                  <div className="pt-1.5 space-y-1">
                    <label className="text-[10px] font-bold text-gray-600" htmlFor="reg-company-select">Chọn đơn vị đang hoạt động:</label>
                    <select
                      id="reg-company-select"
                      value={selectedCompanyId}
                      onChange={(e) => setSelectedCompanyId(e.target.value)}
                      className="w-full text-xs bg-white border border-gray-300 rounded p-1.5 font-semibold text-gray-700"
                    >
                      {activeCompanies.map(com => (
                        <option key={com.id} value={com.id}>{com.name}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="pt-1.5 space-y-2 border-t border-gray-200 animate-slide-down">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-600" htmlFor="new-company-name-input">Tên công ty / Tập đoàn <span className="text-rose-500">*</span></label>
                      <input
                        id="new-company-name-input"
                        type="text"
                        placeholder="Ví dụ: Công ty Cổ phần VinaSaaS"
                        value={newCompanyName}
                        onChange={(e) => setNewCompanyName(e.target.value)}
                        className="w-full text-xs bg-white border border-gray-300 rounded p-1.5 focus:outline-none"
                        required={companyOption === 'new'}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-600" htmlFor="new-company-tax-input">Mã số thuế</label>
                        <input
                          id="new-company-tax-input"
                          type="text"
                          placeholder="010xxxxxx"
                          value={newCompanyTaxCode}
                          onChange={(e) => setNewCompanyTaxCode(e.target.value)}
                          className="w-full text-xs bg-white border border-gray-300 rounded p-1.5 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-600" htmlFor="new-company-desc-input">Mô tả lĩnh vực</label>
                        <input
                          id="new-company-desc-input"
                          type="text"
                          placeholder="Ví dụ: Bán lẻ, Sản xuất..."
                          value={newCompanyDesc}
                          onChange={(e) => setNewCompanyDesc(e.target.value)}
                          className="w-full text-xs bg-white border border-gray-300 rounded p-1.5 focus:outline-none"
                        />
                      </div>
                    </div>
                    <p className="text-[9px] text-indigo-600 font-medium">Khi đăng ký công ty mới, hệ thống tự động chỉ định tài khoản này làm <strong>Giám đốc doanh nghiệp (Leader)</strong> ở trạng thái chờ Admin duyệt thành lập.</p>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1" htmlFor="reg-name-input">
                  <UserIcon className="w-3.5 h-3.5 text-gray-400" />
                  Họ và tên <span className="text-rose-500">*</span>
                </label>
                <input
                  id="reg-name-input"
                  type="text"
                  placeholder="ví dụ: Nguyễn Hồng Quân"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  className="w-full text-xs bg-gray-50 border border-gray-300 rounded p-2 focus:outline-none"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-700 flex items-center gap-1" htmlFor="reg-email-input">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  Email đăng ký <span className="text-rose-500">*</span>
                </label>
                <input
                  id="reg-email-input"
                  type="email"
                  placeholder="quannh@domain.com"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  className="w-full text-xs bg-gray-50 border border-gray-300 rounded p-2 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-700 flex items-center gap-1" htmlFor="reg-password-input">
                    <Lock className="w-3.5 h-3.5 text-gray-400" />
                    Mật khẩu <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="reg-password-input"
                    type="password"
                    placeholder="Nhập mật khẩu"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    className="w-full text-xs bg-gray-50 border border-gray-300 rounded p-2 focus:outline-none"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-700 flex items-center gap-1" htmlFor="reg-confirm-password-input">
                    <Lock className="w-3.5 h-3.5 text-gray-400" />
                    Nhập lại mật khẩu <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="reg-confirm-password-input"
                    type="password"
                    placeholder="Nhập lại mật khẩu"
                    value={registerConfirmPassword}
                    onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                    className="w-full text-xs bg-gray-50 border border-gray-300 rounded p-2 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-700 flex items-center gap-1" htmlFor="reg-dept-input">
                    <Building className="w-3.5 h-3.5 text-gray-400" />
                    Phòng ban <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="reg-dept-input"
                    value={registerDept}
                    onChange={(e) => setRegisterDept(e.target.value)}
                    className="w-full text-xs bg-gray-50 border border-gray-300 rounded p-2 text-gray-700 font-medium"
                  >
                    <option value="Hành chính Nhân sự">Hành chính Nhân sự</option>
                    <option value="Kỹ thuật Công nghệ">Kỹ thuật Công nghệ</option>
                    <option value="Phòng Kế hoạch">Phòng Kế hoạch</option>
                    <option value="Ban Giám đốc">Ban Giám đốc</option>
                    <option value="Ban Điều hành">Ban Điều hành</option>
                  </select>
                </div>

                {companyOption === 'existing' && (
                  <div className="flex flex-col gap-1 animate-slide-down">
                    <label className="text-xs font-bold text-gray-700 flex items-center gap-1" htmlFor="reg-role-select">
                      <Key className="w-3.5 h-3.5 text-gray-400" />
                      Phân quyền <span className="text-rose-500">*</span>
                    </label>
                    <select
                      id="reg-role-select"
                      value={registerRole}
                      onChange={(e) => setRegisterRole(e.target.value as Role)}
                      className="w-full text-xs bg-gray-50 border border-gray-300 rounded p-2 text-gray-700 font-bold"
                    >
                      <option value="staff">Nhân viên soạn thảo</option>
                      <option value="approver">Người thẩm định nội bộ</option>
                      <option value="leader">Giám đốc (Ký số điện tử)</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Digital signature optional input based on role selection */}
              {((companyOption === 'existing' && registerRole !== 'staff') || companyOption === 'new') && (
                <div className="flex flex-col gap-1 border-t border-dashed border-gray-200 pt-2 animate-slide-down">
                  <label className="text-xs font-bold text-indigo-800 flex items-center gap-1" htmlFor="reg-signature-input">
                    <Award className="w-3.5 h-3.5 text-indigo-500" />
                    Mã khóa chứng thư ký số (CA)
                  </label>
                  <input
                    id="reg-signature-input"
                    type="text"
                    placeholder="Để trống hệ thống tự tạo"
                    value={registerSignature}
                    onChange={(e) => setRegisterSignature(e.target.value)}
                    className="w-full text-xs bg-indigo-50/50 border border-indigo-200 rounded p-2 font-mono text-indigo-900 focus:outline-none"
                  />
                  <p className="text-[10px] text-gray-400">Khóa chứng thư giúp bảo mật và xác thực pháp lý cho mỗi chữ ký số.</p>
                </div>
              )}

              {/* Informational banner about pending approval */}
              <div className="bg-amber-50 border border-amber-200 text-amber-800 p-2.5 rounded text-[10px] font-medium leading-relaxed">
                {companyOption === 'new' ? (
                  <span>⚠️ Lưu ý: Yêu cầu khai báo Công ty mới thành lập và tài khoản của bạn cần được <strong>Quản trị viên Hệ thống (Platform Admin)</strong> của trang web phê duyệt trước khi đi vào hoạt động.</span>
                ) : (
                  <span>⚠️ Lưu ý: Tài khoản đăng ký mới tại đơn vị liên kết cần được <strong>Lãnh đạo/Giám đốc</strong> của công ty đó phê duyệt kích hoạt mới có thể đăng nhập.</span>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1 shadow-sm mt-1 cursor-pointer"
              >
                Hoàn thành đăng ký doanh nghiệp
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {/* Switch Tab link bar */}
          <div className="mt-5 pt-4 border-t border-gray-100 text-center text-xs">
            {isLogin ? (
              <p className="text-gray-500">
                Doanh nghiệp mới tham gia?{' '}
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className="text-indigo-600 font-extrabold hover:underline cursor-pointer"
                >
                  Đăng ký & Khai báo công ty
                </button>
              </p>
            ) : (
              <p className="text-gray-500">
                Đã là thành viên công ty?{' '}
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className="text-indigo-600 font-extrabold hover:underline cursor-pointer"
                >
                  Quay lại Đăng nhập
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Informative Footer */}
        <div className="bg-slate-50 border-t border-gray-100 p-4 text-center text-[10px] text-gray-400 font-semibold">
          Hệ thống ký số đa doanh nghiệp chuẩn Nghị định 30/2020/NĐ-CP & Luật Giao dịch điện tử.
        </div>
      </div>
    </div>
  );
}
