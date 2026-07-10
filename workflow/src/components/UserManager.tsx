import React, { useState } from 'react';
import { User } from '../types';
import { Users, UserPlus, Pencil, Trash2, Key, Shield, LogIn } from 'lucide-react';

interface UserManagerProps {
  users: User[];
  currentUser: User;
  onUserUpdate: () => void;
}

export const UserManager: React.FC<UserManagerProps> = ({ users, currentUser, onUserUpdate }) => {
  const [isEditing, setIsEditing] = useState<User | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  const [formData, setFormData] = useState<Partial<User>>({});
  const [errorMsg, setErrorMsg] = useState('');

  const departments = ['Tech', 'HR', 'Finance', 'Sales', 'Admin'];
  const roles = ['admin', 'manager', 'employee'];

  const handleEdit = (user: User) => {
    setIsEditing(user);
    setFormData(user);
    setIsAdding(false);
    setErrorMsg('');
  };

  const handleAdd = () => {
    setIsAdding(true);
    setIsEditing(null);
    setFormData({
      id: `emp-${Math.floor(Math.random() * 10000)}`,
      role: 'employee',
      department: 'Tech'
    });
    setErrorMsg('');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Xóa thất bại');
      onUserUpdate();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isAdding) {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Lỗi thêm mới');
        }
      } else if (isEditing) {
        const res = await fetch(`/api/users/${isEditing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Lỗi cập nhật');
        }
      }
      setIsEditing(null);
      setIsAdding(false);
      onUserUpdate();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Quản lý Người dùng</h2>
          <p className="text-xs text-slate-500 mt-1">Phân quyền, tài khoản, SSO & phân quyền truy cập E-Office.</p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-colors"
        >
          <UserPlus size={16} />
          <span>Thêm Nhân sự</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase">
                <tr>
                  <th className="px-4 py-3 font-semibold">Tài khoản</th>
                  <th className="px-4 py-3 font-semibold">Vai trò</th>
                  <th className="px-4 py-3 font-semibold">Phòng ban</th>
                  <th className="px-4 py-3 font-semibold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-3">
                        <img src={u.avatar} alt="" className="w-8 h-8 rounded-full border border-slate-200 object-cover" />
                        <div>
                          <p className="font-semibold text-slate-800 text-xs">{u.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{u.id} • {u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase ${
                        u.role === 'admin' ? 'bg-rose-100 text-rose-600 border border-rose-200' :
                        u.role === 'manager' ? 'bg-amber-100 text-amber-600 border border-amber-200' :
                        'bg-emerald-100 text-emerald-600 border border-emerald-200'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-medium">{u.department}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end space-x-2">
                        <button onClick={() => handleEdit(u)} className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDelete(u.id)} className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors" disabled={u.id === currentUser.id}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          {(isEditing || isAdding) && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <h3 className="font-bold text-sm mb-4 flex items-center space-x-2">
                {isAdding ? <UserPlus size={16} className="text-indigo-600" /> : <Pencil size={16} className="text-indigo-600" />}
                <span>{isAdding ? 'Thêm mới Nhân sự' : 'Cập nhật Nhân sự'}</span>
              </h3>
              
              {errorMsg && (
                <div className="mb-4 p-2 bg-rose-50 text-rose-600 text-xs rounded border border-rose-100">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Mã nhân viên (ID)</label>
                  <input
                    type="text"
                    value={formData.id || ''}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    disabled={!isAdding}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none disabled:bg-slate-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Họ tên</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    value={formData.phoneNumber || ''}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Vai trò</label>
                    <select
                      value={formData.role || 'employee'}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-white"
                    >
                      {roles.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Phòng ban</label>
                    <select
                      value={formData.department || 'Tech'}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value as any })}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-white"
                    >
                      {departments.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex space-x-3">
                  <button
                    type="button"
                    onClick={() => { setIsEditing(null); setIsAdding(false); }}
                    className="flex-1 px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                  >
                    Lưu
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Dummy SSO/OTP Panel */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-sm flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Shield size={16} className="text-emerald-500" />
              <span>Bảo mật hệ thống (SSO & OTP)</span>
            </h3>
            
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <Key size={14} className="text-slate-400" />
                <span className="font-medium text-slate-700">Xác thực 2 bước (OTP)</span>
              </div>
              <div className="w-8 h-4 bg-emerald-500 rounded-full relative cursor-not-allowed">
                <div className="absolute right-1 top-0.5 w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <LogIn size={14} className="text-slate-400" />
                <span className="font-medium text-slate-700">Đăng nhập một lần (SSO)</span>
              </div>
              <div className="w-8 h-4 bg-slate-200 rounded-full relative cursor-not-allowed">
                <div className="absolute left-1 top-0.5 w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Login Logs Panel */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-sm flex items-center space-x-2 border-b border-slate-100 pb-3">
              <LogIn size={16} className="text-indigo-500" />
              <span>Nhật ký đăng nhập gần đây</span>
            </h3>
            <div className="space-y-3">
              {[
                { time: '10 phút trước', ip: '192.168.1.105', status: 'Thành công' },
                { time: '1 giờ trước', ip: '113.190.23.45', status: 'Thành công' },
                { time: 'Hôm qua', ip: '116.108.77.2', status: 'Thất bại (Sai mật khẩu)' }
              ].map((log, i) => (
                <div key={i} className="flex justify-between items-center text-xs border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                  <div>
                    <p className="font-semibold text-slate-700">{log.time}</p>
                    <p className="text-[10px] text-slate-400 font-mono">IP: {log.ip}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-medium ${
                    log.status.includes('Thành công') ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                  }`}>
                    {log.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
