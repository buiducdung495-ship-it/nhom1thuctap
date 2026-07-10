import React, { useState, useEffect } from 'react';
import { OutgoingDocument, User } from '../types';
import { FileOutput, Plus, Search, Filter, Eye, Edit, Send, CheckCircle, FileSignature } from 'lucide-react';

interface OutgoingDocumentManagerProps {
  currentUser: User;
  users: User[];
}

export const OutgoingDocumentManager: React.FC<OutgoingDocumentManagerProps> = ({ currentUser, users }) => {
  const [documents, setDocuments] = useState<OutgoingDocument[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isAdding, setIsAdding] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<OutgoingDocument | null>(null);
  
  const [formData, setFormData] = useState<Partial<OutgoingDocument>>({});

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await fetch('/api/documents/outgoing');
      const data = await res.json();
      setDocuments(data);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
    const matchesRole = currentUser.role === 'admin' || doc.drafterId === currentUser.id || doc.approverId === currentUser.id || doc.signerId === currentUser.id;
    return matchesSearch && matchesStatus && matchesRole;
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isAdding) {
        await fetch('/api/documents/outgoing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            drafterId: currentUser.id,
            departmentId: currentUser.department,
            status: 'draft'
          })
        });
      } else if (selectedDoc) {
        await fetch(`/api/documents/outgoing/${selectedDoc.id}`, {
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

  const handleAction = async (doc: OutgoingDocument, newStatus: string) => {
    try {
      await fetch(`/api/documents/outgoing/${doc.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...doc, status: newStatus })
      });
      fetchDocuments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSign = async (doc: OutgoingDocument) => {
    if (!window.confirm('Xác nhận sử dụng Chữ ký số CA để ký văn bản này?')) return;
    try {
      // Create Audit Log for Digital Signature
      await fetch('/api/audit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          action: 'sign_document',
          targetId: doc.id,
          targetType: 'outgoing_document',
          details: { message: 'Ký số thành công (Simulated HSM)' }
        })
      });

      await fetch(`/api/documents/outgoing/${doc.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...doc, status: 'signed', isSigned: true })
      });
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
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
            <FileOutput size={20} className="text-indigo-600" />
            <span>Quản lý Văn bản đi</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">Soạn thảo, trình ký, phê duyệt, ký số và ban hành.</p>
        </div>
        <button
          onClick={() => { setIsAdding(true); setSelectedDoc(null); setFormData({}); }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-colors"
        >
          <Plus size={16} />
          <span>Tạo Văn bản đi</span>
        </button>
      </div>

      <div className="flex items-center space-x-4 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo trích yếu..."
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
            <option value="draft">Bản nháp</option>
            <option value="submitted">Trình ký</option>
            <option value="approved">Đã duyệt</option>
            <option value="signed">Đã ký số</option>
            <option value="issued">Đã ban hành</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200 text-[11px] text-slate-500 uppercase font-semibold">
            <tr>
              <th className="px-4 py-3 w-1/3">Trích yếu nội dung</th>
              <th className="px-4 py-3">Loại VB</th>
              <th className="px-4 py-3">Người soạn</th>
              <th className="px-4 py-3">Nơi nhận</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredDocs.map(doc => (
              <tr key={doc.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-xs">
                  <div className="font-medium text-slate-800 line-clamp-2">{doc.title}</div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {doc.departmentId}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs">
                  <span className="px-2 py-1 bg-slate-100 rounded text-slate-600">{doc.documentType}</span>
                </td>
                <td className="px-4 py-3 text-xs font-medium text-slate-700">{getUserName(doc.drafterId)}</td>
                <td className="px-4 py-3 text-xs line-clamp-2">{doc.recipient || '-'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-[10px] font-medium flex items-center space-x-1 w-max ${
                    doc.status === 'draft' ? 'bg-slate-100 text-slate-600' :
                    doc.status === 'submitted' ? 'bg-amber-100 text-amber-700' :
                    doc.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                    doc.status === 'signed' ? 'bg-indigo-100 text-indigo-700' :
                    doc.status === 'issued' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-rose-100 text-rose-700'
                  }`}>
                    {doc.status === 'draft' ? <Edit size={12} /> : doc.status === 'submitted' ? <Send size={12} /> : doc.status === 'signed' ? <FileSignature size={12} /> : <CheckCircle size={12} />}
                    <span>
                      {doc.status === 'draft' ? 'Bản nháp' : doc.status === 'submitted' ? 'Trình ký' : doc.status === 'approved' ? 'Đã duyệt' : doc.status === 'signed' ? 'Đã ký số' : doc.status === 'issued' ? 'Đã ban hành' : 'Từ chối'}
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 flex items-center space-x-2">
                <FileSignature size={18} className="text-indigo-600" />
                <span>{isAdding ? 'Soạn thảo Văn bản đi' : 'Chi tiết Văn bản đi'}</span>
              </h3>
              <button onClick={() => { setIsAdding(false); setSelectedDoc(null); }} className="text-slate-400 hover:text-slate-600">×</button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 grid grid-cols-3 gap-6">
              <div className="col-span-2 space-y-4">
                <form id="doc-form" onSubmit={handleSave} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Trích yếu nội dung</label>
                    <input
                      type="text"
                      value={formData.title || ''}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:border-indigo-500 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Nội dung văn bản</label>
                    <textarea
                      value={formData.content || ''}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:border-indigo-500 outline-none min-h-[250px] font-mono leading-relaxed"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Nơi nhận</label>
                    <input
                      type="text"
                      value={formData.recipient || ''}
                      onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:border-indigo-500 outline-none"
                    />
                  </div>
                </form>
              </div>

              <div className="col-span-1 border-l border-slate-100 pl-6 space-y-5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Loại văn bản</label>
                  <select
                    value={formData.documentType || 'Công văn'}
                    onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
                    className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:border-indigo-500 outline-none"
                  >
                    <option value="Công văn">Công văn</option>
                    <option value="Quyết định">Quyết định</option>
                    <option value="Thông báo">Thông báo</option>
                    <option value="Tờ trình">Tờ trình</option>
                    <option value="Báo cáo">Báo cáo</option>
                  </select>
                </div>

                {selectedDoc && (
                  <>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">Quy trình (Workflow)</label>
                      <select
                        value={formData.status || 'draft'}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:border-indigo-500 outline-none"
                      >
                        <option value="draft">Bản nháp</option>
                        <option value="submitted">Trình ký</option>
                        {currentUser.role === 'manager' || currentUser.role === 'admin' ? (
                          <>
                            <option value="approved">Duyệt (Trưởng phòng)</option>
                            <option value="signed">Ký số (Ban Giám đốc)</option>
                          </>
                        ) : null}
                        {currentUser.role === 'admin' ? (
                          <option value="issued">Ban hành (Văn thư)</option>
                        ) : null}
                        <option value="rejected">Từ chối</option>
                      </select>
                    </div>

                    {(formData.status === 'signed' || formData.status === 'issued') && (
                      <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                        <p className="text-[10px] font-bold text-emerald-700 flex items-center space-x-1 mb-1">
                          <CheckCircle size={12} />
                          <span>Đã ký số thành công</span>
                        </p>
                        <p className="text-[9px] text-emerald-600 font-mono">
                          ID: {formData.id}<br/>
                          Ký bởi: {getUserName(formData.signerId || currentUser.id)}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
              <span className="text-[10px] text-slate-400">
                {selectedDoc ? `Người soạn: ${getUserName(selectedDoc.drafterId)}` : `Người soạn: ${currentUser.name}`}
              </span>
              <div className="flex space-x-3">
                <button
                  onClick={() => { setIsAdding(false); setSelectedDoc(null); }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  Hủy
                </button>
                {selectedDoc && selectedDoc.status === 'approved' && (
                  <button
                    type="button"
                    onClick={() => handleSign(selectedDoc)}
                    className="px-4 py-2 text-xs font-semibold text-emerald-700 bg-emerald-100 border border-emerald-200 hover:bg-emerald-200 rounded-lg transition-colors flex items-center space-x-1"
                  >
                    <FileSignature size={14} />
                    <span>Ký số CA</span>
                  </button>
                )}
                <button
                  type="submit"
                  form="doc-form"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                >
                  {isAdding ? 'Tạo Bản nháp' : 'Lưu cập nhật'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
