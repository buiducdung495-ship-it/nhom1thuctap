import React, { useState, useEffect } from 'react';
import { InternalDocument, User } from '../types';
import { FileText, Plus, FileEdit, Trash2, Tag, Search, Eye, Sparkles, RefreshCw } from 'lucide-react';

interface InternalDocumentManagerProps {
  currentUser: User;
  users: User[];
}

export const InternalDocumentManager: React.FC<InternalDocumentManagerProps> = ({ currentUser, users }) => {
  const [documents, setDocuments] = useState<InternalDocument[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<InternalDocument | null>(null);
  const [formData, setFormData] = useState<Partial<InternalDocument>>({});
  const [isSummarizing, setIsSummarizing] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await fetch('/api/documents/internal');
      const data = await res.json();
      setDocuments(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isAdding) {
        await fetch('/api/documents/internal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            creatorId: currentUser.id,
            status: formData.status || 'draft'
          })
        });
      } else if (selectedDoc) {
        await fetch(`/api/documents/internal/${selectedDoc.id}`, {
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

  const handleSummarize = async () => {
    if (!formData.content) return;
    setIsSummarizing(true);
    try {
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: formData.content })
      });
      const data = await res.json();
      if (data.summary) {
        setFormData({ ...formData, content: formData.content + `\n\n--- Bản tóm tắt (AI) ---\n${data.summary}` });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Xóa công văn này?')) return;
    try {
      await fetch(`/api/documents/internal/${id}`, { method: 'DELETE' });
      fetchDocuments();
    } catch (err) {
      console.error(err);
    }
  };

  const getUserName = (id?: string) => {
    if (!id) return '';
    return users.find(u => u.id === id)?.name || id;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <FileText size={20} className="text-indigo-600" />
            <span>Công văn nội bộ</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">Thông báo, quyết định, quy chế, kế hoạch, báo cáo...</p>
        </div>
        <button
          onClick={() => { setIsAdding(true); setSelectedDoc(null); setFormData({}); }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-colors"
        >
          <Plus size={16} />
          <span>Thêm Công văn</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Tên công văn</th>
                <th className="px-4 py-3 font-semibold">Loại</th>
                <th className="px-4 py-3 font-semibold">Người tạo</th>
                <th className="px-4 py-3 font-semibold">Ngày tạo</th>
                <th className="px-4 py-3 font-semibold text-center">Trạng thái</th>
                <th className="px-4 py-3 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {documents.map(doc => (
                <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-800">{doc.title}</div>
                    <div className="text-[10px] text-slate-400">Phòng ban: {doc.departmentId}</div>
                  </td>
                  <td className="px-4 py-3 uppercase text-[10px] tracking-wider font-bold text-slate-500">
                    {doc.type}
                  </td>
                  <td className="px-4 py-3">
                    {getUserName(doc.creatorId)}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(doc.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                      doc.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {doc.status === 'published' ? 'Đã ban hành' : 'Bản nháp'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end space-x-2">
                      <button onClick={() => { setSelectedDoc(doc); setFormData(doc); }} className="p-1 text-slate-400 hover:text-indigo-600 transition-colors">
                        <FileEdit size={16} />
                      </button>
                      <button onClick={() => handleDelete(doc.id)} className="p-1 text-slate-400 hover:text-rose-600 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {documents.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    Chưa có công văn nội bộ nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {(isAdding || selectedDoc) && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">
                {isAdding ? 'Tạo Công văn nội bộ' : 'Cập nhật Công văn'}
              </h3>
              <button onClick={() => { setIsAdding(false); setSelectedDoc(null); }} className="text-slate-400 hover:text-slate-600">×</button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="internal-doc-form" onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Tên công văn</label>
                  <input type="text" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:border-indigo-500 outline-none" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Loại công văn</label>
                    <select value={formData.type || 'notice'} onChange={e => setFormData({...formData, type: e.target.value as any})} className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:border-indigo-500 outline-none">
                      <option value="notice">Thông báo</option>
                      <option value="decision">Quyết định</option>
                      <option value="regulation">Quy chế</option>
                      <option value="plan">Kế hoạch</option>
                      <option value="report">Báo cáo</option>
                      <option value="minutes">Biên bản</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Phòng ban ban hành</label>
                    <input type="text" value={formData.departmentId || ''} onChange={e => setFormData({...formData, departmentId: e.target.value})} className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:border-indigo-500 outline-none" required />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-end mb-1">
                    <label className="block text-[11px] font-semibold text-slate-500">Nội dung</label>
                    <button type="button" onClick={handleSummarize} disabled={isSummarizing || !formData.content} className={`flex items-center space-x-1 text-[10px] font-bold px-2 py-1 rounded bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors ${isSummarizing ? 'opacity-50' : ''}`}>
                      {isSummarizing ? <RefreshCw size={12} className="animate-spin" /> : <Sparkles size={12} />}
                      <span>Tóm tắt bằng AI</span>
                    </button>
                  </div>
                  <textarea value={formData.content || ''} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:border-indigo-500 outline-none min-h-[150px]" required />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Trạng thái</label>
                  <select value={formData.status || 'draft'} onChange={e => setFormData({...formData, status: e.target.value as any})} className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:border-indigo-500 outline-none">
                    <option value="draft">Bản nháp</option>
                    <option value="published">Ban hành</option>
                  </select>
                </div>
              </form>
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end space-x-3">
              <button onClick={() => { setIsAdding(false); setSelectedDoc(null); }} className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors">Hủy</button>
              <button type="submit" form="internal-doc-form" className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors">
                Lưu Công văn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
