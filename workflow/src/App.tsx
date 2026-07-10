import React, { useState, useEffect } from 'react';
import { User, FormTemplate, WorkflowRequest, Asset, ChatMessage, Notification, PaymentTransaction, WorkflowConfig } from './types';
import { Sidebar } from './components/Sidebar';
import { DashboardAnalytics } from './components/DashboardAnalytics';
import { FormBuilder } from './components/FormBuilder';
import { WorkflowPortal } from './components/WorkflowPortal';
import { ApprovalInbox } from './components/ApprovalInbox';
import { AssetManager } from './components/AssetManager';
import { LiveChat } from './components/LiveChat';
import { NotificationCenter } from './components/NotificationCenter';
import { AuthPage } from './components/AuthPage';
import { UserManager } from './components/UserManager';
import { IncomingDocumentManager } from './components/IncomingDocumentManager';
import { OutgoingDocumentManager } from './components/OutgoingDocumentManager';
import { CalendarManager } from './components/CalendarManager';
import { TaskManager } from './components/TaskManager';
import { InternalDocumentManager } from './components/InternalDocumentManager';
import { AuditLogManager } from './components/AuditLogManager';
import { SharedCategoryManager } from './components/SharedCategoryManager';
import { OCRManager } from './components/OCRManager';
import { Bell, Shield, Sparkles } from 'lucide-react';

// Static client-side workflows mirroring backend auto-rules
const CLIENT_WORKFLOWS: WorkflowConfig[] = [
  {
    id: 'wf-leave',
    formTemplateId: 'tmpl-leave',
    name: 'Quy trình Duyệt Nghỉ phép',
    stages: [
      { stageIndex: 0, title: 'Phê duyệt của Ban Giám đốc', roleRequired: 'admin', description: 'Phê duyệt tối cao của Quản trị viên' }
    ]
  },
  {
    id: 'wf-asset',
    formTemplateId: 'tmpl-asset',
    name: 'Quy trình Duyệt Thiết bị',
    stages: [
      { stageIndex: 0, title: 'Phê duyệt của Ban Giám đốc', roleRequired: 'admin', description: 'Phê duyệt tối cao của Quản trị viên' }
    ]
  }
];

export default function App() {
  // Master state databases from backend
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('workflow_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [forms, setForms] = useState<FormTemplate[]>([]);
  const [requests, setRequests] = useState<WorkflowRequest[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);

  // Navigation Tab State
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  
  // Loading & Error boundary states
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Floating Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Show Toast Utility
  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // 1. Initial REST API Data Synchronizer
  const syncData = async () => {
    try {
      const [
        usersRes, 
        formsRes, 
        requestsRes, 
        assetsRes, 
        chatsRes, 
        notifsRes, 
        paymentsRes
      ] = await Promise.all([
        fetch('/api/users').then(res => res.json()),
        fetch('/api/forms').then(res => res.json()),
        fetch('/api/requests').then(res => res.json()),
        fetch('/api/assets').then(res => res.json()),
        fetch('/api/chats').then(res => res.json()),
        fetch(currentUser ? `/api/notifications?userId=${currentUser.id}` : '/api/notifications').then(res => res.json()),
        fetch('/api/payments').then(res => res.json())
      ]);

      setUsers(usersRes);
      setForms(formsRes);
      setRequests(requestsRes);
      setAssets(assetsRes);
      setChatMessages(chatsRes);
      setNotifications(Array.isArray(notifsRes) ? notifsRes : []);
      setPayments(paymentsRes);

      if (currentUser) {
        // Refresh active user object in case salary or data updated
        const updatedMe = usersRes.find((u: any) => u.id === currentUser.id);
        if (updatedMe) {
          setCurrentUser(updatedMe);
          localStorage.setItem('workflow_user', JSON.stringify(updatedMe));
        }
      }

      setErrorMsg(null);
    } catch (err: any) {
      console.error('Core synchronizer failed:', err);
      setErrorMsg('Không thể kết nối đến máy chủ Express backend. Đang thử kết nối lại...');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    syncData();
    // Live update poller every 6 seconds to keep stats and push alerts perfectly responsive!
    const interval = setInterval(syncData, 6000);
    return () => clearInterval(interval);
  }, [currentUser?.id]);

  // Prevent admin from accessing forbidden tabs (Form Builder & My Requests)
  useEffect(() => {
    if (currentUser?.role === 'admin') {
      if (currentTab === 'form-builder' || currentTab === 'requests') {
        setCurrentTab('dashboard');
      }
    }
  }, [currentUser, currentTab]);

  // 2. Persona Switcher Auth Simulator
  const handleUserChange = (newUser: User) => {
    setCurrentUser(newUser);
    showToast(`Đã chuyển vai người dùng sang: ${newUser.name} (${newUser.role.toUpperCase()})`, 'info');
  };

  // 3. API Actions Handlers
  const handleSaveForm = async (formData: any) => {
    try {
      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('API server rejected form deploy');
      showToast('Đã xuất bản Biểu mẫu & Quy trình tự động thành công!', 'success');
      await syncData();
    } catch (err: any) {
      showToast('Lưu biểu mẫu thất bại: ' + err.message, 'error');
      throw err;
    }
  };

  const handleSubmitRequest = async (formTemplateId: string, values: Record<string, any>) => {
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formTemplateId,
          submitterId: currentUser?.id,
          submissionData: values
        })
      });
      if (!res.ok) throw new Error('Server rejected submission');
      showToast('Nộp đơn trình duyệt thành công!', 'success');
      await syncData();
    } catch (err: any) {
      showToast('Nộp đơn thất bại: ' + err.message, 'error');
      throw err;
    }
  };

  const handleApproveRequest = async (requestId: string, comment?: string) => {
    try {
      const res = await fetch(`/api/requests/${requestId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser?.id, comment })
      });
      if (!res.ok) throw new Error('Server reject approval');
      showToast('Đã ký phê duyệt hồ sơ thành công!', 'success');
      await syncData();
    } catch (err: any) {
      showToast('Phê duyệt thất bại: ' + err.message, 'error');
      throw err;
    }
  };

  const handleRejectRequest = async (requestId: string, comment?: string) => {
    try {
      const res = await fetch(`/api/requests/${requestId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser?.id, comment })
      });
      if (!res.ok) throw new Error('Server reject rejection');
      showToast('Đã ký từ chối thông qua hồ sơ!', 'info');
      await syncData();
    } catch (err: any) {
      showToast('Thao tác thất bại: ' + err.message, 'error');
      throw err;
    }
  };

  const handleAnalyzeAI = async (formTitle: string, values: Record<string, any>) => {
    try {
      const res = await fetch('/api/requests/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formTitle, values })
      });
      return await res.json();
    } catch (err) {
      console.error('AI analysis API error:', err);
      throw err;
    }
  };

  // 4. Asset API Actions Handlers
  const handleAssetRequest = async (assetId: string, details: string) => {
    try {
      const res = await fetch('/api/assets/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId, userId: currentUser?.id, details })
      });
      if (!res.ok) throw new Error('Server reject request');
      showToast('Đăng ký cấp phát thành công, chờ kiểm kho!', 'success');
      await syncData();
    } catch (err: any) {
      showToast('Gửi yêu cầu thất bại: ' + err.message, 'error');
      throw err;
    }
  };

  const handleAssetReturn = async (assetId: string, details: string, condition: number) => {
    try {
      const res = await fetch('/api/assets/return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId, userId: currentUser?.id, details, condition })
      });
      if (!res.ok) throw new Error('Server reject return');
      showToast('Đăng ký trả lại máy móc chờ IT thẩm định thành công!', 'info');
      await syncData();
    } catch (err: any) {
      showToast('Trả lại thất bại: ' + err.message, 'error');
      throw err;
    }
  };

  const handleAssetExchange = async (assetId: string, details: string) => {
    try {
      const res = await fetch('/api/assets/exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId, userId: currentUser?.id, details })
      });
      if (!res.ok) throw new Error('Server reject exchange');
      showToast('Đăng ký xin hoán đổi nâng cấp máy chờ IT duyệt!', 'success');
      await syncData();
    } catch (err: any) {
      showToast('Yêu cầu đổi máy thất bại: ' + err.message, 'error');
      throw err;
    }
  };

  const handleAssetBuyback = async (assetId: string, details: string) => {
    try {
      const res = await fetch('/api/assets/buyback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId, userId: currentUser?.id, details })
      });
      if (!res.ok) throw new Error('Server reject buyback');
      showToast('Nộp đơn đăng ký xin mua thanh lý thành công!', 'success');
      await syncData();
    } catch (err: any) {
      showToast('Yêu cầu mua thanh lý thất bại: ' + err.message, 'error');
      throw err;
    }
  };

  const handleApproveAssetAction = async (assetId: string, action: 'assign' | 'return' | 'exchange' | 'buyback', paymentMethod?: 'credit_card' | 'e_wallet' | 'payroll_deduction') => {
    try {
      const res = await fetch(`/api/assets/${assetId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, paymentMethod })
      });
      if (!res.ok) throw new Error('Server reject asset approval');
      showToast('Ký duyệt bàn giao/thanh lý tài sản thành công!', 'success');
      await syncData();
    } catch (err: any) {
      showToast('Duyệt tài sản thất bại: ' + err.message, 'error');
      throw err;
    }
  };

  const handleRejectAssetAction = async (assetId: string, comment: string) => {
    try {
      const res = await fetch(`/api/assets/${assetId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment })
      });
      if (!res.ok) throw new Error('Server reject rejection');
      showToast('Bác bỏ đề xuất cấp phát/thanh lý thành công!', 'info');
      await syncData();
    } catch (err: any) {
      showToast('Thao tác thất bại: ' + err.message, 'error');
      throw err;
    }
  };

  // 5. Chat Messages Handlers
  const handleSendChatMessage = async (content: string, isAIAssistant: boolean) => {
    try {
      const endpoint = isAIAssistant ? '/api/chats/ai' : '/api/chats';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUser?.id,
          senderName: currentUser?.name,
          senderAvatar: currentUser?.avatar,
          content
        })
      });
      const data = await res.json();
      await syncData();
      return data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  // 6. Push Notifications Handlers
  const handleMarkAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PUT' });
      await syncData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      if (!currentUser) return;
      await fetch('/api/notifications/read-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id })
      });
      await syncData();
    } catch (err) {
      console.error(err);
    }
  };

  // Helper count pending approvals
  const pendingApprovalsCount = requests.filter(req => {
    if (req.status !== 'pending') return false;
    const config = CLIENT_WORKFLOWS.find(w => w.formTemplateId === req.formTemplateId);
    if (!config) return false;
    const currentStage = config.stages.find(s => s.stageIndex === req.currentStageIndex);
    if (!currentStage) return false;
    if (req.submitterId === currentUser?.id) return false;
    if (currentStage.roleRequired === 'admin') return currentUser?.role === 'admin';
    if (currentStage.roleRequired === 'manager') return currentUser?.role === 'manager' && currentUser?.department === req.submitterDepartment;
    return false;
  }).length;

  const myNotifications = notifications.filter(n => n.userId === currentUser?.id);
  const unreadNotifs = myNotifications.filter(n => !n.isRead);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('workflow_user', JSON.stringify(user));
    showToast(`Đăng nhập thành công! Chào mừng ${user.name}.`, 'success');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('workflow_user');
    showToast('Đã đăng xuất tài khoản.', 'info');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-600">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-sm font-bold">Khởi động Hệ thống Quản trị Quy trình...</h2>
        <p className="text-xs text-slate-400 mt-1">Đang kết xuất cơ sở dữ liệu Mock DB hành chính doanh nghiệp.</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <AuthPage
        onLoginSuccess={handleLoginSuccess}
        allUsers={users}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row relative">
      
      {/* Toast Alert Portal */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-white border border-slate-100 shadow-xl rounded-xl p-4 flex items-center space-x-3 max-w-sm animate-slide-up">
          <div className={`p-1.5 rounded-lg ${
            toast.type === 'success' 
              ? 'bg-emerald-50 text-emerald-600' 
              : toast.type === 'error' 
                ? 'bg-rose-50 text-rose-600' 
                : 'bg-blue-50 text-blue-600'
          }`}>
            {toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ'}
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800">{toast.message}</p>
          </div>
        </div>
      )}

      {/* Sidebar Layout */}
      <Sidebar
        currentUser={currentUser}
        allUsers={users}
        onUserChange={handleUserChange}
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        pendingApprovalsCount={pendingApprovalsCount}
        unreadNotificationsCount={unreadNotifs.length}
        onLogout={handleLogout}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar Header */}
        <header className="bg-white border-b border-slate-100 h-14 px-6 flex items-center justify-between shrink-0 sticky top-0 z-20">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-xs text-slate-700 capitalize">
              {currentTab === 'dashboard' && 'Báo cáo Thống kê Doanh nghiệp'}
              {currentTab === 'form-builder' && 'Soạn Đơn Thông Minh'}
              {currentTab === 'requests' && 'Tờ Trình Hành Chính'}
              {currentTab === 'approvals' && 'Hòm Thư Xét Duyệt'}
              {currentTab === 'docs-incoming' && 'Quản lý Văn bản đến'}
              {currentTab === 'docs-outgoing' && 'Quản lý Văn bản đi'}
              {currentTab === 'docs-internal' && 'Công văn nội bộ'}
              {currentTab === 'events' && 'Quản lý Lịch công tác'}
              {currentTab === 'tasks' && 'Quản lý Công việc'}
              {currentTab === 'assets' && 'Quản Trị Kho Thiết Bị'}
              {currentTab === 'chat' && 'Kênh Giao Tiếp & Trợ Lý AI'}
              {currentTab === 'user-management' && 'Quản lý Người dùng'}
              {currentTab === 'audit-logs' && 'Nhật ký Hệ thống (Audit Log)'}
              {currentTab === 'shared-categories' && 'Danh mục Dùng chung'}
              {currentTab === 'ocr-manager' && 'Trích xuất OCR'}
            </span>
            <span className="text-[10px] bg-indigo-50 border border-indigo-100/50 text-indigo-600 px-2 py-0.5 rounded-full font-bold">
              Công ty CP Công nghệ Workflow
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Top Notifications Center */}
            <NotificationCenter
              notifications={myNotifications}
              onMarkAsRead={handleMarkAsRead}
              onMarkAllAsRead={handleMarkAllAsRead}
            />

            <div className="h-5 w-px bg-slate-200" />

            {/* Profile indicator */}
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-700 hidden sm:inline-block">{currentUser.name}</span>
              <span className="text-[9px] font-mono text-slate-400 font-semibold bg-slate-100 px-2 py-0.5 rounded border">
                IP SAFE
              </span>
            </div>
          </div>
        </header>

        {/* Dynamic Inner Component Workspace Router */}
        <main className="flex-1 overflow-y-auto">
          {errorMsg && (
            <div className="m-6 p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl flex items-center space-x-3 text-xs">
              <span className="font-bold shrink-0">⚠️ KHẨN CẤP:</span>
              <p>{errorMsg}</p>
            </div>
          )}

          {currentTab === 'dashboard' && (
            <DashboardAnalytics
              requests={requests}
              assets={assets}
              payments={payments}
              users={users}
              forms={forms}
            />
          )}

          {currentTab === 'form-builder' && (
            <FormBuilder
              onSaveForm={handleSaveForm}
              onSubmitRequest={handleSubmitRequest}
              currentUser={currentUser}
              userId={currentUser.id}
            />
          )}

          {currentTab === 'requests' && (
            <WorkflowPortal
              forms={forms}
              requests={requests}
              workflows={CLIENT_WORKFLOWS}
              currentUser={currentUser}
              users={users}
              onSubmitRequest={handleSubmitRequest}
              onAnalyzeAI={handleAnalyzeAI}
            />
          )}

          {currentTab === 'approvals' && (
            <ApprovalInbox
              requests={requests}
              workflows={CLIENT_WORKFLOWS}
              currentUser={currentUser}
              users={users}
              onApprove={handleApproveRequest}
              onReject={handleRejectRequest}
              onAnalyzeAI={handleAnalyzeAI}
            />
          )}

          {currentTab === 'assets' && (
            <AssetManager
              assets={assets}
              currentUser={currentUser}
              onAssetRequest={handleAssetRequest}
              onAssetReturn={handleAssetReturn}
              onAssetExchange={handleAssetExchange}
              onAssetBuyback={handleAssetBuyback}
              onApproveAssetAction={handleApproveAssetAction}
              onRejectAssetAction={handleRejectAssetAction}
              paymentTransactions={payments}
            />
          )}

          {currentTab === 'chat' && (
            <LiveChat
              chatMessages={chatMessages}
              currentUser={currentUser}
              onSendChatMessage={handleSendChatMessage}
            />
          )}

          {currentTab === 'docs-incoming' && (
            <IncomingDocumentManager
              currentUser={currentUser}
              users={users}
            />
          )}

          {currentTab === 'docs-outgoing' && (
            <OutgoingDocumentManager
              currentUser={currentUser}
              users={users}
            />
          )}

          {currentTab === 'docs-internal' && (
            <InternalDocumentManager
              currentUser={currentUser}
              users={users}
            />
          )}

          {currentTab === 'events' && (
            <CalendarManager
              currentUser={currentUser}
              users={users}
            />
          )}

          {currentTab === 'tasks' && (
            <TaskManager
              currentUser={currentUser}
              users={users}
            />
          )}

          {currentTab === 'audit-logs' && currentUser.role === 'admin' && (
            <AuditLogManager />
          )}

          {currentTab === 'shared-categories' && currentUser.role === 'admin' && (
            <SharedCategoryManager />
          )}

          {currentTab === 'ocr-manager' && (
            <OCRManager
              currentUser={currentUser}
              users={users}
            />
          )}

          {currentTab === 'user-management' && currentUser.role === 'admin' && (
            <UserManager
              users={users}
              currentUser={currentUser}
              onUserUpdate={syncData}
            />
          )}
        </main>

      </div>

    </div>
  );
}
