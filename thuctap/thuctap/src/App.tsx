import React, { useState, useEffect } from 'react';
import { User, FormTemplate, WorkflowRequest, Asset, ChatMessage, Notification, PaymentTransaction, WorkflowConfig, ChatGroup } from './types';
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
import { CalendarManager } from './components/CalendarManager';
import { TaskManager } from './components/TaskManager';
import { ContractManager } from "./components/ContractManager";
import { InternalDocumentManager } from './components/InternalDocumentManager';
import { AuditLogManager } from './components/AuditLogManager';
import { SharedCategoryManager } from './components/SharedCategoryManager';
import { OCRManager } from './components/OCRManager';
import { Bell, Shield, Sparkles, Search, ChevronDown, UserCheck, Check, Settings, ShieldAlert, Sun, Moon, MessageSquare, X } from 'lucide-react';
import { SettingsModal } from './components/SettingsModal';
import { UserProfileModal } from './components/UserProfileModal';

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
  const [chatGroups, setChatGroups] = useState<ChatGroup[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);

  // Chat Redirect State
  const [chatRedirectTab, setChatRedirectTab] = useState<'ai' | 'corporate' | 'department' | 'private' | undefined>(undefined);
  const [chatRedirectRecipientId, setChatRedirectRecipientId] = useState<string | undefined>(undefined);

  // Floating Quick View Notification Preview States
  const [shownNotifIds, setShownNotifIds] = useState<string[]>([]);
  const [latestFloatingChatNotif, setLatestFloatingChatNotif] = useState<any | null>(null);

  // Navigation Tab State
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('jin_theme') as 'light' | 'dark') || 'light';
  });

  const [menuOrder, setMenuOrder] = useState<string[]>(() => {
    const saved = localStorage.getItem('jin_menu_order');
    return saved ? JSON.parse(saved) : [];
  });

  const [hiddenMenuIds, setHiddenMenuIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('jin_hidden_menu_ids');
    return saved ? JSON.parse(saved) : [];
  });

  // State for Global Search and prioritized engine
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  const getGlobalSearchItems = () => {
    const items: Array<{
      id: string;
      title: string;
      subtitle: string;
      type: 'task' | 'event' | 'note' | 'document' | 'contract' | 'asset' | 'approval';
      tab: string;
      badge: string;
      meta?: string;
    }> = [];

    // 1. Tasks
    try {
      const savedTasks = localStorage.getItem('sio_tasks');
      const taskList = savedTasks ? JSON.parse(savedTasks) : [];
      const finalTasks = taskList.length > 0 ? taskList : [
        { id: 'TSK-201', title: 'Trải nghiệm người dùng Đăng nhập + Đăng ký', description: 'Xem xét UX của đăng nhập và đăng ký...', group: 'Thiết kế UI/UX' },
        { id: 'TSK-202', title: 'Thiết kế Bản đồ tư duy', description: 'Xây dựng luồng người dùng cốt lõi...', group: 'Thiết kế UI/UX' },
        { id: 'TSK-203', title: 'Bản phác thảo Trải nghiệm người dùng', description: 'Phác thảo các ý tưởng thiết kế giao diện...', group: 'Thiết kế UI/UX' },
        { id: 'TSK-204', title: 'Hoạt ảnh trang đích (Preloader)', description: 'Tạo mẫu bộ tải xương (skeleton loader)...', group: 'Thiết kế tương tác' }
      ];
      finalTasks.forEach((t: any) => {
        items.push({
          id: t.id,
          title: t.title,
          subtitle: t.description || t.group || '',
          type: 'task',
          tab: 'tasks',
          badge: 'Nhiệm vụ',
          meta: t.group
        });
      });
    } catch (e) {
      console.error(e);
    }

    // 2. Calendar Events
    try {
      const savedEvents = localStorage.getItem('sio_calendar_events');
      const eventList = savedEvents ? JSON.parse(savedEvents) : [];
      eventList.forEach((e: any) => {
        items.push({
          id: e.id,
          title: e.title,
          subtitle: e.time || '',
          type: 'event',
          tab: 'events',
          badge: 'Sự kiện',
          meta: e.category
        });
      });
    } catch (e) {
      console.error(e);
    }

    // 3. Calendar Notes
    try {
      const savedNotes = localStorage.getItem('sio_calendar_notes');
      const noteList = savedNotes ? JSON.parse(savedNotes) : [];
      noteList.forEach((n: any) => {
        items.push({
          id: n.id,
          title: n.title,
          subtitle: n.content || n.dateStr || '',
          type: 'note',
          tab: 'events',
          badge: 'Ghi chú Lịch',
          meta: n.dateStr
        });
      });
    } catch (e) {
      console.error(e);
    }

    // 4. Internal Documents
    try {
      const savedDocs = localStorage.getItem('sio_internal_docs');
      const docList = savedDocs ? JSON.parse(savedDocs) : [];
      docList.forEach((d: any) => {
        items.push({
          id: d.id,
          title: d.title,
          subtitle: d.content || d.docNumber || '',
          type: 'document',
          tab: 'docs-internal',
          badge: 'Công văn',
          meta: d.docNumber
        });
      });
    } catch (e) {
      console.error(e);
    }

    // 5. Contracts
    try {
      const savedContracts = localStorage.getItem('sio_contracts');
      const contractList = savedContracts ? JSON.parse(savedContracts) : [];
      contractList.forEach((c: any) => {
        items.push({
          id: c.id,
          title: c.title || c.contractName || 'Hợp đồng không tên',
          subtitle: c.contractNumber || c.partnerName || '',
          type: 'contract',
          tab: 'contracts',
          badge: 'Hợp đồng',
          meta: c.contractType
        });
      });
    } catch (e) {
      console.error(e);
    }

    // 6. Assets
    assets.forEach((a: any) => {
      items.push({
        id: a.id,
        title: a.name,
        subtitle: `Mã: ${a.code} | Danh mục: ${a.category}`,
        type: 'asset',
        tab: 'assets',
        badge: 'Thiết bị',
        meta: a.status
      });
    });

    // 7. Approval Requests
    requests.forEach((r: any) => {
      items.push({
        id: r.id,
        title: r.title,
        subtitle: `Người yêu cầu: ${r.creatorName} | Phòng ban: ${r.department}`,
        type: 'approval',
        tab: 'approvals',
        badge: 'Đơn phê duyệt',
        meta: r.status
      });
    });

    return items;
  };

  const getFilteredSearchResults = () => {
    if (!globalSearchQuery.trim()) return { primary: [], secondary: [] };
    
    const query = globalSearchQuery.toLowerCase();
    const allItems = getGlobalSearchItems();
    
    const matched = allItems.filter(item => 
      item.title.toLowerCase().includes(query) || 
      item.subtitle.toLowerCase().includes(query) ||
      (item.meta && item.meta.toLowerCase().includes(query)) ||
      item.badge.toLowerCase().includes(query)
    );

    const isPrimaryTab = (itemTab: string) => {
      if (currentTab === 'events') {
        return itemTab === 'events';
      }
      return itemTab === currentTab;
    };

    const primary = matched.filter(item => isPrimaryTab(item.tab));
    const secondary = matched.filter(item => !isPrimaryTab(item.tab));

    return { primary, secondary };
  };

  const { primary: searchResultsPrimary, secondary: searchResultsSecondary } = getFilteredSearchResults();
  
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
        groupsRes,
        notifsRes, 
        paymentsRes
      ] = await Promise.all([
        fetch('/api/users').then(res => res.json()),
        fetch('/api/forms').then(res => res.json()),
        fetch('/api/requests').then(res => res.json()),
        fetch('/api/assets').then(res => res.json()),
        fetch(currentUser ? `/api/chats?userId=${currentUser.id}` : '/api/chats').then(res => res.json()),
        fetch('/api/chats/groups').then(res => res.json()).catch(() => []),
        fetch(currentUser ? `/api/notifications?userId=${currentUser.id}` : '/api/notifications').then(res => res.json()),
        fetch('/api/payments').then(res => res.json())
      ]);

      const safeUsers = Array.isArray(usersRes) ? usersRes : [];
      const safeForms = Array.isArray(formsRes) ? formsRes : [];
      const safeRequests = Array.isArray(requestsRes) ? requestsRes : [];
      const safeAssets = Array.isArray(assetsRes) ? assetsRes : [];
      const safeChats = Array.isArray(chatsRes) ? chatsRes : [];
      const safeGroups = Array.isArray(groupsRes) ? groupsRes : [];
      const safeNotifications = Array.isArray(notifsRes) ? notifsRes : [];
      const safePayments = Array.isArray(paymentsRes) ? paymentsRes : [];

      setUsers(safeUsers);
      setForms(safeForms);
      setRequests(safeRequests);
      setAssets(safeAssets);
      setChatMessages(safeChats);
      setChatGroups(safeGroups);
      setNotifications(safeNotifications);
      setPayments(safePayments);

      // Detect new unread chat notifications to show the floating preview
      if (currentUser && safeNotifications.length > 0) {
        const myUnread = safeNotifications.filter((n: any) => n.userId === currentUser.id && !n.read);
        const nextToShow = myUnread.find((n: any) => !shownNotifIds.includes(n.id));
        if (nextToShow) {
          setShownNotifIds(prev => [...prev, nextToShow.id]);
          setLatestFloatingChatNotif(nextToShow);
          setTimeout(() => {
            setLatestFloatingChatNotif(null);
          }, 6000);
        }
      }

      if (currentUser && safeUsers.length > 0) {
        // Refresh active user object in case salary or data updated
        const updatedMe = safeUsers.find((u: any) => u.id === currentUser.id);
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
  const handleSendChatMessage = async (
    type: 'ai' | 'corporate' | 'department' | 'private', 
    content: string, 
    recipientId?: string,
    fileUrl?: string,
    fileName?: string,
    fileType?: 'image' | 'file',
    fileSize?: number,
    replyTo?: { messageId: string, senderName: string, contentSnippet: string }
  ) => {
    try {
      const endpoint = type === 'ai' ? '/api/chats/ai' : '/api/chats';
      let finalRecipient = 'all';
      if (type === 'ai') finalRecipient = 'ai-bot';
      else if (type === 'department' && recipientId) finalRecipient = `dept:${recipientId}`;
      else if (type === 'private' && recipientId) finalRecipient = recipientId;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUser?.id,
          senderName: currentUser?.name,
          senderAvatar: currentUser?.avatar,
          senderRole: currentUser?.role,
          content,
          recipientId: finalRecipient,
          fileUrl,
          fileName,
          fileType,
          fileSize,
          replyTo
        })
      });
      if (!res.ok) {
        throw new Error('Không thể gửi tin nhắn. Server phản hồi lỗi: ' + res.status);
      }
      const data = await res.json();
      await syncData();
      return data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleDeleteChatMessage = async (id: string, mode: 'me' | 'everyone' = 'everyone') => {
    try {
      const url = currentUser ? `/api/chats/${id}?userId=${currentUser.id}&mode=${mode}` : `/api/chats/${id}?mode=${mode}`;
      const res = await fetch(url, {
        method: 'DELETE'
      });
      if (!res.ok) {
        throw new Error('Không thể xóa tin nhắn.');
      }
      await syncData();
    } catch (err: any) {
      console.error(err);
      showToast('Xóa tin nhắn thất bại: ' + err.message, 'error');
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

  const handleNotificationClick = async (notif: Notification) => {
    try {
      // Mark as read immediately on server & state
      await handleMarkAsRead(notif.id);
      
      // If it is a chat notification
      if (notif.type === 'chat') {
        const targetTab = notif.targetTab || 'private';
        const recipientId = notif.targetRecipientId;
        
        // Switch global tab to 'chat'
        setCurrentTab('chat');
        
        // Update the chat redirect parameters
        setChatRedirectTab(targetTab);
        setChatRedirectRecipientId(recipientId);
        
        showToast(`Đã mở cuộc trò chuyện với người gửi`, 'success');
      } else if (notif.link) {
        if (notif.link.includes('contracts')) {
          setCurrentTab('contracts');
        } else if (notif.link.includes('docs-internal')) {
          setCurrentTab('docs-internal');
        } else if (notif.link.includes('asset')) {
          setCurrentTab('assets');
        } else if (notif.link.includes('workflow')) {
          setCurrentTab('requests');
        }
      }
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
  const unreadNotifs = myNotifications.filter(n => !n.read);

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

  const handleSaveProfile = async (updatedData: Partial<User>) => {
    try {
      if (!currentUser) return;
      const res = await fetch(`/api/users/${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      if (!res.ok) throw new Error('API server rejected user profile update');
      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
        localStorage.setItem('workflow_user', JSON.stringify(data.user));
        showToast('Cập nhật hồ sơ thông tin cá nhân thành công!', 'success');
        await syncData();
      }
    } catch (err: any) {
      showToast('Cập nhật hồ sơ thất bại: ' + err.message, 'error');
      throw err;
    }
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
    <div className="min-h-screen bg-[#ebf0f5] flex flex-col md:flex-row relative">
      
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

      {/* Floating Notification Quick View Banner */}
      {latestFloatingChatNotif && (
        <div 
          onClick={() => {
            handleNotificationClick(latestFloatingChatNotif);
            setLatestFloatingChatNotif(null);
          }}
          className="fixed top-5 right-5 md:top-20 md:right-6 z-50 bg-white border border-indigo-100 shadow-2xl rounded-2xl p-4 w-80 cursor-pointer hover:shadow-indigo-100/40 transition-all transform hover:-translate-y-0.5 animate-bounce-short border-l-4 border-l-indigo-600 flex items-start gap-3"
        >
          <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 shadow-3xs">
            <MessageSquare size={16} className="animate-pulse" />
          </div>
          <div className="flex-1 min-w-0 text-left space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-mono">XEM NHANH</span>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setLatestFloatingChatNotif(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100"
              >
                <X size={12} />
              </button>
            </div>
            <h4 className="text-xs font-extrabold text-slate-800 truncate">{latestFloatingChatNotif.title}</h4>
            <p className="text-[10.5px] text-slate-500 line-clamp-2 leading-snug">{latestFloatingChatNotif.message}</p>
            <div className="text-[9.5px] text-indigo-600 font-bold flex items-center gap-1 pt-1">
              <span>Bấm phản hồi ngay</span>
              <span>→</span>
            </div>
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
        onOpenHelpModal={() => setIsHelpModalOpen(true)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        menuOrder={menuOrder}
        hiddenMenuIds={hiddenMenuIds}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar Header */}
        <header className="bg-white border-b border-[#e2eae8] h-16 px-6 flex items-center justify-end shrink-0 sticky top-0 z-25 font-sans">
          
          <div className="flex items-center space-x-4">
            {/* 1. Search Box */}
            <div className="relative flex items-center">
              <Search size={14} className="absolute left-3 text-slate-400 pointer-events-none" />
              <input 
                type="text" 
                placeholder="Tìm kiếm công việc, lịch, công văn..." 
                value={globalSearchQuery}
                onChange={e => setGlobalSearchQuery(e.target.value)}
                className="pl-9 pr-8 py-1.5 bg-[#f4f7f6] border border-[#e2eae8] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#2f80ed] w-56 focus:w-72 transition-all font-medium text-slate-700 placeholder-slate-400" 
              />
              {globalSearchQuery && (
                <button 
                  onClick={() => setGlobalSearchQuery('')}
                  className="absolute right-2.5 p-0.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 cursor-pointer flex items-center justify-center"
                >
                  <X size={12} />
                </button>
              )}

              {/* Floating Dropdown Results Panel */}
              {globalSearchQuery.trim() !== '' && (
                <div className="absolute top-full mt-2 right-0 w-80 sm:w-96 bg-white border border-[#e2eae8] rounded-2xl shadow-xl overflow-hidden z-50 font-sans animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="p-3 bg-slate-50/80 border-b border-slate-100 flex justify-between items-center">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Tìm kiếm Workspace</span>
                    <button 
                      onClick={() => setGlobalSearchQuery('')}
                      className="text-[10px] text-blue-600 font-bold hover:underline cursor-pointer"
                    >
                      Đóng
                    </button>
                  </div>

                  <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100 custom-scrollbar">
                    {/* SECTION 1: PRIMARY TAB RESULTS */}
                    <div className="p-2">
                      <div className="px-2 py-1 text-[9px] font-extrabold text-blue-600 bg-blue-50/60 rounded-md uppercase tracking-wider mb-1">
                        🎯 Kết quả trên trang hiện tại ({searchResultsPrimary.length})
                      </div>
                      {searchResultsPrimary.length === 0 ? (
                        <p className="text-[11px] text-slate-400 py-3 px-2 text-center font-medium">Không có kết quả nào trùng khớp trên trang này.</p>
                      ) : (
                        <div className="space-y-1">
                          {searchResultsPrimary.map(item => (
                            <div 
                              key={item.id}
                              onClick={() => {
                                setCurrentTab(item.tab);
                                setGlobalSearchQuery('');
                              }}
                              className="p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer text-left group"
                            >
                              <div className="flex justify-between items-start">
                                <span className="text-xs font-bold text-slate-800 block truncate max-w-[200px]">{item.title}</span>
                                <span className="text-[9px] font-mono font-extrabold text-slate-400 uppercase bg-slate-100 px-1.5 py-0.5 rounded">{item.badge}</span>
                              </div>
                              <p className="text-[10.5px] text-slate-500 truncate mt-0.5 font-medium">{item.subtitle}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* SECTION 2: OTHER MODULE SUGGESTIONS */}
                    <div className="p-2">
                      <div className="px-2 py-1 text-[9px] font-extrabold text-slate-500 bg-slate-100/60 rounded-md uppercase tracking-wider mb-1">
                        💡 Gợi ý từ các phân hệ khác ({searchResultsSecondary.length})
                      </div>
                      {searchResultsSecondary.length === 0 ? (
                        <p className="text-[11px] text-slate-400 py-3 px-2 text-center font-medium">Không có gợi ý nào khác.</p>
                      ) : (
                        <div className="space-y-1">
                          {searchResultsSecondary.map(item => (
                            <div 
                              key={item.id}
                              onClick={() => {
                                setCurrentTab(item.tab);
                                setGlobalSearchQuery('');
                              }}
                              className="p-2 rounded-xl hover:bg-slate-50/80 transition-colors cursor-pointer text-left group"
                            >
                              <div className="flex justify-between items-start">
                                <span className="text-xs font-bold text-slate-700 block truncate max-w-[200px] group-hover:text-blue-600">{item.title}</span>
                                <span className="text-[9px] font-mono font-extrabold text-slate-500 bg-slate-200/50 px-1.5 py-0.5 rounded">{item.badge}</span>
                              </div>
                              <p className="text-[10.5px] text-slate-400 truncate mt-0.5 font-medium">{item.subtitle}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50/50 text-center border-t border-slate-100 text-[10px] text-slate-400 font-medium">
                    Nhấp vào kết quả để chuyển hướng ngay sang phân hệ tương ứng.
                  </div>
                </div>
              )}
            </div>

             {/* 2. Top Notifications Center */}
             <NotificationCenter
               notifications={myNotifications}
               onMarkAsRead={handleMarkAsRead}
               onMarkAllAsRead={handleMarkAllAsRead}
               onClickNotification={handleNotificationClick}
             />

            <div className="h-5 w-px bg-slate-200" />

            {/* 3. Dark/Light Mode Toggle Button */}
            <button
              onClick={() => {
                const newTheme = theme === 'light' ? 'dark' : 'light';
                setTheme(newTheme);
                localStorage.setItem('jin_theme', newTheme);
              }}
              className="p-2 hover:bg-slate-50 border border-[#e2eae8] rounded-xl text-slate-500 hover:text-slate-700 transition-all cursor-pointer flex items-center justify-center bg-white"
              title={theme === 'light' ? 'Chuyển sang chế độ tối' : 'Chuyển sang chế độ sáng'}
            >
              {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
            </button>
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
              forms={forms}
              requests={requests}
              onSaveForm={handleSaveForm}
              onSubmitRequest={handleSubmitRequest}
              currentUser={currentUser!}
              userId={currentUser!.id}
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
              allUsers={users}
              chatGroups={chatGroups}
              onRefreshGroups={syncData}
              onSendChatMessage={handleSendChatMessage}
              onDeleteChatMessage={handleDeleteChatMessage}
              redirectTab={chatRedirectTab}
              redirectRecipientId={chatRedirectRecipientId}
              onClearRedirect={() => {
                setChatRedirectTab(undefined);
                setChatRedirectRecipientId(undefined);
              }}
            />
          )}

          

          

          {currentTab === 'docs-internal' && (
            <InternalDocumentManager
              currentUser={currentUser}
              users={users}
            />
          )}
          {currentTab === 'contracts' && (
            <ContractManager
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

          {currentTab === 'audit-logs' && (
            currentUser.role === 'admin' ? (
              <AuditLogManager />
            ) : (
              <div className="p-12 text-center space-y-4 max-w-md mx-auto my-12 bg-white rounded-2xl border border-[#e2eae8] shadow-sm">
                <div className="inline-flex p-4 rounded-full bg-rose-50 text-rose-500 mb-2">
                  <ShieldAlert size={40} />
                </div>
                <h3 className="text-sm font-extrabold text-slate-800">QUYỀN TRUY CẬP BỊ HẠN CHẾ</h3>
                <p className="text-xs text-slate-500 leading-relaxed">Bạn không có quyền quản trị viên để xem nhật ký hệ thống. Vui lòng chuyển đổi vai trò ở thanh công cụ phía trên hoặc quay lại bảng điều khiển.</p>
                <button onClick={() => setCurrentTab('dashboard')} className="mt-2 px-4 py-2 bg-[#2f80ed] text-white text-xs font-bold rounded-xl hover:bg-[#1c71dd] transition-all cursor-pointer">
                  Quay lại Bảng điều khiển
                </button>
              </div>
            )
          )}

          {currentTab === 'shared-categories' && (
            currentUser.role === 'admin' ? (
              <SharedCategoryManager />
            ) : (
              <div className="p-12 text-center space-y-4 max-w-md mx-auto my-12 bg-white rounded-2xl border border-[#e2eae8] shadow-sm">
                <div className="inline-flex p-4 rounded-full bg-rose-50 text-rose-500 mb-2">
                  <ShieldAlert size={40} />
                </div>
                <h3 className="text-sm font-extrabold text-slate-800">QUYỀN TRUY CẬP BỊ HẠN CHẾ</h3>
                <p className="text-xs text-slate-500 leading-relaxed">Bạn không có quyền quản trị viên để xem danh mục dùng chung. Vui lòng chuyển đổi vai trò ở thanh công cụ phía trên hoặc quay lại bảng điều khiển.</p>
                <button onClick={() => setCurrentTab('dashboard')} className="mt-2 px-4 py-2 bg-[#2f80ed] text-white text-xs font-bold rounded-xl hover:bg-[#1c71dd] transition-all cursor-pointer">
                  Quay lại Bảng điều khiển
                </button>
              </div>
            )
          )}

          {currentTab === 'ocr-manager' && (
            <OCRManager
              currentUser={currentUser}
              users={users}
            />
          )}

          {currentTab === 'user-management' && (
            currentUser.role === 'admin' ? (
              <UserManager
                users={users}
                currentUser={currentUser}
                onUserUpdate={syncData}
              />
            ) : (
              <div className="p-12 text-center space-y-4 max-w-md mx-auto my-12 bg-white rounded-2xl border border-[#e2eae8] shadow-sm">
                <div className="inline-flex p-4 rounded-full bg-rose-50 text-rose-500 mb-2">
                  <ShieldAlert size={40} />
                </div>
                <h3 className="text-sm font-extrabold text-slate-800">QUYỀN TRUY CẬP BỊ HẠN CHẾ</h3>
                <p className="text-xs text-slate-500 leading-relaxed">Bạn không có quyền quản trị viên để quản lý nhân sự & tài khoản. Vui lòng chuyển đổi vai trò ở thanh công cụ phía trên hoặc quay lại bảng điều khiển.</p>
                <button onClick={() => setCurrentTab('dashboard')} className="mt-2 px-4 py-2 bg-[#2f80ed] text-white text-xs font-bold rounded-xl hover:bg-[#1c71dd] transition-all cursor-pointer">
                  Quay lại Bảng điều khiển
                </button>
              </div>
            )
          )}
        </main>

      </div>

      {/* JIN Help/Support Request Modal (Image 2) */}
      {isHelpModalOpen && (
        <HelpSupportModal 
          onClose={() => setIsHelpModalOpen(false)}
          onSuccess={(topic, desc) => {
            showToast(`Yêu cầu hỗ trợ đã gửi: [${topic}] - Chuyên gia JIN sẽ phản hồi sớm nhất!`, 'success');
            setIsHelpModalOpen(false);
          }}
        />
      )}

      {/* Settings Panel Modal */}
      {isSettingsModalOpen && (
        <SettingsModal
          onClose={() => setIsSettingsModalOpen(false)}
          theme={theme}
          setTheme={setTheme}
          menuOrder={menuOrder}
          setMenuOrder={setMenuOrder}
          hiddenMenuIds={hiddenMenuIds}
          setHiddenMenuIds={setHiddenMenuIds}
          showToast={showToast}
        />
      )}

      {/* Profile & User Management Modal */}
      {isProfileModalOpen && (
        <UserProfileModal
          onClose={() => setIsProfileModalOpen(false)}
          currentUser={currentUser}
          onSaveProfile={handleSaveProfile}
          showToast={showToast}
        />
      )}

      {/* Injected Dark Mode Styles for Real-time Theme Customization */}
      {theme === 'dark' && (
        <style dangerouslySetInnerHTML={{ __html: `
          /* Dark Theme CSS Overrides */
          body, #root {
            background-color: #0f172a !important;
            color: #f1f5f9 !important;
          }
          #jin-dashboard, .bg-\\[\\#ebf0f5\\] {
            background-color: #0f172a !important;
          }
          .bg-white {
            background-color: #1e293b !important;
            color: #f1f5f9 !important;
          }
          .text-slate-700, .text-slate-800, .text-slate-900, .text-\\[\\#0a2e24\\], h1, h2, h3, h4 {
            color: #f1f5f9 !important;
          }
          .text-slate-500, .text-slate-400 {
            color: #94a3b8 !important;
          }
          .border, .border-b, .border-t, .border-r, .border-l, .border-\\[\\#e2eae8\\] {
            border-color: #334155 !important;
          }
          input, select, textarea {
            background-color: #1e293b !important;
            color: #f1f5f9 !important;
            border-color: #475569 !important;
          }
          .bg-slate-50, .bg-\\[\\#f8fafc\\], .bg-slate-50\\/50 {
            background-color: #0f172a !important;
          }
          .bg-blue-50, .bg-\\[\\#f3f7ff\\] {
            background-color: #1e293b !important;
          }
          /* Sidebar items */
          aside {
            background-color: #1e293b !important;
            border-right-color: #334155 !important;
          }
          header {
            background-color: #1e293b !important;
            border-bottom-color: #334155 !important;
          }
          /* Custom overrides for workflow view cards in dark mode */
          .bg-slate-50\\/30 {
            background-color: #0f172a !important;
          }
          .divide-slate-100 > * + * {
            border-color: #334155 !important;
          }
        `}} />
      )}

    </div>
  );
}

// Separate component for modular code hygiene and clean generation
interface HelpSupportModalProps {
  onClose: () => void;
  onSuccess: (topic: string, desc: string) => void;
}

const HelpSupportModal: React.FC<HelpSupportModalProps> = ({ onClose, onSuccess }) => {
  const [topic, setTopic] = React.useState('Khó khăn kỹ thuật');
  const [description, setDescription] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSuccess(topic, description);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Blurred overlay */}
      <div className="absolute inset-0 bg-[#0c1a30]/40 backdrop-blur-md" onClick={onClose} />
      
      {/* Modal Dialog Container */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-lg z-10 overflow-hidden relative animate-scale-up font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-extrabold text-[#0a2e24] text-sm tracking-tight">
            Cần một chút giúp đỡ?
          </h3>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-all font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Female Vector Illustration with Cactus & Plants */}
          <div className="w-full h-40 bg-gradient-to-b from-[#f3f7ff] to-white rounded-2xl p-4 flex items-center justify-center border border-blue-50/50 relative overflow-hidden">
            {/* Left Plant */}
            <svg viewBox="0 0 40 60" className="absolute left-6 bottom-0 w-10 h-16 text-emerald-500 opacity-80">
              <path d="M20 60 C20 40 10 30 10 10 C10 30 20 40 20 60 Z" fill="currentColor" />
              <path d="M20 60 C20 35 30 25 30 5 C30 25 20 35 20 60 Z" fill="#34d399" />
              <circle cx="20" cy="55" r="4" fill="#a16207" />
            </svg>

            {/* Central illustration */}
            <svg viewBox="0 0 100 100" className="w-24 h-24 text-blue-500">
              {/* Head & Body */}
              <circle cx="50" cy="40" r="14" fill="#fed7d7" />
              <path d="M36 40 C36 28 64 28 64 40 C64 43 60 41 50 41 C40 41 36 43 36 40" fill="#1a202c" />
              {/* Cute Glasses */}
              <circle cx="45" cy="38" r="4" stroke="#2b6cb0" strokeWidth="1.5" fill="none" />
              <circle cx="55" cy="38" r="4" stroke="#2b6cb0" strokeWidth="1.5" fill="none" />
              <line x1="49" y1="38" x2="51" y2="38" stroke="#2b6cb0" strokeWidth="1.5" />
              {/* Smile */}
              <path d="M48 44 Q50 46 52 44" stroke="#1a202c" strokeWidth="1" fill="none" />
              {/* Desk & Laptop */}
              <path d="M30 70 C30 58 70 58 70 70 Z" fill="#3182ce" />
              <rect x="36" y="66" width="28" height="18" rx="2" fill="#e2e8f0" />
              <rect x="42" y="70" width="16" height="10" rx="1" fill="#4a5568" />
              <polygon points="34,84 66,84 62,87 38,87" fill="#cbd5e0" />
            </svg>

            {/* Right Cactus */}
            <svg viewBox="0 0 40 60" className="absolute right-6 bottom-0 w-8 h-12 text-emerald-600">
              <rect x="17" y="15" width="6" height="35" rx="3" fill="currentColor" />
              <path d="M10 25 H20 V35 H10 Z" fill="currentColor" rx="2" />
              <path d="M20 30 H30 V40 H20 Z" fill="currentColor" rx="2" />
              <circle cx="20" cy="48" r="3" fill="#854d0e" />
            </svg>
          </div>

          {/* Intro Text */}
          <div className="text-center">
            <p className="text-xs font-bold text-slate-700">
              Vui lòng mô tả vấn đề của bạn, các chuyên gia của chúng tôi sẽ trả lời bạn trong vòng 24 giờ.
            </p>
          </div>

          {/* Issue Topic Selector */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-1">
              Chủ đề vấn đề
            </label>
            <select 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
            >
              <option value="Khó khăn kỹ thuật">Khó khăn kỹ thuật</option>
              <option value="Tài khoản & Thanh toán">Tài khoản & Thanh toán</option>
              <option value="Yêu cầu tính năng">Yêu cầu tính năng</option>
              <option value="Câu hỏi khác">Câu hỏi khác</option>
            </select>
          </div>

          {/* Description Textarea */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-1">
              Mô tả
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Vui lòng thêm văn bản mô tả..."
              className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-800 placeholder-slate-300"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
            <button 
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-500 transition-all cursor-pointer"
            >
              Hủy
            </button>
            <button 
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#2f80ed] hover:bg-[#1c71dd] text-white text-xs font-bold transition-all shadow-md shadow-blue-500/10 cursor-pointer"
            >
              Gửi yêu cầu
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
