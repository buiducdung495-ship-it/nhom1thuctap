import React, { useState, useEffect } from 'react';
import { User, DocumentTemplate, WorkflowConfig, Document, Attachment, LiveApprovalStep, ApprovalHistoryItem, Company } from './types';
import { initializeDatabase, saveToLocalStorage } from './data';
import DocumentSearch from './components/DocumentSearch';
import DocumentDrafting from './components/DocumentDrafting';
import DocumentReview from './components/DocumentReview';
import DashboardStats from './components/DashboardStats';
import AdminPanel from './components/AdminPanel';
import AuthPortal from './components/AuthPortal';
import { 
  FolderLock, 
  FileText, 
  PlusCircle, 
  TrendingUp, 
  Settings, 
  Briefcase, 
  Building2, 
  Layers, 
  AlertCircle, 
  CheckSquare, 
  Users, 
  Lock,
  Workflow,
  LogOut
} from 'lucide-react';

export default function App() {
  // Database States loaded from LocalStorage
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowConfig[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);

  // Application UI states
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'documents' | 'draft' | 'stats' | 'admin'>('documents');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'info'; text: string } | null>(null);

  // Initialize DB on component mount
  useEffect(() => {
    const db = initializeDatabase();
    setCompanies(db.companies || []);
    setUsers(db.users);
    setTemplates(db.templates);
    setWorkflows(db.workflows);
    setDocuments(db.documents);

    // Try to load last active user from local storage
    const savedUserId = localStorage.getItem('lastActiveUserId');
    if (savedUserId) {
      const found = db.users.find(u => u.id === savedUserId);
      if (found && found.active) {
        setCurrentUser(found);
        return;
      }
    }
    // Default to null so user registers or logs in deliberately
    setCurrentUser(null);
  }, []);

  // Sync state helpers to update React state & persist to LocalStorage
  const handleUpdateUsers = (updated: User[]) => {
    setUsers(updated);
    saveToLocalStorage('users', updated);
    // Sync current user state if they were edited
    if (currentUser) {
      const found = updated.find(u => u.id === currentUser.id);
      if (found) {
        setCurrentUser(found);
        if (!found.active) {
          // If deactivated, log them out
          handleLogout();
        }
      }
    }
    triggerAlert('success', 'Đã cập nhật cấu hình thành viên và phân quyền thành công.');
  };

  const handleUpdateTemplates = (updated: DocumentTemplate[]) => {
    setTemplates(updated);
    saveToLocalStorage('templates', updated);
    triggerAlert('success', 'Đã cập nhật thư viện mẫu văn bản trực quan thành công.');
  };

  const handleUpdateWorkflows = (updated: WorkflowConfig[]) => {
    setWorkflows(updated);
    saveToLocalStorage('workflows', updated);
    triggerAlert('success', 'Đã lưu cấu hình quy trình phê duyệt thành công.');
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('lastActiveUserId', user.id);
    setActiveTab(user.role === 'admin' ? 'admin' : 'documents');
    triggerAlert('success', `Chào mừng ${user.name} (${user.companyName}) đã đăng nhập thành công.`);
  };

  const handleUpdateCompanies = (updated: Company[]) => {
    setCompanies(updated);
    saveToLocalStorage('companies', updated);
    triggerAlert('success', 'Đã cập nhật danh sách và trạng thái doanh nghiệp thành công.');
  };

  const handleRegister = (newUser: User, newCompany?: Company) => {
    let updatedCompanies = [...companies];
    if (newCompany) {
      updatedCompanies = [...companies, newCompany];
      setCompanies(updatedCompanies);
      saveToLocalStorage('companies', updatedCompanies);
    }

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    saveToLocalStorage('users', updatedUsers);

    if (newCompany) {
      triggerAlert('info', `Đã gửi yêu cầu khai báo đơn vị "${newCompany.name}". Vui lòng chờ Admin trang web phê duyệt.`);
    } else {
      triggerAlert('info', `Đăng ký tài khoản thành công! Vui lòng chờ Giám đốc/Lãnh đạo của ${newUser.companyName} phê duyệt kích hoạt.`);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('lastActiveUserId');
    setSelectedDocument(null);
    setEditingDocument(null);
    triggerAlert('info', 'Đã đăng xuất tài khoản an toàn khỏi hệ thống.');
  };

  const triggerAlert = (type: 'success' | 'info', text: string) => {
    setAlertMessage({ type, text });
    setTimeout(() => {
      setAlertMessage(null);
    }, 4500);
  };

  // UC05: Gửi yêu cầu phê duyệt / Cập nhật
  const handleDocumentCreatedOrUpdated = (newDoc: Document) => {
    let updatedDocs: Document[];
    const isEdit = documents.some(d => d.id === newDoc.id);

    // Ensure companyId matches creator's companyId
    const secureDoc: Document = {
      ...newDoc,
      companyId: currentUser?.companyId || 'com_1'
    };

    if (isEdit) {
      updatedDocs = documents.map(d => d.id === secureDoc.id ? secureDoc : d);
      triggerAlert('success', `Đã cập nhật và tái trình duyệt văn bản thành công: ${secureDoc.title}`);
    } else {
      updatedDocs = [secureDoc, ...documents];
      triggerAlert('success', `Đã lập tài liệu và gửi phê duyệt tự động đến luồng: ${secureDoc.title}`);
    }

    setDocuments(updatedDocs);
    saveToLocalStorage('documents', updatedDocs);
    setEditingDocument(null);
    setActiveTab('documents');
  };

  // UC08 & UC09: Phê duyệt + Ký số điện tử
  const handleApproveDocument = (docId: string, comment: string, signatureCode: string) => {
    if (!currentUser) return;

    const updatedDocs = documents.map(doc => {
      if (doc.id !== docId) return doc;

      // Map steps and update current pending step
      const steps = doc.approvalSteps.map(step => {
        if (step.stepNumber === doc.currentStepNumber) {
          return {
            ...step,
            status: 'approved' as const,
            comment,
            signedAt: new Date().toISOString(),
            signatureCode
          };
        }
        return step;
      });

      const nextStepNumber = doc.currentStepNumber + 1;
      const isLastStep = nextStepNumber > doc.approvalSteps.length;
      const nextStep = steps.find(s => s.stepNumber === nextStepNumber);

      // If next step exists, change its status from 'waiting' to 'pending'
      if (nextStep) {
        nextStep.status = 'pending';
      }

      // Build Audit History item
      const historyItem: ApprovalHistoryItem = {
        timestamp: new Date().toISOString(),
        actor: currentUser.name,
        role: currentUser.role,
        action: 'approve',
        comment: comment || undefined,
        details: isLastStep 
          ? `Ký số phê duyệt hoàn thành. Văn bản được ban hành chính thức.` 
          : `Phê duyệt bước ${doc.currentStepNumber} (${doc.approvalSteps[doc.currentStepNumber - 1].label}) thành công. Chuyển sang bước kế tiếp.`
      };

      const docStatus = isLastStep ? ('approved' as const) : ('pending' as const);

      return {
        ...doc,
        status: docStatus,
        currentStepNumber: isLastStep ? doc.currentStepNumber : nextStepNumber,
        approvalSteps: steps,
        history: [...doc.history, historyItem],
        digitalSignature: isLastStep ? {
          signedBy: currentUser.name,
          signedAt: new Date().toISOString(),
          certificateCode: signatureCode
        } : undefined
      };
    });

    setDocuments(updatedDocs);
    saveToLocalStorage('documents', updatedDocs);

    const docName = documents.find(d => d.id === docId)?.title || '';
    triggerAlert('success', `Ký số phê duyệt thành công văn bản: ${docName}`);
    setSelectedDocument(null);
  };

  // UC07: Ghi chú / Yêu cầu sửa & UC08: Từ chối duyệt
  const handleRejectDocument = (docId: string, comment: string, isCorrectionRequired: boolean) => {
    if (!currentUser) return;

    const updatedDocs = documents.map(doc => {
      if (doc.id !== docId) return doc;

      // Update current step to rejected
      const steps = doc.approvalSteps.map(step => {
        if (step.stepNumber === doc.currentStepNumber) {
          return {
            ...step,
            status: 'rejected' as const,
            comment
          };
        }
        return step;
      });

      // Build Audit History item
      const historyItem: ApprovalHistoryItem = {
        timestamp: new Date().toISOString(),
        actor: currentUser.name,
        role: currentUser.role,
        action: isCorrectionRequired ? 'edit_request' : 'reject',
        comment,
        details: isCorrectionRequired 
          ? `Yêu cầu chỉnh sửa nội dung và gửi trả lại hồ sơ về phòng nhân sự.` 
          : `Từ chối thẳng hồ sơ trình duyệt.`
      };

      const docStatus = isCorrectionRequired ? ('editing_required' as const) : ('rejected' as const);

      return {
        ...doc,
        status: docStatus,
        approvalSteps: steps,
        history: [...doc.history, historyItem]
      };
    });

    setDocuments(updatedDocs);
    saveToLocalStorage('documents', updatedDocs);

    const docName = documents.find(d => d.id === docId)?.title || '';
    triggerAlert('info', isCorrectionRequired 
      ? `Đã gửi yêu cầu hiệu chỉnh văn bản: ${docName}` 
      : `Đã từ chối phê duyệt văn bản: ${docName}`
    );
    setSelectedDocument(null);
  };

  // UC10: Ủy quyền phê duyệt
  const handleDelegateDocument = (docId: string, delegatedUserId: string, comment: string) => {
    if (!currentUser) return;

    const delegatedUser = users.find(u => u.id === delegatedUserId);
    if (!delegatedUser) return;

    const updatedDocs = documents.map(doc => {
      if (doc.id !== docId) return doc;

      // Update active step assigned user to delegated user
      const steps = doc.approvalSteps.map(step => {
        if (step.stepNumber === doc.currentStepNumber) {
          return {
            ...step,
            status: 'pending' as const, // Still pending, but with new assignee
            assignedUserId: delegatedUser.id,
            assignedUserName: delegatedUser.name,
            comment: `Ủy quyền xử lý thế. Ghi chú bàn giao: ${comment}`
          };
        }
        return step;
      });

      const historyItem: ApprovalHistoryItem = {
        timestamp: new Date().toISOString(),
        actor: currentUser.name,
        role: currentUser.role,
        action: 'delegate',
        comment,
        details: `Ủy quyền quyền thẩm định cho ${delegatedUser.name} (${delegatedUser.department})`
      };

      return {
        ...doc,
        approvalSteps: steps,
        history: [...doc.history, historyItem]
      };
    });

    setDocuments(updatedDocs);
    saveToLocalStorage('documents', updatedDocs);

    const docName = documents.find(d => d.id === docId)?.title || '';
    triggerAlert('success', `Đã hoàn thành ủy quyền phê duyệt cho ${delegatedUser.name}`);
    setSelectedDocument(null);
  };

  // Filter application data down strictly to current user's company (Company Scoping Isolation)
  const getCompanyScopedData = () => {
    if (!currentUser) return { scopedUsers: [], scopedTemplates: [], scopedWorkflows: [], scopedDocuments: [] };
    
    return {
      scopedUsers: users.filter(u => u.companyId === currentUser.companyId),
      scopedTemplates: templates.filter(t => t.companyId === currentUser.companyId),
      scopedWorkflows: workflows.filter(w => w.companyId === currentUser.companyId),
      scopedDocuments: documents.filter(d => d.companyId === currentUser.companyId)
    };
  };

  const { scopedUsers, scopedTemplates, scopedWorkflows, scopedDocuments } = getCompanyScopedData();

  // Find counts of documents awaiting approval for active user
  const getPendingApprovalsCount = () => {
    if (!currentUser) return 0;
    return scopedDocuments.filter(doc => {
      if (doc.status !== 'pending') return false;
      const activeStep = doc.approvalSteps.find(s => s.stepNumber === doc.currentStepNumber);
      return activeStep && activeStep.assignedUserId === currentUser.id;
    }).length;
  };

  if (!currentUser) {
    return (
      <AuthPortal
        users={users}
        companies={companies}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-gray-800 antialiased" id="main-application-container">
      
      {/* Upper Navigation Bar */}
      <header className="bg-slate-900 text-white shadow-md border-b border-indigo-950 shrink-0">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Logo & title branding */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl shadow-md text-white">
              <FolderLock className="w-6 h-6" id="logo-badge-icon" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                HỆ THỐNG KÝ SỐ LIÊN DOANH NGHIỆP
              </h1>
              <p className="text-xxs text-indigo-300 font-bold tracking-wide uppercase">
                Giải pháp quản trị quy trình & phê duyệt văn bản đa công ty
              </p>
            </div>
          </div>

          {/* Quick Stats indicator widgets */}
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="bg-slate-800 border border-slate-700 px-3.5 py-1.5 rounded-lg flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-400" />
              <span>Đơn vị: <strong className="text-indigo-200">{currentUser?.companyName}</strong></span>
            </div>
            <div className="bg-slate-800 border border-slate-700 px-3.5 py-1.5 rounded-lg flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-sky-400" />
              <span>Phòng ban: <strong className="text-sky-200">{currentUser?.department}</strong></span>
            </div>
            <div className="bg-slate-800 border border-slate-700 px-3.5 py-1.5 rounded-lg flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-400" />
              <span>Lưu hành: <strong className="text-emerald-200">{scopedDocuments.length}</strong></span>
            </div>
            
            {/* Real Logout button */}
            <button
              onClick={handleLogout}
              className="bg-rose-700/90 hover:bg-rose-700 border border-rose-600/60 hover:border-rose-600 text-white px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer text-xs font-bold shadow-sm shrink-0"
              title="Đăng xuất tài khoản"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Body Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Sidebar Menu (3 Columns) */}
        <nav className="lg:col-span-3 space-y-4" id="left-side-navigation">
          {/* Menu Items Card */}
          <div className="bg-white border border-gray-150 rounded-xl shadow-xs overflow-hidden">
            <div className="bg-slate-50 border-b border-gray-150 px-4 py-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-gray-500" />
              <span className="text-xxs font-bold text-gray-500 uppercase tracking-wider">Danh mục chức năng</span>
            </div>

            <div className="p-2 space-y-1">
              {/* Tab: Tra cứu / Phê duyệt / Ký số */}
              <button
                onClick={() => {
                  setActiveTab('documents');
                  setSelectedDocument(null);
                  setEditingDocument(null);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'documents' && !selectedDocument
                    ? 'bg-indigo-600 text-white shadow-xxs'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  {currentUser?.role === 'staff' && 'Hồ sơ của tôi'}
                  {currentUser?.role === 'approver' && 'Thẩm định văn bản'}
                  {currentUser?.role === 'leader' && 'Ký số văn bản'}
                  {currentUser?.role === 'admin' && 'Tra cứu toàn bộ'}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  activeTab === 'documents' && !selectedDocument
                    ? 'bg-indigo-700 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {currentUser?.role === 'staff' && scopedDocuments.filter(d => d.creatorId === currentUser.id).length}
                  {(currentUser?.role === 'approver' || currentUser?.role === 'leader') && getPendingApprovalsCount()}
                  {currentUser?.role === 'admin' && scopedDocuments.length}
                </span>
              </button>

              {/* Tab: Soạn thảo (Only for Staff) */}
              {currentUser?.role === 'staff' && (
                <button
                  onClick={() => {
                    setActiveTab('draft');
                    setSelectedDocument(null);
                    setEditingDocument(null);
                  }}
                  className={`w-full flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'draft'
                      ? 'bg-indigo-600 text-white shadow-xxs'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  <PlusCircle className="w-4 h-4" />
                  Soạn thảo văn bản mới
                </button>
              )}

              {/* Tab: Báo cáo & Thống kê */}
              <button
                onClick={() => {
                  setActiveTab('stats');
                  setSelectedDocument(null);
                  setEditingDocument(null);
                }}
                className={`w-full flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'stats'
                    ? 'bg-indigo-600 text-white shadow-xxs'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                {currentUser?.role === 'staff' ? 'Thống kê cá nhân' : 'Báo cáo & Thống kê'}
              </button>

              {/* Tab: Cấu hình & Quản trị (Admin for Website, Leader for Company Settings) */}
              {(currentUser?.role === 'admin' || currentUser?.role === 'leader') && (
                <button
                  onClick={() => {
                    setActiveTab('admin');
                    setSelectedDocument(null);
                    setEditingDocument(null);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'admin'
                      ? 'bg-indigo-600 text-white shadow-xxs'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    {currentUser?.role === 'admin' ? 'Quản trị Website' : 'Quản trị Nội bộ'}
                  </span>
                  {currentUser?.role === 'admin' ? (
                    // Show badge if there are any pending companies OR pending users system-wide
                    (companies.some(c => c.active === false) || users.some(u => !u.active && u.companyId !== 'system')) && (
                      <span className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-pulse shrink-0" />
                    )
                  ) : (
                    // Show badge if there are pending users in their own company
                    users.some(u => u.companyId === currentUser.companyId && !u.active) && (
                      <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse shrink-0" />
                    )
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Active User Status Card */}
          {currentUser && (
            <div className="bg-white border border-gray-150 p-4 rounded-xl shadow-xxs space-y-3">
              <span className="text-xxs font-bold text-gray-400 uppercase tracking-wider block">Nhân sự đang đăng nhập:</span>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="truncate">
                  <h4 className="text-xs font-bold text-gray-800 truncate">{currentUser.name}</h4>
                  <p className="text-[10px] text-gray-500 font-semibold truncate">{currentUser.companyName}</p>
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-100 p-2.5 rounded text-[10px] text-gray-500 font-medium space-y-1">
                <p>• <strong>Chức danh:</strong> {
                  currentUser.role === 'admin' ? 'Quản trị viên' :
                  currentUser.role === 'leader' ? 'Giám đốc doanh nghiệp' :
                  currentUser.role === 'approver' ? 'Thẩm định nội bộ' : 'Chuyên viên soạn thảo'
                }</p>
                <p>• <strong>Phòng ban:</strong> {currentUser.department}</p>
                {currentUser.signatureCode && (
                  <p className="text-emerald-700">• <strong>Chứng thư ký CA:</strong> <span className="font-mono">{currentUser.signatureCode}</span></p>
                )}
              </div>
              
              <button
                onClick={handleLogout}
                className="w-full bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-600 hover:text-rose-700 text-xxs font-bold py-2 rounded transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Đăng xuất an toàn
              </button>
            </div>
          )}
        </nav>

        {/* Right Main Screen Container (9 Columns) */}
        <section className="lg:col-span-9 space-y-6" id="right-side-main-canvas">
          
          {/* System alerts */}
          {alertMessage && (
            <div className={`p-4 rounded-lg text-xs font-bold flex items-center gap-2 border shadow-xs animate-slide-down ${
              alertMessage.type === 'success' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : 'bg-indigo-50 border-indigo-200 text-indigo-800'
            }`}>
              <CheckSquare className="w-4 h-4 shrink-0" />
              <span>{alertMessage.text}</span>
            </div>
          )}

          {/* Screen Routing logic */}
          {selectedDocument ? (
            /* Document Detail Review Screen */
            <DocumentReview
              currentUser={currentUser!}
              document={selectedDocument}
              allUsers={scopedUsers}
              onApprove={handleApproveDocument}
              onReject={handleRejectDocument}
              onDelegate={handleDelegateDocument}
              onClose={() => setSelectedDocument(null)}
            />
          ) : editingDocument ? (
            /* Edit Document form */
            <DocumentDrafting
              currentUser={currentUser!}
              templates={scopedTemplates}
              workflows={scopedWorkflows}
              users={scopedUsers}
              onDocumentCreated={handleDocumentCreatedOrUpdated}
              onCancel={() => setEditingDocument(null)}
              editDocument={editingDocument}
            />
          ) : activeTab === 'documents' ? (
            /* Search center list */
            <DocumentSearch
              documents={scopedDocuments}
              currentUser={currentUser!}
              onViewDocument={(doc) => setSelectedDocument(doc)}
              onEditDocument={(doc) => setEditingDocument(doc)}
            />
          ) : activeTab === 'draft' ? (
            /* Fresh Drafting Screen */
            <DocumentDrafting
              currentUser={currentUser!}
              templates={scopedTemplates}
              workflows={scopedWorkflows}
              users={scopedUsers}
              onDocumentCreated={handleDocumentCreatedOrUpdated}
              onCancel={() => setActiveTab('documents')}
            />
          ) : activeTab === 'stats' ? (
            /* Executive Dashboard Reports stats */
            <DashboardStats
              documents={scopedDocuments}
            />
          ) : activeTab === 'admin' ? (
            /* Backoffice configurations */
            <AdminPanel
              currentUser={currentUser!}
              users={users} // Keep full users list so we can update/add or check globally
              companies={companies}
              templates={templates}
              workflows={workflows}
              onUpdateUsers={handleUpdateUsers}
              onUpdateCompanies={handleUpdateCompanies}
              onUpdateTemplates={handleUpdateTemplates}
              onUpdateWorkflows={handleUpdateWorkflows}
            />
          ) : null}
        </section>
      </main>

      {/* Corporate Legal footer */}
      <footer className="bg-slate-900 border-t border-slate-950 text-slate-500 text-center py-5 shrink-0 text-xxs font-medium">
        <div className="max-w-7xl mx-auto px-6 space-y-1">
          <p>© 2026 HỆ THỐNG KÝ SỐ LIÊN DOANH NGHIỆP TRỰC TUYẾN. All rights reserved.</p>
          <p>Thiết lập tuân thủ Luật Giao dịch Điện tử, Nghị định 30/2020/NĐ-CP về công tác văn thư và bảo mật chứng thư số CA.</p>
        </div>
      </footer>
    </div>
  );
}
