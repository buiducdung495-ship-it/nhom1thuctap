import React, { useState } from 'react';
import { User, Document, LiveApprovalStep, ApprovalHistoryItem } from '../types';
import { CheckCircle2, XCircle, Share2, Clipboard, FileText, ChevronRight, UserPlus, FileCheck, Info, MessageSquare } from 'lucide-react';

interface DocumentReviewProps {
  currentUser: User;
  document: Document;
  allUsers: User[];
  onApprove: (docId: string, comment: string, signatureCode: string) => void;
  onReject: (docId: string, comment: string, isCorrectionRequired: boolean) => void; // Reject or request edit
  onDelegate: (docId: string, delegatedUserId: string, comment: string) => void;
  onClose: () => void;
}

export default function DocumentReview({
  currentUser,
  document,
  allUsers,
  onApprove,
  onReject,
  onDelegate,
  onClose
}: DocumentReviewProps) {
  const [comment, setComment] = useState('');
  const [digitalSignatureInput, setDigitalSignatureInput] = useState(currentUser.signatureCode || '');
  const [selectedDelegateId, setSelectedDelegateId] = useState('');
  const [showDelegateSection, setShowDelegateSection] = useState(false);
  const [actionError, setActionError] = useState('');
  const [activeTab, setActiveTab] = useState<'content' | 'history'>('content');

  // Check if current user is indeed the authorized reviewer for the CURRENT active step
  const currentActiveStep = document.approvalSteps.find(s => s.stepNumber === document.currentStepNumber);
  const isAuthorizedToReview = 
    document.status === 'pending' &&
    currentActiveStep &&
    (currentActiveStep.assignedUserId === currentUser.id || 
     (currentActiveStep.role === currentUser.role && currentActiveStep.status === 'pending'));

  // Filter other eligible approvers for delegation
  const delegatableUsers = allUsers.filter(u => 
    u.id !== currentUser.id && 
    (u.role === 'approver' || u.role === 'leader') && 
    u.active
  );

  const handleApproveAction = (e: React.FormEvent) => {
    e.preventDefault();
    setActionError('');

    if (!digitalSignatureInput.trim()) {
      setActionError('Vui lòng nhập Mã Chữ Ký Số điện tử hợp lệ để xác thực quyết định ký duyệt.');
      return;
    }

    onApprove(document.id, comment, digitalSignatureInput);
  };

  const handleRejectAction = (isCorrection: boolean) => {
    setActionError('');
    if (!comment.trim()) {
      setActionError('Vui lòng nhập Lý Do / Nhận Xét phản hồi để người tạo biết cần bổ sung nội dung gì.');
      return;
    }
    onReject(document.id, comment, isCorrection);
  };

  const handleDelegateAction = (e: React.FormEvent) => {
    e.preventDefault();
    setActionError('');

    if (!selectedDelegateId) {
      setActionError('Vui lòng chọn nhân sự ủy quyền trong danh sách phòng ban.');
      return;
    }
    if (!comment.trim()) {
      setActionError('Vui lòng nhập lý do/ghi chú ủy quyền xử lý văn bản.');
      return;
    }

    onDelegate(document.id, selectedDelegateId, comment);
    setShowDelegateSection(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">Đã ký duyệt</span>;
      case 'rejected':
        return <span className="bg-rose-50 border border-rose-200 text-rose-700 px-3 py-1 rounded-full text-xs font-bold">Đã từ chối</span>;
      case 'editing_required':
        return <span className="bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1 rounded-full text-xs font-bold">Yêu cầu sửa đổi</span>;
      default:
        return <span className="bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1 rounded-full text-xs font-bold animate-pulse">Đang thẩm định</span>;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-150 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 max-w-7xl mx-auto" id="document-review-detail-pane">
      
      {/* LEFT COLUMN: Document Content Viewer (7 columns) */}
      <div className="lg:col-span-7 border-r border-gray-150 flex flex-col h-full bg-slate-50/50">
        <div className="border-b border-gray-150 px-6 py-4 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <span className="text-xs font-bold text-gray-400">CHI TIẾT VĂN BẢN</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('content')}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'content' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Nội dung văn bản
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === 'history' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Lịch sử duyệt ({document.history.length})
            </button>
          </div>
        </div>

        {activeTab === 'content' ? (
          <div className="p-6 space-y-6 overflow-y-auto flex-1 max-h-[70vh]">
            {/* Document Header Metadata */}
            <div className="bg-white p-5 rounded-xl border border-gray-150 shadow-xxs space-y-3.5">
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-base font-extrabold text-gray-900 leading-snug">{document.title}</h1>
                {getStatusBadge(document.status)}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-gray-100 text-xs">
                <div>
                  <span className="text-gray-400 block font-medium">Người đề xuất:</span>
                  <span className="font-bold text-gray-700">{document.creatorName}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Bộ phận chuyên môn:</span>
                  <span className="font-bold text-gray-700">{document.creatorDepartment}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Ngày lập trình duyệt:</span>
                  <span className="font-bold text-gray-700">{new Date(document.createdAt).toLocaleString('vi-VN')}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium">Quy trình áp dụng:</span>
                  <span className="font-bold text-indigo-600 underline">{document.workflowName}</span>
                </div>
              </div>
            </div>

            {/* Official Document Body Mock */}
            <div className="bg-white p-8 rounded-xl border border-gray-150 shadow-xs relative">
              {/* Seal Stamp if approved */}
              {document.status === 'approved' && document.digitalSignature && (
                <div className="absolute right-8 top-8 border-4 border-emerald-600 text-emerald-600 font-mono font-black uppercase text-xs tracking-widest px-4 py-2 rounded-lg rotate-12 scale-105 opacity-85 select-none bg-white/90">
                  <p className="text-center">ĐÃ KÝ SỐ</p>
                  <p className="text-xxs font-normal normal-case mt-0.5">{document.digitalSignature.signedBy}</p>
                  <p className="text-[8px] font-mono normal-case tracking-normal">{document.digitalSignature.certificateCode}</p>
                </div>
              )}

              <div className="space-y-6 text-sm text-gray-800 leading-relaxed font-sans whitespace-pre-wrap font-medium">
                {document.content}
              </div>

              {/* Digital Signature block inside content */}
              {document.status === 'approved' && document.digitalSignature && (
                <div className="mt-12 pt-6 border-t border-dashed border-gray-200 flex justify-end">
                  <div className="text-right border border-emerald-150 bg-emerald-50/40 p-3 rounded-lg max-w-sm">
                    <p className="text-xs font-bold text-emerald-800 flex items-center gap-1 justify-end">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      Ký số điện tử bảo mật
                    </p>
                    <p className="text-xs text-gray-600 mt-1">Ký bởi: <strong>{document.digitalSignature.signedBy}</strong></p>
                    <p className="text-xxs text-gray-500">Thời gian: {new Date(document.digitalSignature.signedAt).toLocaleString('vi-VN')}</p>
                    <p className="text-xxs font-mono text-gray-400 mt-0.5">Mã chứng chỉ: {document.digitalSignature.certificateCode}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Attachments Section */}
            {document.attachments && document.attachments.length > 0 && (
              <div className="bg-white p-5 rounded-xl border border-gray-150 shadow-xxs space-y-3">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tài liệu bổ trợ đính kèm ({document.attachments.length})</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {document.attachments.map(att => (
                    <div key={att.id} className="flex items-center justify-between border border-gray-200 hover:border-indigo-200 p-2.5 rounded-lg bg-gray-50/50 transition-colors">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                        <div className="min-w-0 text-xs">
                          <p className="font-bold text-gray-700 truncate">{att.name}</p>
                          <p className="text-xxs text-gray-400">{att.size}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => alert(`Mô phỏng: Đang tải xuống tài liệu ${att.name}...`)}
                        className="text-xxs font-semibold text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded border border-indigo-100 bg-white transition-colors"
                      >
                        Tải xuống
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Audit Trail / Lịch sử phê duyệt */
          <div className="p-6 overflow-y-auto flex-1 max-h-[70vh]">
            <div className="relative pl-6 space-y-6 border-l-2 border-indigo-100 ml-4 py-2">
              {document.history.map((hist, idx) => {
                const getActionColor = (action: string) => {
                  switch (action) {
                    case 'approve': return 'bg-emerald-500 border-white text-white';
                    case 'reject': return 'bg-rose-500 border-white text-white';
                    case 'edit_request': return 'bg-amber-500 border-white text-white';
                    case 'delegate': return 'bg-indigo-500 border-white text-white';
                    default: return 'bg-gray-400 border-white text-white';
                  }
                };
                return (
                  <div key={idx} className="relative">
                    {/* Action Icon container */}
                    <div className={`absolute -left-[35px] top-0 w-6.5 h-6.5 rounded-full border-2 flex items-center justify-center text-xs ${getActionColor(hist.action)}`}>
                      {idx + 1}
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-150 shadow-xxs">
                      <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                        <span className="font-bold text-gray-800">{hist.actor} ({hist.role.toUpperCase()})</span>
                        <span className="text-gray-400 font-medium">{new Date(hist.timestamp).toLocaleString('vi-VN')}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 font-semibold">{hist.details}</p>
                      {hist.comment && (
                        <div className="mt-2 text-xs bg-slate-50 border border-slate-100 p-2.5 rounded text-gray-700 italic flex items-start gap-1">
                          <MessageSquare className="w-3.5 h-3.5 mt-0.5 text-gray-400 shrink-0" />
                          <span>&ldquo;{hist.comment}&rdquo;</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Action Center (5 columns) */}
      <div className="lg:col-span-5 p-6 space-y-6 flex flex-col justify-between h-full bg-white">
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-gray-150 pb-3">
            <h3 className="text-sm font-extrabold text-gray-800 tracking-wide">TRUNG TÂM XỬ LÝ HỒ SƠ</h3>
            <button
              onClick={onClose}
              className="text-xs font-bold text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded"
            >
              Đóng lại
            </button>
          </div>

          {/* Flow Steps Tracker Progress */}
          <div className="space-y-3">
            <span className="text-xxs font-bold text-gray-500 uppercase tracking-wider block">Tiến độ phê duyệt:</span>
            <div className="space-y-2.5">
              {document.approvalSteps.map((step) => {
                const isCurrent = document.status === 'pending' && step.stepNumber === document.currentStepNumber;
                const isApproved = step.status === 'approved';
                const isRejected = step.status === 'rejected';
                
                return (
                  <div
                    key={step.stepNumber}
                    className={`p-3 rounded-lg border flex items-center justify-between gap-3 text-xs transition-all ${
                      isCurrent 
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-150'
                        : isApproved
                        ? 'border-emerald-150 bg-emerald-50/10'
                        : 'border-gray-150 bg-gray-50/30'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                        isApproved 
                          ? 'bg-emerald-600 text-white' 
                          : isRejected 
                          ? 'bg-rose-500 text-white'
                          : isCurrent 
                          ? 'bg-indigo-600 text-white animate-pulse' 
                          : 'bg-gray-200 text-gray-500'
                      }`}>
                        {step.stepNumber}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{step.label}</p>
                        <p className="text-xxs text-gray-500">
                          Người ký: <span className="font-medium text-gray-700">{step.assignedUserName}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {isApproved ? (
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">Đã ký duyệt</span>
                      ) : isRejected ? (
                        <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-100">Từ chối</span>
                      ) : isCurrent ? (
                        <span className="text-indigo-700 font-bold bg-indigo-100 px-2 py-0.5 rounded border border-indigo-200 animate-pulse">Chờ thẩm định</span>
                      ) : (
                        <span className="text-gray-400 font-semibold bg-gray-100 px-2 py-0.5 rounded">Chờ lượt</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Decision Action Panel if authorized */}
          {isAuthorizedToReview ? (
            <div className="bg-slate-50 border border-indigo-100 rounded-xl p-4.5 space-y-4 shadow-xxs">
              <div className="flex items-center gap-1.5">
                <Info className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wide">BẠN LÀ NGƯỜI DUYỆT BƯỚC NÀY</h4>
              </div>

              {actionError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-2 rounded-lg text-xs font-medium">
                  {actionError}
                </div>
              )}

              {/* Action Form */}
              {!showDelegateSection ? (
                <form onSubmit={handleApproveAction} className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-700" htmlFor="reviewer-feedback-textarea">
                      Nhận xét / Ý kiến phản hồi (Ghi chú):
                    </label>
                    <textarea
                      id="reviewer-feedback-textarea"
                      rows={3}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Nhập ghi chú ý kiến phê duyệt hoặc lý do yêu cầu sửa đổi..."
                      className="w-full text-xs bg-white border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-150 focus:outline-none font-medium"
                    />
                  </div>

                  {/* Ký số điện tử input */}
                  <div className="flex flex-col gap-1.5 border-t border-gray-200 pt-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-gray-800" htmlFor="reviewer-signature-code-input">
                        Mã chữ ký số xác thực chứng thư <span className="text-rose-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setDigitalSignatureInput(currentUser.signatureCode || `SIG-AUTO-${Math.floor(Math.random() * 9000) + 1000}`)}
                        className="text-xxs text-indigo-600 hover:underline font-bold"
                      >
                        [Lấy mã của tôi]
                      </button>
                    </div>
                    <input
                      id="reviewer-signature-code-input"
                      type="text"
                      value={digitalSignatureInput}
                      onChange={(e) => setDigitalSignatureInput(e.target.value)}
                      placeholder="Ví dụ: SIG-PM-C-8891"
                      className="w-full text-xs font-mono bg-white border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-150 focus:outline-none"
                      required
                    />
                  </div>

                  {/* Operational Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleRejectAction(true)}
                      className="bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 text-xs font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1"
                      title="Yêu cầu sửa đổi bổ sung và trả lại người lập"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Yêu cầu sửa
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRejectAction(false)}
                      className="bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-800 text-xs font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1"
                      title="Từ chối thẳng hồ sơ trình duyệt"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Từ chối duyệt
                    </button>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-gray-200">
                    {/* Ủy quyền nút bấm */}
                    <button
                      type="button"
                      onClick={() => setShowDelegateSection(true)}
                      className="w-1/3 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 text-xs font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Ủy quyền
                    </button>

                    <button
                      type="submit"
                      className="w-2/3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Ký Phê Duyệt
                    </button>
                  </div>
                </form>
              ) : (
                /* Ủy quyền phê duyệt form */
                <form onSubmit={handleDelegateAction} className="space-y-3 p-3 bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-indigo-800 uppercase">Ủy quyền ký duyệt</span>
                    <button
                      type="button"
                      onClick={() => setShowDelegateSection(false)}
                      className="text-xxs font-bold text-gray-400 hover:text-gray-600"
                    >
                      Hủy ủy quyền
                    </button>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-600" htmlFor="delegate-user-select">
                      Chọn người nhận ủy quyền chuyên môn:
                    </label>
                    <select
                      id="delegate-user-select"
                      value={selectedDelegateId}
                      onChange={(e) => setSelectedDelegateId(e.target.value)}
                      className="w-full text-xs bg-white border border-gray-300 rounded p-1.5 font-medium text-gray-800"
                      required
                    >
                      <option value="">-- Chọn nhân sự duyệt thế --</option>
                      {delegatableUsers.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.role.toUpperCase()} - {u.department})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-600" htmlFor="delegate-reason-textarea">
                      Lý do ủy quyền / Ghi chú bàn giao:
                    </label>
                    <textarea
                      id="delegate-reason-textarea"
                      rows={2}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Ví dụ: Đi công tác nước ngoài từ ngày 1/7, ủy quyền xử lý gấp..."
                      className="w-full text-xs bg-white border border-gray-300 rounded p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 rounded transition-colors"
                  >
                    Xác nhận Ủy quyền
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4.5 text-center space-y-2">
              <Info className="w-5 h-5 text-gray-400 mx-auto" />
              <p className="text-xs font-semibold text-gray-600">Bạn chưa có quyền xử lý văn bản ở bước này</p>
              <p className="text-xxs text-gray-400">
                Chỉ người được giao trách nhiệm trực tiếp cho bước phê duyệt hiện tại mới có nút hành động duyệt hồ sơ này.
              </p>
            </div>
          )}
        </div>

        {/* Print & Download Buttons at bottom */}
        <div className="border-t border-gray-150 pt-4 mt-6 flex gap-2">
          {/* Print/Download signed document */}
          <button
            onClick={() => alert(`Mô phỏng: Đang kết xuất văn bản "${document.title}" sang dạng tệp PDF chính thức có đính kèm chữ ký số...`)}
            className="flex-1 text-center border border-gray-200 hover:border-indigo-300 text-gray-700 bg-white hover:bg-indigo-50/20 text-xs font-bold py-2 rounded-lg transition-colors"
          >
            Xuất file PDF
          </button>
          <button
            onClick={() => window.print()}
            className="flex-1 text-center border border-gray-200 hover:border-indigo-300 text-gray-700 bg-white hover:bg-indigo-50/20 text-xs font-bold py-2 rounded-lg transition-colors"
          >
            In văn bản
          </button>
        </div>
      </div>
    </div>
  );
}
