import React, { useState } from 'react';
import { Notification } from '../types';
import { 
  Bell, 
  CheckCheck, 
  Info, 
  CheckCircle, 
  AlertTriangle, 
  MessageSquare,
  Coins,
  X
} from 'lucide-react';

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => Promise<void>;
  onMarkAllAsRead: () => Promise<void>;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'workflow':
        return <CheckCircle size={14} className="text-emerald-500 shrink-0" />;
      case 'asset':
        return <AlertTriangle size={14} className="text-amber-500 shrink-0" />;
      case 'chat':
        return <MessageSquare size={14} className="text-blue-500 shrink-0" />;
      case 'payment':
        return <Coins size={14} className="text-purple-500 shrink-0" />;
      default:
        return <Info size={14} className="text-slate-500 shrink-0" />;
    }
  };

  return (
    <div className="relative z-40">
      {/* Trigger Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full relative transition-colors cursor-pointer"
        id="notification-bell-btn"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 border-2 border-white rounded-full text-[9px] font-bold text-white flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Card */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-transparent" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 mt-2.5 w-80 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-slide-up">
            
            {/* Header */}
            <div className="p-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center text-xs">
              <span className="font-bold text-slate-800">Thông báo của bạn ({unreadCount})</span>
              {unreadCount > 0 && (
                <button
                  onClick={() => { onMarkAllAsRead(); setIsOpen(false); }}
                  className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer text-[10px]"
                >
                  <CheckCheck size={12} />
                  <span>Đọc tất cả</span>
                </button>
              )}
            </div>

            {/* List */}
            <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto text-xs">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <p>Không có thông báo mới.</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => { onMarkAsRead(notif.id); setIsOpen(false); }}
                    className={`p-3 text-left transition-all hover:bg-slate-50 cursor-pointer flex gap-2.5 ${
                      !notif.read ? 'bg-indigo-50/15' : 'opacity-70'
                    }`}
                  >
                    {getIcon(notif.type)}
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <h4 className={`font-semibold truncate text-[11.5px] ${!notif.read ? 'text-indigo-950' : 'text-slate-700'}`}>
                        {notif.title}
                      </h4>
                      <p className="text-[10px] text-slate-500 leading-relaxed truncate-2-lines">{notif.message}</p>
                      <span className="text-[9px] text-slate-400 font-mono block mt-1">
                        {new Date(notif.timestamp).toLocaleDateString('vi-VN')} {new Date(notif.timestamp).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        </>
      )}
    </div>
  );
};
