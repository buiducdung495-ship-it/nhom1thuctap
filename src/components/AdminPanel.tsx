import React, { useState } from 'react';
import { User, DocumentTemplate, WorkflowConfig, WorkflowStepConfig, Role, Company } from '../types';
import { 
  Users, 
  Shield, 
  BookOpen, 
  Settings2, 
  Plus, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  UserCheck, 
  Key, 
  UserPlus, 
  AlertCircle, 
  Building, 
  Building2, 
  Search, 
  Briefcase,
  Sliders,
  Award
} from 'lucide-react';

interface AdminPanelProps {
  currentUser: User;
  users: User[];
  companies: Company[];
  templates: DocumentTemplate[];
  workflows: WorkflowConfig[];
  onUpdateUsers: (updated: User[]) => void;
  onUpdateCompanies: (updated: Company[]) => void;
  onUpdateTemplates: (updated: DocumentTemplate[]) => void;
  onUpdateWorkflows: (updated: WorkflowConfig[]) => void;
}

export default function AdminPanel({
  currentUser,
  users,
  companies,
  templates,
  workflows,
  onUpdateUsers,
  onUpdateCompanies,
  onUpdateTemplates,
  onUpdateWorkflows
}: AdminPanelProps) {
  // Tabs change based on role
  const isSystemAdmin = currentUser.role === 'admin';
  const [systemTab, setSystemTab] = useState<'companies' | 'all_users'>('companies');
  const [leaderTab, setLeaderTab] = useState<'company_users' | 'workflows' | 'templates'>('company_users');

  // Filter terms
  const [userSearch, setUserSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState('all');

  // State for creating a new company manually (System Admin feature)
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [newCompany, setNewCompany] = useState({
    name: '',
    taxCode: '',
    description: ''
  });

  // State for managing users (Company Leader / Direct creation)
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'staff' as Role,
    department: 'Hành chính Nhân sự',
    signatureCode: ''
  });
  const [showAddUser, setShowAddUser] = useState(false);

  // State for custom approval workflows
  const [showAddWorkflow, setShowAddWorkflow] = useState(false);
  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    description: '',
    steps: [] as WorkflowStepConfig[]
  });
  const [newStep, setNewStep] = useState({
    label: '',
    role: 'approver' as Role,
    userId: ''
  });

  // State for managing templates
  const [showAddTemplate, setShowAddTemplate] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    title: '',
    category: 'Văn bản Pháp lý',
    description: '',
    content: '',
    requiredFields: [] as Array<{ id: string; label: string; type: 'text' | 'textarea' | 'date' | 'number'; placeholder?: string }>
  });
  const [newField, setNewField] = useState({
    id: '',
    label: '',
    type: 'text' as 'text' | 'textarea' | 'date' | 'number',
    placeholder: ''
  });

  // --- SYSTEM ADMIN ACTIONS ---
  const handleApproveCompany = (companyId: string) => {
    // Approve the company
    const updatedCompanies = companies.map(c => c.id === companyId ? { ...c, active: true } : c);
    onUpdateCompanies(updatedCompanies);

    // Auto-approve the company leader(s)
    const updatedUsers = users.map(u => 
      u.companyId === companyId && u.role === 'leader' ? { ...u, active: true } : u
    );
    onUpdateUsers(updatedUsers);
  };

  const handleToggleCompanyActive = (companyId: string) => {
    const updated = companies.map(c => c.id === companyId ? { ...c, active: !c.active } : c);
    onUpdateCompanies(updated);
  };

  const handleDeleteCompany = (companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    if (!company) return;
    if (window.confirm(`⚠️ CẢNH BÁO: Xóa công ty "${company.name}" sẽ xóa toàn bộ nhân viên, quy trình, biểu mẫu và văn bản thuộc công ty này. Hành động này không thể hoàn tác! Bạn có đồng ý xóa không?`)) {
      // Delete company
      const updatedCompanies = companies.filter(c => c.id !== companyId);
      onUpdateCompanies(updatedCompanies);

      // Delete company's users
      const updatedUsers = users.filter(u => u.companyId !== companyId);
      onUpdateUsers(updatedUsers);
    }
  };

  const handleCreateCompanyManually = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany.name.trim()) {
      alert('Vui lòng nhập tên doanh nghiệp.');
      return;
    }

    const companyId = `com_${Date.now()}`;
    const addedCompany: Company = {
      id: companyId,
      name: newCompany.name.trim(),
      taxCode: newCompany.taxCode.trim(),
      description: newCompany.description.trim() || 'Doanh nghiệp liên kết',
      active: true // Active immediately when created by System Admin
    };

    onUpdateCompanies([...companies, addedCompany]);
    setNewCompany({ name: '', taxCode: '', description: '' });
    setShowAddCompany(false);
  };

  // --- REGULAR ACTIONS (USER MANAGEMENT) ---
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name.trim() || !newUser.email.trim() || !newUser.department.trim()) {
      alert('Vui lòng điền đầy đủ thông tin nhân sự.');
      return;
    }

    const emailExists = users.some(u => u.email.toLowerCase() === newUser.email.toLowerCase().trim());
    if (emailExists) {
      alert('Email này đã được sử dụng trên hệ thống.');
      return;
    }

    const created: User = {
      id: `usr_${Date.now()}`,
      name: newUser.name.trim(),
      email: newUser.email.trim(),
      role: newUser.role,
      department: newUser.department.trim(),
      active: true, // Created manually by Leader, active immediately
      companyId: currentUser.companyId,
      companyName: currentUser.companyName,
      signatureCode: newUser.role !== 'staff' ? newUser.signatureCode.trim() || `SIG-NEW-${Math.floor(Math.random() * 9000) + 1000}` : undefined
    };

    onUpdateUsers([...users, created]);
    setNewUser({ name: '', email: '', role: 'staff', department: 'Hành chính Nhân sự', signatureCode: '' });
    setShowAddUser(false);
  };

  const handleApproveUser = (userId: string) => {
    const updated = users.map(u => u.id === userId ? { ...u, active: true } : u);
    onUpdateUsers(updated);
  };

  const handleRejectOrDeleteUser = (userId: string) => {
    if (window.confirm('Bạn có chắc muốn từ chối hoặc xóa tài khoản này khỏi hệ thống?')) {
      const updated = users.filter(u => u.id !== userId);
      onUpdateUsers(updated);
    }
  };

  const toggleUserActive = (id: string) => {
    const updated = users.map(u => u.id === id ? { ...u, active: !u.active } : u);
    onUpdateUsers(updated);
  };

  const updateUserRole = (id: string, newRole: Role) => {
    const updated = users.map(u => {
      if (u.id === id) {
        const sigCode = newRole !== 'staff' ? u.signatureCode || `SIG-UPD-${Math.floor(Math.random() * 9000) + 1000}` : undefined;
        return { ...u, role: newRole, signatureCode: sigCode };
      }
      return u;
    });
    onUpdateUsers(updated);
  };

  // --- WORKFLOW BUILDERS ---
  const handleAddStepToWorkflow = () => {
    if (!newStep.label.trim()) {
      alert('Vui lòng điền Tên bước duyệt.');
      return;
    }
    const stepNum = newWorkflow.steps.length + 1;
    const assignedUser = users.find(u => u.id === newStep.userId && u.companyId === currentUser.companyId);

    const addedStep: WorkflowStepConfig = {
      stepNumber: stepNum,
      label: newStep.label.trim(),
      role: newStep.role,
      userId: newStep.userId || undefined,
      userName: assignedUser?.name
    };

    setNewWorkflow(prev => ({
      ...prev,
      steps: [...prev.steps, addedStep]
    }));

    setNewStep({ label: '', role: 'approver', userId: '' });
  };

  const handleCreateWorkflow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkflow.name.trim() || newWorkflow.steps.length === 0) {
      alert('Vui lòng nhập tên quy trình và thêm tối thiểu 1 bước ký duyệt.');
      return;
    }

    const created: WorkflowConfig = {
      id: `wf_${Date.now()}`,
      name: newWorkflow.name.trim(),
      description: newWorkflow.description.trim(),
      steps: newWorkflow.steps,
      companyId: currentUser.companyId
    };

    onUpdateWorkflows([...workflows, created]);
    setNewWorkflow({ name: '', description: '', steps: [] });
    setShowAddWorkflow(false);
  };

  const removeWorkflow = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa quy trình phê duyệt này?')) {
      onUpdateWorkflows(workflows.filter(w => w.id !== id));
    }
  };

  // --- TEMPLATE BUILDERS ---
  const handleAddFieldToTemplate = () => {
    if (!newField.id.trim() || !newField.label.trim()) {
      alert('Vui lòng điền mã ID trường và Nhãn hiển thị.');
      return;
    }
    setNewTemplate(prev => ({
      ...prev,
      requiredFields: [...prev.requiredFields, { ...newField, id: newField.id.trim(), label: newField.label.trim() }]
    }));
    setNewField({ id: '', label: '', type: 'text', placeholder: '' });
  };

  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplate.title.trim() || !newTemplate.content.trim()) {
      alert('Tiêu đề mẫu và Khung nội dung không được để trống.');
      return;
    }

    const created: DocumentTemplate = {
      id: `tpl_${Date.now()}`,
      title: newTemplate.title.trim(),
      category: newTemplate.category,
      description: newTemplate.description.trim(),
      content: newTemplate.content,
      requiredFields: newTemplate.requiredFields,
      companyId: currentUser.companyId
    };

    onUpdateTemplates([...templates, created]);
    setNewTemplate({ title: '', category: 'Văn bản Pháp lý', description: '', content: '', requiredFields: [] });
    setShowAddTemplate(false);
  };

  const removeTemplate = (id: string) => {
    if (window.confirm('Xóa mẫu văn bản này có thể ảnh hưởng đến lịch sử lập trình duyệt. Bạn vẫn muốn tiếp tục?')) {
      onUpdateTemplates(templates.filter(t => t.id !== id));
    }
  };

  // --- RENDER COMPILING & SCOPING ---
  // System-wide lists (filtered)
  const filteredUsers = users.filter(u => {
    if (u.role === 'admin') return false; // Hide platform admin from user list management
    const matchSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchCompany = companyFilter === 'all' || u.companyId === companyFilter;
    return matchSearch && matchCompany;
  });

  // Company-specific lists (for Leaders)
  const companyUsers = users.filter(u => u.companyId === currentUser.companyId);
  const companyTemplates = templates.filter(t => t.companyId === currentUser.companyId);
  const companyWorkflows = workflows.filter(w => w.companyId === currentUser.companyId);

  const activeMembers = companyUsers.filter(u => u.active === true);
  const pendingMembers = companyUsers.filter(u => u.active === false);

  return (
    <div className="bg-white rounded-xl border border-gray-150 shadow-xs overflow-hidden" id="admin-panel-control-center">
      
      {/* 1. SYSTEM ADMIN VIEW (PLATFORM level) */}
      {isSystemAdmin ? (
        <div>
          {/* Header */}
          <div className="bg-slate-900 text-white px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-extrabold flex items-center gap-2 uppercase tracking-tight">
                <Shield className="w-4 h-4 text-indigo-400 animate-pulse" />
                Hệ thống Quản trị Website (Platform Admin)
              </h2>
              <p className="text-xxs text-slate-300 mt-1 font-medium">Phê duyệt Doanh nghiệp, Cấp phép vận hành và Kiểm soát Nhân sự liên kết toàn nền tảng.</p>
            </div>

            <div className="flex bg-slate-800 p-1 rounded-lg self-start sm:self-auto border border-slate-750">
              <button
                onClick={() => setSystemTab('companies')}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  systemTab === 'companies' ? 'bg-indigo-600 text-white shadow-xxs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                Duyệt Doanh Nghiệp
                {companies.some(c => c.active === false) && (
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                )}
              </button>
              <button
                onClick={() => setSystemTab('all_users')}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  systemTab === 'all_users' ? 'bg-indigo-600 text-white shadow-xxs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Quản lý Cán bộ
                {users.some(u => !u.active && u.companyId !== 'system') && (
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                )}
              </button>
            </div>
          </div>

          <div className="p-6">
            
            {/* TAB: COMPANIES MANAGEMENT */}
            {systemTab === 'companies' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">Danh sách Doanh nghiệp thành viên</h3>
                    <p className="text-xxs text-gray-400 mt-0.5">Phê duyệt hoặc tạm ngưng các đơn vị đăng ký sử dụng giải pháp ký số.</p>
                  </div>
                  <button
                    onClick={() => setShowAddCompany(!showAddCompany)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Khai báo Doanh nghiệp mới
                  </button>
                </div>

                {/* Create Company Manually Form */}
                {showAddCompany && (
                  <form onSubmit={handleCreateCompanyManually} className="bg-slate-50 border border-slate-200 p-4.5 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-4 animate-slide-down">
                    <div className="flex flex-col gap-1 text-xs">
                      <label className="font-semibold text-gray-700" htmlFor="sys-company-name">Tên doanh nghiệp / Công ty:</label>
                      <input
                        id="sys-company-name"
                        type="text"
                        required
                        value={newCompany.name}
                        onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                        placeholder="Ví dụ: Công ty Cổ phần TechWorld"
                        className="bg-white border border-gray-300 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="flex flex-col gap-1 text-xs">
                      <label className="font-semibold text-gray-700" htmlFor="sys-company-tax">Mã số thuế:</label>
                      <input
                        id="sys-company-tax"
                        type="text"
                        value={newCompany.taxCode}
                        onChange={(e) => setNewCompany({ ...newCompany, taxCode: e.target.value })}
                        placeholder="010xxxxxxxx"
                        className="bg-white border border-gray-300 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="flex flex-col gap-1 text-xs">
                      <label className="font-semibold text-gray-700" htmlFor="sys-company-desc">Lĩnh vực hoạt động:</label>
                      <input
                        id="sys-company-desc"
                        type="text"
                        value={newCompany.description}
                        onChange={(e) => setNewCompany({ ...newCompany, description: e.target.value })}
                        placeholder="Ví dụ: Phần mềm, Công nghệ, Bán lẻ"
                        className="bg-white border border-gray-300 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="md:col-span-3 flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowAddCompany(false)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-xs px-4 py-1.5 rounded"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-1.5 rounded"
                      >
                        Kích hoạt Doanh nghiệp
                      </button>
                    </div>
                  </form>
                )}

                {/* Companies list table */}
                <div className="overflow-x-auto border border-gray-150 rounded-lg">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-xxs font-extrabold text-gray-500 uppercase border-b border-gray-150">
                        <th className="px-5 py-3">Mã đơn vị</th>
                        <th className="px-5 py-3">Tên Công ty / Mô tả</th>
                        <th className="px-5 py-3">Mã số thuế</th>
                        <th className="px-5 py-3">Trạng thái vận hành</th>
                        <th className="px-5 py-3 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-150 text-xs text-gray-600">
                      {companies.filter(c => c.id !== 'system').map(com => (
                        <tr key={com.id} className="hover:bg-indigo-50/10 transition-colors">
                          <td className="px-5 py-3.5 font-mono text-xxs text-indigo-700 font-bold">{com.id}</td>
                          <td className="px-5 py-3.5">
                            <h4 className="font-bold text-gray-800 text-xs flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              {com.name}
                            </h4>
                            <p className="text-[10px] text-gray-400 font-medium mt-0.5">{com.description}</p>
                          </td>
                          <td className="px-5 py-3.5 font-mono font-semibold text-gray-500">{com.taxCode || 'Chưa cung cấp'}</td>
                          <td className="px-5 py-3.5">
                            {com.active !== false ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-[10px]">
                                ● ĐANG HOẠT ĐỘNG
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-bold text-[10px] animate-pulse">
                                ⏳ CHỜ PHÊ DUYỆT
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-right space-x-2">
                            {com.active === false ? (
                              <button
                                onClick={() => handleApproveCompany(com.id)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xxs px-2.5 py-1.5 rounded transition-colors inline-flex items-center gap-1 cursor-pointer"
                              >
                                <CheckCircle className="w-3 h-3" />
                                Phê duyệt & Cấp phép
                              </button>
                            ) : (
                              <button
                                onClick={() => handleToggleCompanyActive(com.id)}
                                className="bg-slate-100 hover:bg-amber-50 border border-slate-200 hover:border-amber-200 text-slate-700 hover:text-amber-800 font-semibold text-xxs px-2.5 py-1.5 rounded transition-colors inline-flex items-center gap-1 cursor-pointer"
                              >
                                <XCircle className="w-3 h-3 text-amber-600" />
                                Tạm khóa
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteCompany(com.id)}
                              className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-750 font-bold text-xxs px-2.5 py-1.5 rounded transition-colors inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                              Xóa đơn vị
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: SYSTEM-WIDE PERSONNEL */}
            {systemTab === 'all_users' && (
              <div className="space-y-6 animate-slide-down">
                <div>
                  <h3 className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">Danh sách Nhân sự liên kết toàn trang web</h3>
                  <p className="text-xxs text-gray-400 mt-0.5">Kiểm soát tất cả các cán bộ, giám đốc, thẩm định viên và nhân viên đăng ký tài khoản trên nền tảng.</p>
                </div>

                {/* Filters Row */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm theo tên hoặc email cán bộ..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full text-xs bg-gray-50 border border-gray-300 rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="sm:w-64">
                    <select
                      value={companyFilter}
                      onChange={(e) => setCompanyFilter(e.target.value)}
                      className="w-full text-xs bg-gray-50 border border-gray-300 rounded-lg p-2 font-bold text-gray-700 focus:outline-none"
                    >
                      <option value="all">-- Lọc theo doanh nghiệp --</option>
                      {companies.filter(c => c.id !== 'system').map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Table of Users */}
                <div className="overflow-x-auto border border-gray-150 rounded-lg">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-xxs font-extrabold text-gray-500 uppercase border-b border-gray-150">
                        <th className="px-5 py-3">Họ tên & Email</th>
                        <th className="px-5 py-3">Công ty trực thuộc</th>
                        <th className="px-5 py-3">Phòng ban</th>
                        <th className="px-5 py-3">Vai trò chức vụ</th>
                        <th className="px-5 py-3">Trạng thái tài khoản</th>
                        <th className="px-5 py-3 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-150 text-xs text-gray-600">
                      {filteredUsers.map(u => (
                        <tr key={u.id} className="hover:bg-indigo-50/10 transition-colors">
                          <td className="px-5 py-3.5">
                            <h4 className="font-extrabold text-gray-800">{u.name}</h4>
                            <span className="text-xxs text-gray-400 font-mono font-medium block mt-0.5">{u.email}</span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="font-bold text-gray-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[10px]">
                              {u.companyName}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 font-semibold text-gray-600">{u.department}</td>
                          <td className="px-5 py-3.5">
                            <span className={`px-2 py-0.5 rounded font-black text-[9px] uppercase border ${
                              u.role === 'leader' 
                                ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                                : u.role === 'approver' 
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                                : 'bg-slate-50 border-slate-200 text-slate-700'
                            }`}>
                              {u.role === 'leader' ? 'Giám đốc' : u.role === 'approver' ? 'Thẩm định' : 'Nhân viên'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            {u.active ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-extrabold text-[10px]">
                                ● Hoạt động
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-extrabold text-[10px]">
                                ⏳ Chờ duyệt
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-right space-x-2">
                            {!u.active ? (
                              <button
                                onClick={() => handleApproveUser(u.id)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xxs px-2 py-1 rounded"
                              >
                                Duyệt ngay
                              </button>
                            ) : (
                              <button
                                onClick={() => toggleUserActive(u.id)}
                                className="bg-gray-100 hover:bg-rose-50 hover:text-rose-700 text-gray-600 font-semibold text-xxs px-2 py-1 rounded border border-gray-200 hover:border-rose-200"
                              >
                                Khóa tài khoản
                              </button>
                            )}
                            <button
                              onClick={() => handleRejectOrDeleteUser(u.id)}
                              className="text-rose-600 hover:text-rose-800 hover:bg-rose-50 p-1.5 rounded transition-colors inline-block"
                              title="Xóa tài khoản"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}

                      {filteredUsers.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-xs text-gray-400 font-semibold">
                            Không tìm thấy tài khoản nhân sự nào thỏa mãn bộ lọc.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* 2. COMPANY LEADER VIEW (COMPANY level) */
        <div>
          {/* Header */}
          <div className="bg-slate-800 text-white px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-extrabold flex items-center gap-2 uppercase tracking-tight">
                <Building2 className="w-4 h-4 text-emerald-400" />
                Quản trị Nội bộ Doanh nghiệp
              </h2>
              <p className="text-xxs text-slate-300 mt-1 font-medium">Thiết lập quy trình duyệt, biểu mẫu chuẩn hóa và phê duyệt tài khoản nhân sự thuộc <strong>{currentUser.companyName}</strong>.</p>
            </div>

            <div className="flex bg-slate-900 p-1 rounded-lg self-start sm:self-auto border border-slate-750">
              <button
                onClick={() => setLeaderTab('company_users')}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  leaderTab === 'company_users' ? 'bg-indigo-600 text-white shadow-xxs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Cán bộ nội bộ
                {pendingMembers.length > 0 && (
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                )}
              </button>
              <button
                onClick={() => setLeaderTab('workflows')}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  leaderTab === 'workflows' ? 'bg-indigo-600 text-white shadow-xxs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Settings2 className="w-3.5 h-3.5" />
                Luồng ký duyệt
              </button>
              <button
                onClick={() => setLeaderTab('templates')}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  leaderTab === 'templates' ? 'bg-indigo-600 text-white shadow-xxs' : 'text-slate-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Biểu mẫu mẫu
              </button>
            </div>
          </div>

          <div className="p-6">
            
            {/* TAB: COMPANY USERS & APPROVAL */}
            {leaderTab === 'company_users' && (
              <div className="space-y-6">
                
                {/* Pending members section */}
                {pendingMembers.length > 0 && (
                  <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-5 space-y-3.5 animate-slide-down">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-amber-500 text-white rounded-lg">
                        <UserPlus className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-black text-amber-900 uppercase tracking-wide flex items-center gap-1.5">
                          Yêu cầu đăng ký tài khoản chờ duyệt
                          <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse">
                            {pendingMembers.length} mới
                          </span>
                        </h3>
                        <p className="text-[10px] text-amber-700 font-medium">Nhân sự dưới đây vừa đăng ký tài khoản tại doanh nghiệp của bạn. Hãy phê duyệt để kích hoạt tài khoản cho họ.</p>
                      </div>
                    </div>

                    <div className="overflow-x-auto border border-amber-200 bg-white rounded-lg">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-amber-50/50 text-xxs font-extrabold text-amber-800 uppercase border-b border-amber-150">
                            <th className="px-4 py-2.5">Họ tên & Email</th>
                            <th className="px-4 py-2.5">Phòng ban đề xuất</th>
                            <th className="px-4 py-2.5">Vai trò chức vụ</th>
                            <th className="px-4 py-2.5 text-right">Thao tác phê duyệt</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-150 text-xs text-gray-700">
                          {pendingMembers.map(u => (
                            <tr key={u.id} className="hover:bg-amber-50/20 transition-colors">
                              <td className="px-4 py-3 font-bold text-gray-800">
                                {u.name}
                                <span className="block text-[10px] text-gray-500 font-normal font-mono">{u.email}</span>
                              </td>
                              <td className="px-4 py-3 font-semibold text-gray-600">{u.department}</td>
                              <td className="px-4 py-3">
                                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px] uppercase border border-amber-200">
                                  {u.role === 'staff' ? 'Chuyên viên soạn thảo' : u.role === 'approver' ? 'Người thẩm định' : 'Lãnh đạo'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right space-x-2">
                                <button
                                  onClick={() => handleApproveUser(u.id)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xxs px-3 py-1.5 rounded transition-colors inline-flex items-center gap-1 cursor-pointer shadow-xxs"
                                >
                                  <CheckCircle className="w-3 h-3" />
                                  Duyệt kích hoạt
                                </button>
                                <button
                                  onClick={() => handleRejectOrDeleteUser(u.id)}
                                  className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xxs px-3 py-1.5 rounded transition-colors inline-flex items-center gap-1 cursor-pointer"
                                >
                                  <XCircle className="w-3 h-3" />
                                  Từ chối
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Active members header */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">Nhân sự chính thức của Công ty</h3>
                    <p className="text-xxs text-gray-400 mt-0.5">Danh sách toàn bộ các thành viên chính thức được phép hoạt động nội bộ.</p>
                  </div>
                  <button
                    onClick={() => setShowAddUser(!showAddUser)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm cán bộ mới
                  </button>
                </div>

                {/* Form Add User manually by Leader */}
                {showAddUser && (
                  <form onSubmit={handleCreateUser} className="bg-slate-50 border border-slate-200 p-4.5 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-4 animate-slide-down">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-700" htmlFor="admin-new-user-name">Họ và tên:</label>
                      <input
                        id="admin-new-user-name"
                        type="text"
                        required
                        value={newUser.name}
                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                        placeholder="Ví dụ: Hoàng Văn Nam"
                        className="bg-white border border-gray-300 rounded p-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-700" htmlFor="admin-new-user-email">Email công vụ:</label>
                      <input
                        id="admin-new-user-email"
                        type="email"
                        required
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        placeholder="namhv@company.com"
                        className="bg-white border border-gray-300 rounded p-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-700" htmlFor="admin-new-user-dept">Phòng ban công tác:</label>
                      <select
                        id="admin-new-user-dept"
                        value={newUser.department}
                        onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                        className="bg-white border border-gray-300 rounded p-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-gray-700"
                      >
                        <option value="Hành chính Nhân sự">Hành chính Nhân sự</option>
                        <option value="Kỹ thuật Công nghệ">Kỹ thuật Công nghệ</option>
                        <option value="Phòng Kế hoạch">Phòng Kế hoạch</option>
                        <option value="Ban Giám đốc">Ban Giám đốc</option>
                        <option value="Ban Điều hành">Ban Điều hành</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-700" htmlFor="admin-new-user-role">Vai trò chính (RBAC):</label>
                      <select
                        id="admin-new-user-role"
                        value={newUser.role}
                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value as Role })}
                        className="bg-white border border-gray-300 rounded p-1.5 text-xs font-bold text-gray-700"
                      >
                        <option value="staff">Nhân viên soạn thảo</option>
                        <option value="approver">Người phê duyệt thẩm định</option>
                        <option value="leader">Lãnh đạo doanh nghiệp (Ký số)</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-gray-700" htmlFor="admin-new-user-sig">Mã định danh Ký số (CA):</label>
                      <input
                        id="admin-new-user-sig"
                        type="text"
                        value={newUser.signatureCode}
                        onChange={(e) => setNewUser({ ...newUser, signatureCode: e.target.value })}
                        placeholder="Tự sinh nếu để trống"
                        disabled={newUser.role === 'staff'}
                        className="bg-white border border-gray-300 rounded p-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
                      />
                    </div>

                    <div className="flex items-end">
                      <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 rounded transition-colors cursor-pointer shadow-xxs"
                      >
                        Kích hoạt & Lưu nhân sự
                      </button>
                    </div>
                  </form>
                )}

                {/* Active users table */}
                <div className="overflow-x-auto border border-gray-150 rounded-lg">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-xxs font-extrabold text-gray-500 uppercase border-b border-gray-150">
                        <th className="px-5 py-3">Họ tên / Email</th>
                        <th className="px-5 py-3">Phòng ban</th>
                        <th className="px-5 py-3">Chức vụ vai trò</th>
                        <th className="px-5 py-3">Khóa chứng thư số CA</th>
                        <th className="px-5 py-3 text-right">Trạng thái / Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-150 text-xs text-gray-600">
                      {activeMembers.map(u => (
                        <tr key={u.id} className="hover:bg-emerald-50/5 transition-colors">
                          <td className="px-5 py-3.5 font-bold text-gray-800">
                            {u.name} {u.id === currentUser.id && <span className="text-[9px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-black ml-1.5">BẠN</span>}
                            <span className="block text-xxs text-gray-400 font-normal font-mono mt-0.5">{u.email}</span>
                          </td>
                          <td className="px-5 py-3.5 font-semibold text-gray-600">{u.department}</td>
                          <td className="px-5 py-3.5">
                            <select
                              value={u.role}
                              onChange={(e) => updateUserRole(u.id, e.target.value as Role)}
                              disabled={u.id === currentUser.id} // Cannot change yourself
                              className="bg-gray-50 border border-gray-200 text-xxs font-bold text-gray-700 rounded px-2 py-1 cursor-pointer disabled:opacity-60"
                            >
                              <option value="staff">Nhân viên soạn thảo</option>
                              <option value="approver">Người phê duyệt</option>
                              <option value="leader">Ban lãnh đạo</option>
                            </select>
                          </td>
                          <td className="px-5 py-3.5">
                            {u.signatureCode ? (
                              <span className="text-emerald-700 bg-emerald-50 border border-emerald-150 px-2.5 py-0.5 rounded flex items-center gap-1 w-fit font-mono text-xxs font-bold">
                                <Award className="w-3.5 h-3.5" />
                                {u.signatureCode}
                              </span>
                            ) : (
                              <span className="text-gray-400 italic font-semibold text-[10px]">Chưa cấu hình</span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-right space-x-2">
                            <button
                              onClick={() => toggleUserActive(u.id)}
                              disabled={u.id === currentUser.id}
                              className={`text-[10px] font-bold px-2.5 py-1 rounded transition-colors cursor-pointer disabled:opacity-50 ${
                                u.active 
                                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100' 
                                  : 'bg-rose-50 border border-rose-200 text-rose-800 hover:bg-rose-100'
                              }`}
                            >
                              {u.active ? '● Hoạt động' : '○ Đang khóa'}
                            </button>
                            <button
                              onClick={() => handleRejectOrDeleteUser(u.id)}
                              disabled={u.id === currentUser.id}
                              className="text-gray-400 hover:text-rose-600 p-1.5 rounded transition-colors inline-block disabled:opacity-30"
                              title="Xóa cán bộ"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: WORKFLOWS */}
            {leaderTab === 'workflows' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">Quy trình luân chuyển văn bản</h3>
                    <p className="text-xxs text-gray-400 mt-0.5">Quyết định thứ tự thẩm định và ký số chữ ký điện tử cho công ty.</p>
                  </div>
                  <button
                    onClick={() => setShowAddWorkflow(!showAddWorkflow)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Thiết kế quy trình mới
                  </button>
                </div>

                {/* Workflow Builder */}
                {showAddWorkflow && (
                  <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-4 animate-slide-down">
                    <h4 className="text-xs font-bold text-gray-800 uppercase">Trình thiết kế quy trình đồ họa</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5 text-xs">
                        <label className="font-semibold text-gray-700" htmlFor="admin-new-wf-name">Tên quy trình:</label>
                        <input
                          id="admin-new-wf-name"
                          type="text"
                          placeholder="Ví dụ: Quy trình Phê duyệt Kế hoạch Kinh doanh"
                          value={newWorkflow.name}
                          onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
                          className="bg-white border border-gray-300 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5 text-xs">
                        <label className="font-semibold text-gray-700" htmlFor="admin-new-wf-desc">Mô tả tóm tắt:</label>
                        <input
                          id="admin-new-wf-desc"
                          type="text"
                          placeholder="Quy trình dành cho thẩm định quyết định kinh doanh..."
                          value={newWorkflow.description}
                          onChange={(e) => setNewWorkflow({ ...newWorkflow, description: e.target.value })}
                          className="bg-white border border-gray-300 rounded p-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    {/* Adding Steps */}
                    <div className="bg-white p-3.5 border border-gray-200 rounded-lg space-y-3">
                      <span className="text-xxs font-bold text-indigo-800 uppercase block">Thêm bước phê duyệt tuần tự:</span>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                        <div className="flex flex-col gap-1 text-xxs">
                          <label className="font-bold text-gray-600" htmlFor="admin-step-label-input">Tên bước (Hành động):</label>
                          <input
                            id="admin-step-label-input"
                            type="text"
                            placeholder="Ví dụ: Kiểm tra ngân sách"
                            value={newStep.label}
                            onChange={(e) => setNewStep({ ...newStep, label: e.target.value })}
                            className="bg-gray-50 border border-gray-300 p-1.5 rounded focus:outline-none"
                          />
                        </div>

                        <div className="flex flex-col gap-1 text-xxs">
                          <label className="font-bold text-gray-600" htmlFor="admin-step-role-select">Vai trò phê duyệt:</label>
                          <select
                            id="admin-step-role-select"
                            value={newStep.role}
                            onChange={(e) => setNewStep({ ...newStep, role: e.target.value as Role })}
                            className="bg-gray-50 border border-gray-300 p-1.5 rounded font-medium text-gray-700 focus:outline-none"
                          >
                            <option value="approver">Người phê duyệt thẩm định</option>
                            <option value="leader">Giám đốc (Ký số điện tử)</option>
                          </select>
                        </div>

                        <div className="flex flex-col gap-1 text-xxs">
                          <label className="font-bold text-gray-600" htmlFor="admin-step-assign-select">Gán đích danh tài khoản:</label>
                          <select
                            id="admin-step-assign-select"
                            value={newStep.userId}
                            onChange={(e) => setNewStep({ ...newStep, userId: e.target.value })}
                            className="bg-gray-50 border border-gray-300 p-1.5 rounded font-medium text-gray-700 focus:outline-none"
                          >
                            <option value="">-- Mặc định theo vai trò --</option>
                            {companyUsers.filter(u => u.role !== 'staff' && u.active).map(u => (
                              <option key={u.id} value={u.id}>{u.name} ({u.department})</option>
                            ))}
                          </select>
                        </div>

                        <button
                          type="button"
                          onClick={handleAddStepToWorkflow}
                          className="bg-indigo-50 border border-indigo-200 text-indigo-700 text-xxs font-bold py-2 rounded hover:bg-indigo-100 transition-colors cursor-pointer"
                        >
                          + Thêm bước này
                        </button>
                      </div>

                      {/* Visual Steps */}
                      {newWorkflow.steps.length > 0 && (
                        <div className="pt-2 border-t border-gray-150 space-y-2">
                          <span className="text-[10px] font-bold text-gray-500 uppercase block">Cấu trúc các bước ký duyệt ({newWorkflow.steps.length}):</span>
                          <div className="flex flex-wrap items-center gap-2">
                            {newWorkflow.steps.map((step, index) => (
                              <div key={index} className="flex items-center gap-1.5 text-xxs bg-indigo-50 border border-indigo-150 px-2 py-1 rounded-md">
                                <span className="font-black text-indigo-700">{step.stepNumber}.</span>
                                <span className="font-bold text-gray-700">{step.label}</span>
                                <span className="text-gray-400">({step.userName || step.role.toUpperCase()})</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setNewWorkflow({ name: '', description: '', steps: [] });
                          setShowAddWorkflow(false);
                        }}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-xs px-4 py-1.5 rounded"
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        onClick={handleCreateWorkflow}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-1.5 rounded"
                      >
                        Lưu cấu hình quy trình
                      </button>
                    </div>
                  </div>
                )}

                {/* List workflows */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {companyWorkflows.map(wf => (
                    <div key={wf.id} className="border border-gray-150 bg-white rounded-xl p-4.5 space-y-3.5 hover:shadow-xs transition-shadow relative">
                      <button
                        onClick={() => removeWorkflow(wf.id)}
                        className="absolute right-4 top-4 text-gray-400 hover:text-rose-500 cursor-pointer"
                        title="Xóa luồng quy trình"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-gray-800">{wf.name}</h4>
                        <p className="text-xxs text-gray-400 line-clamp-2">{wf.description || 'Không có mô tả quy trình.'}</p>
                      </div>

                      {/* Flow steps order list */}
                      <div className="bg-slate-50 p-2.5 border border-gray-100 rounded-lg space-y-1.5 text-xxs">
                        <span className="font-bold text-gray-500 uppercase block">Thứ tự ký duyệt:</span>
                        <div className="space-y-1">
                          {wf.steps.map((step, idx) => (
                            <div key={idx} className="flex items-center gap-1.5">
                              <span className="w-3.5 h-3.5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[8px] shrink-0">
                                {step.stepNumber}
                              </span>
                              <span className="font-semibold text-gray-700 truncate">{step.label}</span>
                              <span className="text-gray-400 shrink-0">({step.userName || (step.role === 'leader' ? 'GIÁM ĐỐC' : 'THẨM ĐỊNH')})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}

                  {companyWorkflows.length === 0 && (
                    <div className="col-span-3 text-center py-8 text-xs text-gray-400 font-medium">
                      Chưa thiết lập quy trình duyệt nào. Hãy nhấn nút phía trên để bắt đầu khởi tạo.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: TEMPLATES */}
            {leaderTab === 'templates' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">Thư viện biểu mẫu chuẩn hóa</h3>
                    <p className="text-xxs text-gray-400 mt-0.5">Xây dựng các biểu mẫu để nhân viên soạn thảo nhanh chóng, thống nhất thể thức.</p>
                  </div>
                  <button
                    onClick={() => setShowAddTemplate(!showAddTemplate)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Thiết lập Mẫu mới
                  </button>
                </div>

                {/* Add Template */}
                {showAddTemplate && (
                  <form onSubmit={handleCreateTemplate} className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-4 animate-slide-down">
                    <h4 className="text-xs font-bold text-gray-800 uppercase">Khai báo biểu mẫu chuẩn</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex flex-col gap-1.5 text-xs">
                        <label className="font-semibold text-gray-700" htmlFor="admin-new-tpl-title">Tiêu đề mẫu văn bản:</label>
                        <input
                          id="admin-new-tpl-title"
                          type="text"
                          required
                          placeholder="Ví dụ: Tờ trình đề xuất Mua sắm Thiết bị"
                          value={newTemplate.title}
                          onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })}
                          className="bg-white border border-gray-300 rounded p-1.5 focus:outline-none"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5 text-xs">
                        <label className="font-semibold text-gray-700" htmlFor="admin-new-tpl-cat">Danh mục phân nhóm:</label>
                        <select
                          id="admin-new-tpl-cat"
                          value={newTemplate.category}
                          onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                          className="bg-white border border-gray-300 rounded p-1.5 font-medium text-gray-700 focus:outline-none"
                        >
                          <option value="Văn bản Pháp lý">Văn bản Pháp lý</option>
                          <option value="Tờ trình đề xuất">Tờ trình đề xuất</option>
                          <option value="Quyết định nội bộ">Quyết định nội bộ</option>
                          <option value="Hành chính - Nhân sự">Hành chính - Nhân sự</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1.5 text-xs">
                        <label className="font-semibold text-gray-700" htmlFor="admin-new-tpl-desc">Mô tả mục đích:</label>
                        <input
                          id="admin-new-tpl-desc"
                          type="text"
                          placeholder="Dùng khi nhân viên cần đề xuất mua sắm công cụ dụng cụ..."
                          value={newTemplate.description}
                          onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                          className="bg-white border border-gray-300 rounded p-1.5 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 text-xs">
                      <label className="font-semibold text-gray-700" htmlFor="admin-new-tpl-content">Nội dung mẫu văn bản gốc (Dạng Markdown):</label>
                      <textarea
                        id="admin-new-tpl-content"
                        rows={4}
                        placeholder="### ĐỀ XUẤT MUA SẮM THIẾT BỊ&#10;Kính gửi: Ban Giám Đốc&#10;&#10;Tôi tên là: {NguoiDeXuat}&#10;Nội dung đề xuất: {LyDoDeXuat}&#10;Kinh phí dự kiến: {KinhPhi} VNĐ..."
                        value={newTemplate.content}
                        onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                        className="bg-white border border-gray-300 rounded p-2 focus:outline-none font-mono text-xs leading-relaxed"
                      />
                      <p className="text-[10px] text-gray-400">Các tham số nằm trong ngoặc nhọn `{'{BienNoiDung}'}` sẽ tự động chuyển thành các trường nhập liệu khi soạn thảo.</p>
                    </div>

                    {/* Variables Form Builder */}
                    <div className="bg-white p-3.5 border border-gray-200 rounded-lg space-y-3">
                      <span className="text-xxs font-bold text-indigo-800 uppercase block">Thêm trường tham số nhập liệu động:</span>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                        <div className="flex flex-col gap-1 text-xxs">
                          <label className="font-bold text-gray-600" htmlFor="admin-field-id">Mã ID tham số (Khớp ngoặc nhọn):</label>
                          <input
                            id="admin-field-id"
                            type="text"
                            placeholder="Ví dụ: LyDoDeXuat"
                            value={newField.id}
                            onChange={(e) => setNewField({ ...newField, id: e.target.value })}
                            className="bg-gray-50 border border-gray-300 p-1.5 rounded focus:outline-none"
                          />
                        </div>

                        <div className="flex flex-col gap-1 text-xxs">
                          <label className="font-bold text-gray-600" htmlFor="admin-field-label">Nhãn hiển thị tiếng Việt:</label>
                          <input
                            id="admin-field-label"
                            type="text"
                            placeholder="Ví dụ: Lý do đề xuất"
                            value={newField.label}
                            onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                            className="bg-gray-50 border border-gray-300 p-1.5 rounded focus:outline-none"
                          />
                        </div>

                        <div className="flex flex-col gap-1 text-xxs">
                          <label className="font-bold text-gray-600" htmlFor="admin-field-type">Kiểu nhập liệu:</label>
                          <select
                            id="admin-field-type"
                            value={newField.type}
                            onChange={(e) => setNewField({ ...newField, type: e.target.value as any })}
                            className="bg-gray-50 border border-gray-300 p-1 rounded font-medium text-gray-700 focus:outline-none"
                          >
                            <option value="text">Chữ ngắn (Text)</option>
                            <option value="textarea">Đoạn văn dài (Textarea)</option>
                            <option value="date">Ngày tháng (Date)</option>
                            <option value="number">Số tiền / Số lượng (Number)</option>
                          </select>
                        </div>

                        <button
                          type="button"
                          onClick={handleAddFieldToTemplate}
                          className="bg-indigo-50 border border-indigo-200 text-indigo-700 text-xxs font-bold py-2 rounded hover:bg-indigo-100 transition-colors cursor-pointer"
                        >
                          + Thêm trường này
                        </button>
                      </div>

                      {/* Variables list */}
                      {newTemplate.requiredFields.length > 0 && (
                        <div className="pt-2 border-t border-gray-150 space-y-2">
                          <span className="text-[10px] font-bold text-gray-500 uppercase block">Danh sách biến động ({newTemplate.requiredFields.length}):</span>
                          <div className="flex flex-wrap items-center gap-2">
                            {newTemplate.requiredFields.map((field, index) => (
                              <div key={index} className="flex items-center gap-1.5 text-xxs bg-emerald-50 border border-emerald-150 px-2.5 py-1 rounded-md text-emerald-800">
                                <span className="font-black">id:</span>
                                <span className="font-mono text-gray-800 bg-white px-1 border border-gray-100 rounded">{field.id}</span>
                                <span className="text-gray-400">|</span>
                                <span className="font-bold">{field.label}</span>
                                <span className="text-[9px] text-gray-400">({field.type.toUpperCase()})</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setNewTemplate({ title: '', category: 'Văn bản Pháp lý', description: '', content: '', requiredFields: [] });
                          setShowAddTemplate(false);
                        }}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-xs px-4 py-1.5 rounded cursor-pointer"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-1.5 rounded shadow-xs cursor-pointer"
                      >
                        Lưu biểu mẫu chuẩn
                      </button>
                    </div>
                  </form>
                )}

                {/* List templates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {companyTemplates.map(tpl => (
                    <div key={tpl.id} className="border border-gray-150 bg-white rounded-xl p-4.5 space-y-3 hover:shadow-xs transition-all relative">
                      <button
                        onClick={() => removeTemplate(tpl.id)}
                        className="absolute right-4 top-4 text-gray-400 hover:text-rose-500 cursor-pointer"
                        title="Xóa mẫu văn bản"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="space-y-1">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-gray-600 font-bold text-[9px] uppercase">
                          {tpl.category}
                        </span>
                        <h4 className="text-xs font-bold text-gray-800 mt-1">{tpl.title}</h4>
                        <p className="text-xxs text-gray-400">{tpl.description || 'Không có mô tả chi tiết mẫu.'}</p>
                      </div>

                      <div className="border-t border-dashed border-gray-150 pt-3">
                        <span className="text-[10px] font-bold text-gray-500 block">Các trường cần nhập khi dùng mẫu này ({tpl.requiredFields.length}):</span>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {tpl.requiredFields.map(field => (
                            <span key={field.id} className="text-[9px] bg-slate-50 border border-gray-200 text-gray-600 px-2 py-0.5 rounded font-medium">
                              {field.label}
                            </span>
                          ))}
                          {tpl.requiredFields.length === 0 && (
                            <span className="text-[9px] text-gray-400 italic font-semibold">Tự do nhập nội dung</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {companyTemplates.length === 0 && (
                    <div className="col-span-2 text-center py-8 text-xs text-gray-400 font-medium">
                      Chưa khởi tạo mẫu biểu nào. Hãy nhấn nút phía trên để bắt đầu thêm mới.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
