import React, { useState, useEffect } from 'react';
import { Event, User } from '../types';
import { Calendar as CalendarIcon, Plus, Clock, MapPin, Users, Edit, Trash2 } from 'lucide-react';

interface CalendarManagerProps {
  currentUser: User;
  users: User[];
}

export const CalendarManager: React.FC<CalendarManagerProps> = ({ currentUser, users }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState<Partial<Event>>({});

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/events');
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isAdding) {
        await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            organizerId: currentUser.id
          })
        });
      } else if (selectedEvent) {
        await fetch(`/api/events/${selectedEvent.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }
      setIsAdding(false);
      setSelectedEvent(null);
      setFormData({});
      fetchEvents();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Xóa sự kiện này?')) return;
    try {
      await fetch(`/api/events/${id}`, { method: 'DELETE' });
      fetchEvents();
    } catch (err) {
      console.error(err);
    }
  };

  const getUserName = (id?: string) => {
    if (!id) return '';
    return users.find(u => u.id === id)?.name || id;
  };

  const sortedEvents = [...events].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <CalendarIcon size={20} className="text-indigo-600" />
            <span>Lịch công tác / Lịch họp</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">Sắp xếp, quản lý lịch làm việc và mời người tham dự.</p>
        </div>
        <button
          onClick={() => { setIsAdding(true); setSelectedEvent(null); setFormData({ startTime: new Date().toISOString().slice(0,16), endTime: new Date(Date.now() + 3600000).toISOString().slice(0,16) }); }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-colors"
        >
          <Plus size={16} />
          <span>Tạo Sự kiện</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedEvents.map(evt => (
          <div key={evt.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow relative">
            <div className="flex justify-between items-start mb-3">
              <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                evt.type === 'meeting' ? 'bg-blue-100 text-blue-700' :
                evt.type === 'business_trip' ? 'bg-amber-100 text-amber-700' :
                evt.type === 'holiday' ? 'bg-emerald-100 text-emerald-700' :
                'bg-slate-100 text-slate-700'
              }`}>
                {evt.type === 'meeting' ? 'Họp' : evt.type === 'business_trip' ? 'Công tác' : evt.type === 'holiday' ? 'Ngày nghỉ' : 'Khác'}
              </span>
              
              {evt.organizerId === currentUser.id && (
                <div className="flex space-x-1">
                  <button onClick={() => { setSelectedEvent(evt); setFormData(evt); }} className="p-1 text-slate-400 hover:text-indigo-600"><Edit size={14}/></button>
                  <button onClick={() => handleDelete(evt.id)} className="p-1 text-slate-400 hover:text-rose-600"><Trash2 size={14}/></button>
                </div>
              )}
            </div>

            <h3 className="font-bold text-slate-800 text-sm mb-2">{evt.title}</h3>
            {evt.description && <p className="text-xs text-slate-500 mb-4 line-clamp-2">{evt.description}</p>}

            <div className="space-y-2 mt-auto">
              <div className="flex items-center space-x-2 text-xs text-slate-600">
                <Clock size={14} className="text-slate-400" />
                <span>{new Date(evt.startTime).toLocaleString('vi-VN')} - {new Date(evt.endTime).toLocaleTimeString('vi-VN')}</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-600">
                <MapPin size={14} className="text-slate-400" />
                <span className="truncate">{evt.location}</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-600">
                <Users size={14} className="text-slate-400" />
                <span className="truncate">{(evt.attendees || []).map(id => getUserName(id)).join(', ')}</span>
              </div>
            </div>
          </div>
        ))}
        {sortedEvents.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 text-sm bg-slate-50 rounded-xl border border-slate-200 border-dashed">
            Không có sự kiện nào sắp diễn ra.
          </div>
        )}
      </div>

      {(isAdding || selectedEvent) && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">
                {isAdding ? 'Thêm Sự kiện mới' : 'Cập nhật Sự kiện'}
              </h3>
              <button onClick={() => { setIsAdding(false); setSelectedEvent(null); }} className="text-slate-400 hover:text-slate-600">×</button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="event-form" onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Tiêu đề</label>
                  <input type="text" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:border-indigo-500 outline-none" required />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Mô tả chi tiết</label>
                  <textarea value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:border-indigo-500 outline-none min-h-[60px]" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Thời gian bắt đầu</label>
                    <input type="datetime-local" value={(formData.startTime || '').slice(0,16)} onChange={e => setFormData({...formData, startTime: new Date(e.target.value).toISOString()})} className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:border-indigo-500 outline-none" required />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Thời gian kết thúc</label>
                    <input type="datetime-local" value={(formData.endTime || '').slice(0,16)} onChange={e => setFormData({...formData, endTime: new Date(e.target.value).toISOString()})} className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:border-indigo-500 outline-none" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Loại sự kiện</label>
                    <select value={formData.type || 'meeting'} onChange={e => setFormData({...formData, type: e.target.value as any})} className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:border-indigo-500 outline-none">
                      <option value="meeting">Họp / Meeting</option>
                      <option value="business_trip">Công tác</option>
                      <option value="holiday">Nghỉ phép / Lễ</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Địa điểm</label>
                    <input type="text" value={formData.location || ''} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:border-indigo-500 outline-none" required />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-2">Người tham dự</label>
                  <select multiple value={formData.attendees || []} onChange={e => {
                    const options = Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value);
                    setFormData({...formData, attendees: options});
                  }} className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:border-indigo-500 outline-none min-h-[100px]">
                    {users.map(u => <option key={u.id} value={u.id}>{u.name} - {u.department}</option>)}
                  </select>
                  <p className="text-[10px] text-slate-400 mt-1">Giữ Ctrl/Cmd để chọn nhiều người.</p>
                </div>
              </form>
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end space-x-3">
              <button onClick={() => { setIsAdding(false); setSelectedEvent(null); }} className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors">Hủy</button>
              <button type="submit" form="event-form" className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors">
                Lưu Sự kiện
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
