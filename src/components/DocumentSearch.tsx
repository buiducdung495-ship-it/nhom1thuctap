import React, { useState } from 'react';
import { Document, User } from '../types';
import { Search, Filter, Calendar, Award, CheckCircle, Clock, AlertTriangle, FileSpreadsheet, Eye, RefreshCw, Layers } from 'lucide-react';

interface DocumentSearchProps {
  documents: Document[];
  currentUser: User;
  onViewDocument: (doc: Document) => void;
  onEditDocument: (doc: Document) => void;
}

export default function DocumentSearch({
  documents,
  currentUser,
  onViewDocument,
  onEditDocument
}: DocumentSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [scopeFilter, setScopeFilter] = useState<'all' | 'mine' | 'pending_me'>('all');

  React.useEffect(() => {
    if (currentUser.role === 'staff') {
      setScopeFilter('mine');
    } else if (currentUser.role === 'approver' || currentUser.role === 'leader') {
      setScopeFilter('pending_me');
    } else {
      setScopeFilter('all');
    }
  }, [currentUser.id, currentUser.role]);

  // Extract unique departments for filtering
  const departments = ['all', ...Array.from(new Set(documents.map(d => d.creatorDepartment)))];

  // Filtering logic
  const filteredDocuments = documents.filter(doc => {
    // 1. Keyword search (Title, Creator name, Content)
    const matchesKeyword = 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.creatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.content.toLowerCase().includes(searchTerm.toLowerCase());

    // 2. Status filter
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;

    // 3. Department filter
    const matchesDept = departmentFilter === 'all' || doc.creatorDepartment === departmentFilter;

    // 4. Scope filter
    let matchesScope = true;
    if (scopeFilter === 'mine') {
      matchesScope = doc.creatorId === currentUser.id;
    } else if (scopeFilter === 'pending_me') {
      if (doc.status !== 'pending') {
        matchesScope = false;
      } else {
        const activeStep = doc.approvalSteps.find(s => s.stepNumber === doc.currentStepNumber);
        matchesScope = !!(activeStep && activeStep.assignedUserId === currentUser.id);
      }
    }

    return matchesKeyword && matchesStatus && matchesDept && matchesScope;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-xxs font-bold">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            Đã duyệt ký số
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded text-xxs font-bold">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            Đã từ chối
          </span>
        );
      case 'editing_required':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded text-xxs font-bold animate-pulse">
            <RefreshCw className="w-3 h-3 text-amber-600 animate-spin-slow" />
            Yêu cầu sửa đổi
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded text-xxs font-bold">
            <Clock className="w-3 h-3 text-blue-600 animate-pulse" />
            Đang phê duyệt
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-150 shadow-xs overflow-hidden animate-slide-down" id="document-search-panel">
      
      {/* Dynamic Role-Based Scope Tabs */}
      <div className="flex flex-wrap border-b border-gray-150 bg-slate-50 px-5 pt-3 gap-1.5" id="scope-selector-tabs">
        {currentUser.role === 'staff' && (
          <>
            <button
              type="button"
              onClick={() => setScopeFilter('mine')}
              className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                scopeFilter === 'mine'
                  ? 'border-indigo-600 text-indigo-600 font-extrabold bg-white rounded-t-lg border-x border-t border-gray-150 -mb-[1px]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 rounded-t-lg'
              }`}
            >
              Hồ sơ của tôi đề xuất ({documents.filter(d => d.creatorId === currentUser.id).length})
            </button>
            <button
              type="button"
              onClick={() => setScopeFilter('all')}
              className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                scopeFilter === 'all'
                  ? 'border-indigo-600 text-indigo-600 font-extrabold bg-white rounded-t-lg border-x border-t border-gray-150 -mb-[1px]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 rounded-t-lg'
              }`}
            >
              Tất cả hồ sơ liên quan ({documents.length})
            </button>
          </>
        )}

        {(currentUser.role === 'approver' || currentUser.role === 'leader') && (
          <>
            <button
              type="button"
              onClick={() => setScopeFilter('pending_me')}
              className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                scopeFilter === 'pending_me'
                  ? 'border-indigo-600 text-indigo-600 font-extrabold bg-white rounded-t-lg border-x border-t border-gray-150 -mb-[1px]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 rounded-t-lg'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              Cần tôi ký duyệt / Thẩm định ({
                documents.filter(doc => {
                  if (doc.status !== 'pending') return false;
                  const activeStep = doc.approvalSteps.find(s => s.stepNumber === doc.currentStepNumber);
                  return activeStep && activeStep.assignedUserId === currentUser.id;
                }).length
              })
            </button>
            <button
              type="button"
              onClick={() => setScopeFilter('all')}
              className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                scopeFilter === 'all'
                  ? 'border-indigo-600 text-indigo-600 font-extrabold bg-white rounded-t-lg border-x border-t border-gray-150 -mb-[1px]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 rounded-t-lg'
              }`}
            >
              Tra cứu hồ sơ toàn bộ phòng ban ({documents.length})
            </button>
          </>
        )}

        {currentUser.role === 'admin' && (
          <>
            <button
              type="button"
              onClick={() => setScopeFilter('all')}
              className={`px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                scopeFilter === 'all'
                  ? 'border-indigo-600 text-indigo-600 font-extrabold bg-white rounded-t-lg border-x border-t border-gray-150 -mb-[1px]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 rounded-t-lg'
              }`}
            >
              Toàn bộ văn bản lưu hành ({documents.length})
            </button>
          </>
        )}
      </div>

      {/* Search Header and Inputs */}
      <div className="p-5 border-b border-gray-150 bg-slate-50/50 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-extrabold text-gray-800 tracking-wide flex items-center gap-1.5">
              <Search className="w-4 h-4 text-indigo-600" />
              {currentUser.role === 'staff' && 'CỔNG THEO DÕI TIẾN TRÌNH & SOẠN THẢO'}
              {currentUser.role === 'approver' && 'HỒ SƠ CHỜ THẨM ĐỊNH & PHÊ DUYỆT'}
              {currentUser.role === 'leader' && 'DANH MỤC PHÊ DUYỆT & CHỮ KÝ SỐ ĐIỆN TỬ CA'}
              {currentUser.role === 'admin' && 'QUẢN TRỊ TOÀN BỘ VĂN BẢN TRÊN HỆ THỐNG'}
            </h2>
            <p className="text-xxs text-gray-500 mt-0.5">
              {currentUser.role === 'staff' && 'Xem lại các biểu mẫu tự soạn thảo, trạng thái kiểm định và cập nhật văn bản bị trả lại.'}
              {currentUser.role === 'approver' && 'Thẩm định hồ sơ nội bộ phòng ban, duyệt nội dung và trình chuyển cấp lãnh đạo ký kết.'}
              {currentUser.role === 'leader' && 'Kiểm chứng hồ sơ trình duyệt tối cao và ký số CA hợp chuẩn pháp lý.'}
              {currentUser.role === 'admin' && 'Tra cứu, giám sát và can thiệp điều chỉnh luồng phê duyệt của tất cả các văn bản hiện hành.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1 text-xs font-bold text-gray-600 bg-white hover:bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Filter className="w-3.5 h-3.5" />
              Bộ lọc nâng cao
            </button>
          </div>
        </div>

        {/* Filters and Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6 relative">
            <input
              type="text"
              placeholder="Nhập từ khóa tìm kiếm (Tiêu đề, nội dung, người lập đề xuất...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs bg-white border border-gray-300 rounded-lg pl-8.5 pr-3 py-2 focus:ring-2 focus:ring-indigo-150 focus:border-indigo-500 focus:outline-none transition-colors"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          </div>

          {/* Status Quick Filters */}
          <div className="md:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-xs bg-white border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-150 focus:outline-none font-semibold text-gray-700"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Đang trình duyệt</option>
              <option value="approved">Đã ký duyệt xong</option>
              <option value="editing_required">Chờ sửa đổi (Trả lại)</option>
              <option value="rejected">Bị từ chối</option>
            </select>
          </div>

          {/* Department Quick Filters */}
          <div className="md:col-span-3">
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full text-xs bg-white border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-150 focus:outline-none font-semibold text-gray-700"
            >
              <option value="all">Tất cả phòng ban</option>
              {departments.filter(d => d !== 'all').map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showAdvanced && (
          <div className="p-3 bg-white border border-gray-200 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-3 animate-slide-down">
            <div className="flex flex-col gap-1 text-xxs">
              <span className="font-bold text-gray-600">Lọc theo sở hữu:</span>
              <div className="flex gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-1 rounded font-medium"
                >
                  Tất cả hồ sơ hệ thống
                </button>
                <button
                  type="button"
                  onClick={() => setSearchTerm(currentUser.name)}
                  className="bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 px-2 py-1 rounded font-medium"
                >
                  Hồ sơ tôi tạo
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1 text-xxs">
              <span className="font-bold text-gray-600">Sắp xếp theo thời gian:</span>
              <select className="bg-gray-50 border border-gray-200 p-1 rounded mt-1 font-medium text-gray-700">
                <option>Mới nhất xếp trước</option>
                <option>Cũ nhất xếp trước</option>
              </select>
            </div>

            <div className="flex flex-col gap-1 text-xxs">
              <span className="font-bold text-gray-600">Mã chữ ký:</span>
              <input
                type="text"
                placeholder="Ví dụ: SIG-NT-E"
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-50 border border-gray-200 p-1 rounded mt-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>
        )}
      </div>

      {/* Document Records List Table */}
      <div className="overflow-x-auto">
        {filteredDocuments.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-xxs font-bold text-gray-500 uppercase border-b border-gray-200">
                <th className="px-5 py-3">Mã VB / Tên văn bản trình duyệt</th>
                <th className="px-5 py-3">Phòng ban đề xuất</th>
                <th className="px-5 py-3">Trạng thái hồ sơ</th>
                <th className="px-5 py-3">Tiến độ quy trình</th>
                <th className="px-5 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150 text-xs text-gray-700 font-medium">
              {filteredDocuments.map(doc => {
                const isMine = doc.creatorId === currentUser.id;
                // Get active step info
                const activeStep = doc.approvalSteps.find(s => s.stepNumber === doc.currentStepNumber);
                const totalSteps = doc.approvalSteps.length;
                
                return (
                  <tr key={doc.id} className="hover:bg-indigo-50/10 transition-colors">
                    {/* Title and Creator */}
                    <td className="px-5 py-4 space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-xxs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                          {doc.id.toUpperCase()}
                        </span>
                        {isMine && (
                          <span className="bg-indigo-100 text-indigo-700 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                            Của tôi
                          </span>
                        )}
                        <h4 className="font-bold text-gray-800 hover:text-indigo-600 cursor-pointer" onClick={() => onViewDocument(doc)}>
                          {doc.title}
                        </h4>
                      </div>
                      <p className="text-xxs text-gray-400">
                        Đề xuất bởi: <strong className="text-gray-500">{doc.creatorName}</strong> &bull; {new Date(doc.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </td>

                    {/* Department */}
                    <td className="px-5 py-4">
                      <span className="text-xs text-gray-600 bg-gray-50 border border-gray-150 px-2 py-0.5 rounded-md font-medium">
                        {doc.creatorDepartment}
                      </span>
                    </td>

                    {/* Status badge */}
                    <td className="px-5 py-4">
                      {getStatusBadge(doc.status)}
                    </td>

                    {/* Process step and progress slider */}
                    <td className="px-5 py-4">
                      <div className="space-y-1 max-w-[150px]">
                        <div className="flex justify-between items-center text-xxs">
                          <span className="text-gray-400">Tiến trình:</span>
                          <span className="font-extrabold text-indigo-600">
                            {doc.status === 'approved' ? totalSteps : doc.status === 'draft' ? 0 : doc.currentStepNumber - 1}/{totalSteps} bước
                          </span>
                        </div>
                        {/* Progress slider bar */}
                        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${doc.status === 'approved' ? 'bg-emerald-500' : doc.status === 'rejected' ? 'bg-rose-500' : 'bg-indigo-600'}`}
                            style={{
                              width: `${doc.status === 'approved' ? 100 : ((doc.currentStepNumber - 1) / totalSteps) * 100}%`
                            }}
                          ></div>
                        </div>
                        {doc.status === 'pending' && activeStep && (
                          <p className="text-[10px] text-gray-500 italic truncate" title={`Chờ duyệt: ${activeStep.assignedUserName}`}>
                            Chờ: {activeStep.assignedUserName}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Action button */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onViewDocument(doc)}
                          className="text-indigo-600 hover:bg-indigo-50 border border-indigo-100 bg-white font-bold text-xxs px-2.5 py-1.5 rounded-md flex items-center gap-1 transition-all"
                          title="Xem xét & Ký duyệt văn bản"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Xem chi tiết
                        </button>
                        {doc.status === 'editing_required' && isMine && (
                          <button
                            onClick={() => onEditDocument(doc)}
                            className="text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 font-bold text-xxs px-2.5 py-1.5 rounded-md flex items-center gap-1 transition-all animate-pulse"
                            title="Chỉnh sửa nội dung và gửi lại phê duyệt"
                          >
                            <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
                            Sửa ngay
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center text-gray-400 space-y-2">
            <Search className="w-10 h-10 mx-auto text-gray-300" />
            <p className="text-sm font-semibold">Không tìm thấy văn bản phù hợp</p>
            <p className="text-xxs">Thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh bộ lọc trạng thái để ra kết quả.</p>
          </div>
        )}
      </div>

      {/* Pagination / Total count bar */}
      <div className="bg-slate-50 border-t border-gray-150 px-5 py-3 flex items-center justify-between text-xxs text-gray-500 font-semibold">
        <span>Hiển thị {filteredDocuments.length} trên tổng số {documents.length} văn bản lưu trữ</span>
        <div className="flex gap-1">
          <button className="border border-gray-200 bg-white px-2 py-1 rounded hover:bg-gray-50" disabled>Trước</button>
          <button className="border border-indigo-500 bg-indigo-50 text-indigo-600 px-2 py-1 rounded">1</button>
          <button className="border border-gray-200 bg-white px-2 py-1 rounded hover:bg-gray-50" disabled>Sau</button>
        </div>
      </div>
    </div>
  );
}
