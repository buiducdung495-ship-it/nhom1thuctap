import React, { useState, useEffect } from 'react';
import { IncomingDocument, User } from '../types';
import { FileText, Plus, Search, Filter, Eye, Edit, CheckCircle, Clock } from 'lucide-react';

interface IncomingDocumentManagerProps {
  currentUser: User;
  users: User[];
}

export const IncomingDocumentManager: React.FC<IncomingDocumentManagerProps> = ({ currentUser, users }) => {
  const [documents, setDocuments] = useState<IncomingDocument[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isAdding, setIsAdding] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<IncomingDocument | null>(null);
  
  const [formData, setFormData] = useState<Partial<IncomingDocument>>({});

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await fetch('/api/documents/incoming');
      const data = await res.json();
      setDocuments(data);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(search.toLowerCase()) || doc.documentNumber.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isAdding) {
        await fetch('/api/documents/incoming', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            status: 'new',
            receivedDate: new Date().toISOString().split('T')[0]
          })
        });
      } else if (selectedDoc) {
        await fetch(`/api/documents/incoming/${selectedDoc.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }
      setIsAdding(false);
      setSelectedDoc(null);
      setFormData({});
      fetchDocuments();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <FileText size={20} className="text-indigo-600" />
            <span>Quản lý Văn bản đến</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">Tiếp nhận, đăng ký, phân loại và phân công xử lý văn bản.</p>
        </div>
        <button
          onClick={() => { setIsAdding(true); setSelectedDoc(null); setFormData({}); }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-colors"
        >
          <Plus size={16} />
          <span>Thêm Văn bản mới</span>
        </button>
      </div>

      <div className="flex items-center space-x-4 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo số ký hiệu hoặc trích yếu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border-none focus:ring-0 bg-slate-50 rounded-lg outline-none"
          />
        </div>
        <div className="flex items-center space-x-2 border-l border-slate-200 pl-4">
          <Filter size={14} className="text-slate-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs border-none bg-transparent focus:ring-0 outline-none cursor-pointer text-slate-600 font-medium"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="new">Mới nhận</option>
            <option value="assigned">Đã phân công</option>
            <option value="in_progress">Đang xử lý</option>
            <option value="completed">Đã hoàn thành</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200 text-[11px] text-slate-500 uppercase font-semibold">
            <tr>
              <th className="px-4 py-3">Số / Ký hiệu</th>
              <th className="px-4 py-3">Ngày VB</th>
              <th className="px-4 py-3">Cơ quan ban hành</th>
              <th className="px-4 py-3 w-1/3">Trích yếu nội dung</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredDocs.map(doc => (
              <tr key={doc.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <span className="font-semibold text-indigo-600 text-xs">{doc.documentNumber}</span>
                </td>
                <td className="px-4 py-3 text-xs">{doc.documentDate}</td>
                <td className="px-4 py-3 text-xs">{doc.sender}</td>
                <td className="px-4 py-3 text-xs">
                  <div className="font-medium text-slate-800 line-clamp-2">{doc.title}</div>
                  <div className="text-[10px] text-slate-400 mt-1 flex space-x-2">
                    <span className="px-1.5 py-0.5 bg-slate-100 rounded">{doc.category}</span>
                    {doc.urgency === 'urgent' && <span className="px-1.5 py-0.5 bg-rose-100 text-rose-600 rounded">Khẩn</span>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-[10px] font-medium flex items-center space-x-1 w-max ${
                    doc.status === 'new' ? 'bg-amber-100 text-amber-700' :
                    doc.status === 'assigned' ? 'bg-blue-100 text-blue-700' :
                    doc.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {doc.status === 'new' ? <Clock size={12} /> : doc.status === 'completed' ? <CheckCircle size={12} /> : <Eye size={12} />}
                    <span>
                      {doc.status === 'new' ? 'Mới nhận' : doc.status === 'assigned' ? 'Đã phân công' : doc.status === 'in_progress' ? 'Đang xử lý' : doc.status === 'completed' ? 'Hoàn thành' : 'Lưu trữ'}
                    </span>
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => { setSelectedDoc(doc); setFormData(doc); }}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    <Edit size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredDocs.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500 text-xs">
                  Không tìm thấy văn bản nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {(isAdding || selectedDoc) && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">
                {isAdding ? 'Thêm Văn bản đến mới' : 'Cập nhật Văn bản đến'}
              </h3>
              <button onClick={() => { setIsAdding(false); setSelectedDoc(null); }} className="text-slate-400 hover:text-slate-600">×</button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="doc-form" onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Số ký hiệu</label>
                    <input
                      type="text"
                      value={formData.documentNumber || ''}
                      onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:border-indigo-500 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Ngày ban hành</label>
                    <input
                      type="date"
                      value={formData.documentDate || ''}
                      onChange={(e) => setFormData({ ...formData, documentDate: e.target.value })}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:border-indigo-500 outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Cơ quan ban hành</label>
                  <input
                    type="text"
                    value={formData.sender || ''}
                    onChange={(e) => setFormData({ ...formData, sender: e.target.value })}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:border-indigo-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Trích yếu nội dung</label>
                  <textarea
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:border-indigo-500 outline-none min-h-[80px]"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Loại văn bản</label>
                    <select
                      value={formData.category || 'Công văn'}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:border-indigo-500 outline-none"
                    >
                      <option value="Công văn">Công văn</option>
                      <option value="Quyết định">Quyết định</option>
                      <option value="Thông báo">Thông báo</option>
                      <option value="Chỉ thị">Chỉ thị</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Độ khẩn</label>
                    <select
                      value={formData.urgency || 'normal'}
                      onChange={(e) => setFormData({ ...formData, urgency: e.target.value as any })}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:border-indigo-500 outline-none"
                    >
                      <option value="normal">Bình thường</option>
                      <option value="urgent">Khẩn</option>
                      <option value="very_urgent">Thượng khẩn</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Độ mật</label>
                    <select
                      value={formData.confidentiality || 'normal'}
                      onChange={(e) => setFormData({ ...formData, confidentiality: e.target.value as any })}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:border-indigo-500 outline-none"
                    >
                      <option value="normal">Bình thường</option>
                      <option value="confidential">Mật</option>
                      <option value="secret">Tối mật</option>
                    </select>
                  </div>
                </div>

                {selectedDoc && (
                  <>
                    <div className="border-t border-slate-100 pt-4 mt-4">
                      <label className="block text-[11px] font-semibold text-slate-500 mb-2">Phân công xử lý</label>
                      <select
                        multiple
                        value={formData.assignedTo || []}
                        onChange={(e) => {
                          const options = Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value);
                          setFormData({ ...formData, assignedTo: options, status: options.length > 0 ? 'assigned' : 'new' });
                        }}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:border-indigo-500 outline-none min-h-[80px]"
                      >
                        {users.map(u => (
                          <option key={u.id} value={u.id}>{u.name} ({u.department})</option>
                        ))}
                      </select>
                      <p className="text-[10px] text-slate-400 mt-1">Giữ Ctrl/Cmd để chọn nhiều người.</p>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">Trạng thái</label>
                      <select
                        value={formData.status || 'new'}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:border-indigo-500 outline-none"
                      >
                        <option value="new">Mới nhận</option>
                        <option value="assigned">Đã phân công</option>
                        <option value="in_progress">Đang xử lý</option>
                        <option value="completed">Đã hoàn thành</option>
                        <option value="archived">Lưu trữ</option>
                      </select>
                    </div>
                  </>
                )}
              </form>
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end space-x-3">
              <button
                onClick={() => { setIsAdding(false); setSelectedDoc(null); }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                form="doc-form"
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
              >
                Lưu Văn bản
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
