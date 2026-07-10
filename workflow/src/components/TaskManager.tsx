import React, { useState, useEffect } from 'react';
import { Task, User } from '../types';
import { CheckSquare, Plus, Edit, Trash2, Clock, User as UserIcon, AlertCircle } from 'lucide-react';

interface TaskManagerProps {
  currentUser: User;
  users: User[];
}

export const TaskManager: React.FC<TaskManagerProps> = ({ currentUser, users }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState<Partial<Task>>({});

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isAdding) {
        await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            creatorId: currentUser.id,
            status: formData.status || 'todo',
            priority: formData.priority || 'medium'
          })
        });
      } else if (selectedTask) {
        await fetch(`/api/tasks/${selectedTask.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }
      setIsAdding(false);
      setSelectedTask(null);
      setFormData({});
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Xóa công việc này?')) return;
    try {
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const getUserName = (id?: string) => {
    if (!id) return '';
    return users.find(u => u.id === id)?.name || id;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'bg-slate-100 text-slate-700';
      case 'in_progress': return 'bg-blue-100 text-blue-700';
      case 'review': return 'bg-amber-100 text-amber-700';
      case 'done': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'todo': return 'Cần làm';
      case 'in_progress': return 'Đang xử lý';
      case 'review': return 'Chờ duyệt';
      case 'done': return 'Hoàn thành';
      default: return status;
    }
  };

  const columns = [
    { id: 'todo', title: 'Cần làm' },
    { id: 'in_progress', title: 'Đang xử lý' },
    { id: 'review', title: 'Chờ duyệt' },
    { id: 'done', title: 'Hoàn thành' }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <CheckSquare size={20} className="text-indigo-600" />
            <span>Quản lý Công việc & Dự án</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">Giao việc, theo dõi tiến độ và đánh giá kết quả (Kanban).</p>
        </div>
        <button
          onClick={() => { setIsAdding(true); setSelectedTask(null); setFormData({ dueDate: new Date().toISOString().slice(0,10) }); }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-colors"
        >
          <Plus size={16} />
          <span>Thêm Công việc</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1 items-start">
        {columns.map(col => {
          const colTasks = tasks.filter(t => t.status === col.id);
          return (
            <div key={col.id} className="bg-slate-50/50 rounded-xl p-3 border border-slate-200 h-full min-h-[500px]">
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="font-bold text-slate-700 text-sm">{col.title}</h3>
                <span className="bg-white text-slate-500 text-[10px] px-2 py-0.5 rounded-full border border-slate-200 font-bold">{colTasks.length}</span>
              </div>
              <div className="space-y-3">
                {colTasks.map(t => (
                  <div key={t.id} className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm hover:border-indigo-300 transition-colors cursor-pointer" onClick={() => { setSelectedTask(t); setFormData(t); }}>
                    <div className="flex justify-between items-start mb-2">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                        t.priority === 'high' ? 'bg-rose-100 text-rose-700' :
                        t.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {t.priority === 'high' ? 'Cao' : t.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                      </span>
                    </div>
                    <h4 className="font-semibold text-slate-800 text-xs leading-snug mb-2">{t.title}</h4>
                    <div className="flex items-center justify-between mt-3 text-[10px] text-slate-500">
                      <div className="flex items-center space-x-1" title="Người thực hiện">
                        <UserIcon size={12} className="text-indigo-400" />
                        <span className="truncate max-w-[80px]">{getUserName(t.assigneeId)}</span>
                      </div>
                      <div className="flex items-center space-x-1" title="Hạn chót">
                        <Clock size={12} className={new Date(t.dueDate) < new Date() && t.status !== 'done' ? 'text-rose-500' : 'text-slate-400'} />
                        <span className={new Date(t.dueDate) < new Date() && t.status !== 'done' ? 'text-rose-600 font-semibold' : ''}>
                          {new Date(t.dueDate).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {colTasks.length === 0 && (
                  <div className="border-2 border-dashed border-slate-200 rounded-lg h-24 flex items-center justify-center text-slate-400 text-xs">
                    Kéo thả vào đây...
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {(isAdding || selectedTask) && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">
                {isAdding ? 'Tạo Công việc mới' : 'Chi tiết Công việc'}
              </h3>
              <div className="flex items-center space-x-2">
                {selectedTask && (
                  <button onClick={() => handleDelete(selectedTask.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded">
                    <Trash2 size={16} />
                  </button>
                )}
                <button onClick={() => { setIsAdding(false); setSelectedTask(null); }} className="text-slate-400 hover:text-slate-600">×</button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="task-form" onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Tên công việc</label>
                  <input type="text" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:border-indigo-500 outline-none" required />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Mô tả chi tiết</label>
                  <textarea value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:border-indigo-500 outline-none min-h-[80px]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Người thực hiện</label>
                    <select value={formData.assigneeId || ''} onChange={e => setFormData({...formData, assigneeId: e.target.value})} className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:border-indigo-500 outline-none" required>
                      <option value="">Chọn người thực hiện</option>
                      {users.map(u => <option key={u.id} value={u.id}>{u.name} - {u.department}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Hạn chót</label>
                    <input type="date" value={(formData.dueDate || '').slice(0,10)} onChange={e => setFormData({...formData, dueDate: new Date(e.target.value).toISOString()})} className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:border-indigo-500 outline-none" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Độ ưu tiên</label>
                    <select value={formData.priority || 'medium'} onChange={e => setFormData({...formData, priority: e.target.value as any})} className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:border-indigo-500 outline-none">
                      <option value="low">Thấp</option>
                      <option value="medium">Trung bình</option>
                      <option value="high">Cao</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Trạng thái</label>
                    <select value={formData.status || 'todo'} onChange={e => setFormData({...formData, status: e.target.value as any})} className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:border-indigo-500 outline-none">
                      <option value="todo">Cần làm</option>
                      <option value="in_progress">Đang xử lý</option>
                      <option value="review">Chờ duyệt</option>
                      <option value="done">Hoàn thành</option>
                    </select>
                  </div>
                </div>
                {selectedTask && (
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center space-x-2 text-[10px] text-slate-500">
                    <AlertCircle size={14} className="text-slate-400" />
                    <span>Người giao việc: {getUserName(selectedTask.creatorId)}</span>
                  </div>
                )}
              </form>
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end space-x-3">
              <button onClick={() => { setIsAdding(false); setSelectedTask(null); }} className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors">Hủy</button>
              <button type="submit" form="task-form" className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors">
                Lưu Công việc
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
