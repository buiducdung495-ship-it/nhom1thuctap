import React, { useState, useEffect } from 'react';
import { AuditLog } from '../types';
import { Shield, Clock, Terminal, User, FileText } from 'lucide-react';

export const AuditLogManager: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/audit-logs');
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error(err);
    }
  };

  const sortedLogs = [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <Shield size={20} className="text-indigo-600" />
            <span>Nhật ký Hệ thống (Audit Log)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">Ghi nhận toàn bộ thao tác, truy cập và hoạt động của người dùng.</p>
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl shadow-xl overflow-hidden border border-slate-700">
        <div className="flex items-center px-4 py-3 bg-slate-800 border-b border-slate-700">
          <Terminal size={16} className="text-emerald-400 mr-2" />
          <span className="text-xs font-mono text-slate-300">system/audit-logs ~ tail -f</span>
        </div>
        <div className="p-4 max-h-[600px] overflow-y-auto space-y-3 font-mono text-[11px]">
          {sortedLogs.map(log => (
            <div key={log.id} className="flex flex-col md:flex-row md:items-center space-y-1 md:space-y-0 md:space-x-4 p-2 rounded hover:bg-slate-800/50 transition-colors border-l-2 border-slate-700 hover:border-emerald-500">
              <div className="text-slate-500 w-40 flex-shrink-0 flex items-center space-x-1">
                <Clock size={12} />
                <span>{new Date(log.timestamp).toLocaleString('vi-VN')}</span>
              </div>
              <div className="text-indigo-300 w-48 flex-shrink-0 truncate flex items-center space-x-1" title={log.userName}>
                <User size={12} />
                <span>{log.userName} ({log.userId})</span>
              </div>
              <div className="text-emerald-400 font-bold uppercase w-32 flex-shrink-0">
                {log.action}
              </div>
              <div className="text-slate-300 flex-1 truncate" title={log.details}>
                {log.details}
              </div>
              {log.ipAddress && (
                <div className="text-slate-500 text-[10px]">
                  IP: {log.ipAddress}
                </div>
              )}
            </div>
          ))}
          {logs.length === 0 && (
            <div className="text-slate-500 text-center py-10">
              Không có dữ liệu log.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
