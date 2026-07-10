import React from 'react';
import { User } from '../types';
import { 
  LayoutDashboard, 
  FileEdit, 
  Inbox, 
  Laptop, 
  MessageSquare, 
  Settings, 
  Users, 
  LogOut,
  Bell,
  Calendar,
  CheckSquare,
  FileText,
  Shield,
  Tags,
  Scan
} from 'lucide-react';

interface SidebarProps {
  currentUser: User;
  allUsers: User[];
  onUserChange: (user: User) => void;
  currentTab: string;
  onTabChange: (tab: string) => void;
  pendingApprovalsCount: number;
  unreadNotificationsCount: number;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  allUsers,
  onUserChange,
  currentTab,
  onTabChange,
  pendingApprovalsCount,
  unreadNotificationsCount,
  onLogout
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Báo cáo & Phân tích', icon: LayoutDashboard },
    ...(currentUser.role !== 'admin' ? [
      { id: 'form-builder', label: 'Soạn đơn thông minh', icon: FileEdit, badge: null },
      { id: 'requests', label: 'Đơn từ của tôi', icon: Users, badge: null }
    ] : []),
    { 
      id: 'approvals', 
      label: 'Duyệt đơn từ', 
      icon: Inbox, 
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : null 
    },
    { id: 'docs-incoming', label: 'Văn bản đến', icon: FileEdit, badge: null },
    { id: 'docs-outgoing', label: 'Văn bản đi', icon: FileEdit, badge: null },
    { id: 'docs-internal', label: 'Công văn nội bộ', icon: FileText, badge: null },
    { id: 'events', label: 'Lịch công tác', icon: Calendar, badge: null },
    { id: 'tasks', label: 'Quản lý Dự án & Task', icon: CheckSquare, badge: null },
    { id: 'ocr-manager', label: 'Trích xuất OCR', icon: Scan, badge: null },
    { id: 'assets', label: 'Quản lý thiết bị', icon: Laptop, badge: null },
    { id: 'chat', label: 'Trò chuyện trực tiếp', icon: MessageSquare, badge: null },
    ...(currentUser.role === 'admin' ? [
      { id: 'user-management', label: 'Quản lý người dùng', icon: Users, badge: null },
      { id: 'audit-logs', label: 'Nhật ký hệ thống', icon: Shield, badge: null },
      { id: 'shared-categories', label: 'Danh mục chung', icon: Tags, badge: null }
    ] : [])
  ];

  return (
    <aside className="w-full md:w-68 bg-slate-900 text-slate-100 flex flex-col h-auto md:h-screen sticky top-0 border-r border-slate-800 z-30">
      {/* App Branding */}
      <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
        <div className="bg-indigo-600 p-2 rounded-lg text-white font-bold flex items-center justify-center">
          <Settings size={20} className="animate-spin-slow" />
        </div>
        <div>
          <h1 className="text-md font-semibold tracking-tight text-white">Workflow Engine</h1>
          <p className="text-xs text-indigo-400 font-mono">v1.2.0 - MVC Mode</p>
        </div>
      </div>

      {/* User Switcher Persona Panel */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/40">
        {/* Current Active User Profile */}
        <div className="flex items-center space-x-3">
          <img
            src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
            alt={currentUser.name}
            className="w-9 h-9 rounded-full object-cover border-2 border-indigo-500 animate-pulse"
            referrerPolicy="no-referrer"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-semibold truncate text-slate-100">{currentUser.name}</h4>
            <div className="flex items-center space-x-1.5">
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium inline-block uppercase ${
                currentUser.role === 'admin' 
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                  : currentUser.role === 'manager' 
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {currentUser.role}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {currentUser.department}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                <IconComponent 
                  size={16} 
                  className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-100'} 
                />
                <span>{item.label}</span>
              </div>
              {item.badge !== null && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive ? 'bg-indigo-700 text-white' : 'bg-rose-500/20 text-rose-300'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
        <div className="pt-2 border-t border-slate-800/40 mt-2">
          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-3.5 py-2 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all cursor-pointer"
          >
            <LogOut size={16} />
            <span>Đăng xuất tài khoản</span>
          </button>
        </div>
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/20 text-[10px] text-slate-500 flex flex-col space-y-1.5">
        <div className="flex justify-between">
          <span>Lương cơ bản:</span>
          <span className="font-semibold text-slate-300">{currentUser.salary.toLocaleString('vi-VN')} đ</span>
        </div>
        <div className="flex justify-between items-center text-[9px] text-slate-600 border-t border-slate-800/50 pt-1.5">
          <span>UTC Time: 2026-06-25</span>
          <span>Security OK</span>
        </div>
      </div>
    </aside>
  );
};
