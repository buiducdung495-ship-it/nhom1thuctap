import React, { useState, useEffect } from 'react';
import { User, DocumentTemplate, WorkflowConfig, Document, Attachment, LiveApprovalStep, ApprovalHistoryItem } from '../types';
import { FileText, Settings, Upload, Eye, Send, RotateCcw, Check, Plus, AlertCircle, Trash2 } from 'lucide-react';

interface DocumentDraftingProps {
  currentUser: User;
  templates: DocumentTemplate[];
  workflows: WorkflowConfig[];
  users: User[];
  onDocumentCreated: (newDoc: Document) => void;
  onCancel: () => void;
  editDocument?: Document | null; // For editing existing
}

export default function DocumentDrafting({
  currentUser,
  templates,
  workflows,
  users,
  onDocumentCreated,
  onCancel,
  editDocument
}: DocumentDraftingProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [templateFieldValues, setTemplateFieldValues] = useState<Record<string, string>>({});
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Drag & Drop mock state
  const [dragActive, setDragActive] = useState(false);

  // Load editing document if available
  useEffect(() => {
    if (editDocument) {
      setTitle(editDocument.title);
      setContent(editDocument.content);
      setAttachments(editDocument.attachments || []);
      setSelectedWorkflowId(editDocument.workflowId);
      if (editDocument.templateId) {
        const foundTpl = templates.find(t => t.id === editDocument.templateId);
        if (foundTpl) {
          setSelectedTemplate(foundTpl);
        }
      }
    } else {
      // Set default workflow
      if (workflows.length > 0) {
        setSelectedWorkflowId(workflows[0].id);
      }
    }
  }, [editDocument, workflows, templates]);

  // Handle template selection
  const handleTemplateSelect = (tpl: DocumentTemplate) => {
    setSelectedTemplate(tpl);
    const initialValues: Record<string, string> = {};
    tpl.requiredFields.forEach(f => {
      // Default department and name for convenience
      if (f.id === 'fullName' || f.id === 'requester') {
        initialValues[f.id] = currentUser.name;
      } else if (f.id === 'dept' || f.id === 'department') {
        initialValues[f.id] = currentUser.department;
      } else {
        initialValues[f.id] = '';
      }
    });
    setTemplateFieldValues(initialValues);

    // Auto set title
    if (!editDocument) {
      setTitle(`${tpl.title} - ${currentUser.name}`);
    }

    // Compile initial content
    compileTemplateContent(tpl, initialValues);
  };

  // Compile template text placeholders dynamically
  const compileTemplateContent = (tpl: DocumentTemplate, values: Record<string, string>) => {
    let compiled = tpl.content;
    tpl.requiredFields.forEach(f => {
      const labelPlaceholder = `{{${f.label}}}`;
      const fallbackPlaceholder = `{{${f.placeholder || f.label}}}`;
      const value = values[f.id] || `[Chưa nhập ${f.label}]`;
      
      // Replace all occurrences of label and fallback
      compiled = compiled.replace(new RegExp(escapeRegExp(labelPlaceholder), 'g'), value);
      compiled = compiled.replace(new RegExp(escapeRegExp(fallbackPlaceholder), 'g'), value);
    });
    setContent(compiled);
  };

  const escapeRegExp = (str: string) => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  const handleFieldValueChange = (fieldId: string, value: string) => {
    if (!selectedTemplate) return;
    const updatedValues = { ...templateFieldValues, [fieldId]: value };
    setTemplateFieldValues(updatedValues);
    compileTemplateContent(selectedTemplate, updatedValues);
  };

  // UC03: Drag & Drop File Upload simulation
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (fileList: FileList) => {
    setIsUploading(true);
    // Simulate network lag
    setTimeout(() => {
      const newAttachments: Attachment[] = [];
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
        newAttachments.push({
          id: `att_${Date.now()}_${i}`,
          name: file.name,
          size: `${sizeMB} MB`,
          type: file.type || 'application/octet-stream'
        });
      }
      setAttachments(prev => [...prev, ...newAttachments]);
      setIsUploading(false);
    }, 800);
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  // Reset drafting form
  const handleReset = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ nội dung đang soạn thảo không?')) {
      setSelectedTemplate(null);
      setTemplateFieldValues({});
      setTitle('');
      setContent('');
      setAttachments([]);
      setErrorMessage('');
    }
  };

  // UC05: Gửi yêu cầu phê duyệt
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!title.trim()) {
      setErrorMessage('Vui lòng nhập Tiêu đề văn bản.');
      return;
    }
    if (!content.trim()) {
      setErrorMessage('Nội dung văn bản không được để trống.');
      return;
    }
    if (!selectedWorkflowId) {
      setErrorMessage('Vui lòng chọn một Quy trình phê duyệt phù hợp.');
      return;
    }

    const workflow = workflows.find(w => w.id === selectedWorkflowId);
    if (!workflow) {
      setErrorMessage('Quy trình phê duyệt đã chọn không hợp lệ.');
      return;
    }

    // Build Live Approval Steps mapping with users based on configured steps
    const liveSteps: LiveApprovalStep[] = workflow.steps.map(step => {
      // Find default user for this step from default users based on configuration
      let assignedUser = users.find(u => u.id === step.userId);
      if (!assignedUser) {
        // Fallback: search for first user holding this role
        assignedUser = users.find(u => u.role === step.role && u.active);
      }

      return {
        stepNumber: step.stepNumber,
        label: step.label,
        role: step.role,
        assignedUserId: assignedUser?.id || 'usr_3', // Fallback to Pham Minh C
        assignedUserName: assignedUser?.name || 'Phạm Minh C',
        status: step.stepNumber === 1 ? 'pending' : 'waiting', // First step starts pending, others wait
        comment: ''
      };
    });

    const nowStr = new Date().toISOString();

    // History Log
    const historyItem: ApprovalHistoryItem = {
      timestamp: nowStr,
      actor: currentUser.name,
      role: currentUser.role,
      action: editDocument ? 'submit' : 'create',
      details: editDocument 
        ? `Nộp lại văn bản sau chỉnh sửa sử dụng quy trình: ${workflow.name}` 
        : `Tạo mới và gửi yêu cầu phê duyệt thành công sử dụng quy trình: ${workflow.name}`
    };

    const newDoc: Document = {
      id: editDocument ? editDocument.id : `doc_${Date.now()}`,
      title,
      content,
      templateId: selectedTemplate?.id,
      status: 'pending', // Starts pending approval
      creatorId: editDocument ? editDocument.creatorId : currentUser.id,
      creatorName: editDocument ? editDocument.creatorName : currentUser.name,
      creatorDepartment: editDocument ? editDocument.creatorDepartment : currentUser.department,
      companyId: editDocument ? editDocument.companyId : currentUser.companyId,
      createdAt: editDocument ? editDocument.createdAt : nowStr,
      updatedAt: nowStr,
      attachments,
      workflowId: workflow.id,
      workflowName: workflow.name,
      currentStepNumber: 1, // Point to the first pending step
      approvalSteps: liveSteps,
      history: editDocument ? [...editDocument.history, historyItem] : [historyItem]
    };

    onDocumentCreated(newDoc);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-150 shadow-sm overflow-hidden" id="document-drafting-card">
      <div className="bg-slate-50 border-b border-gray-150 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-bold text-gray-800">
            {editDocument ? 'Hiệu chỉnh văn bản và Gửi lại' : 'Soạn thảo văn bản mới'}
          </h2>
        </div>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 text-sm font-medium transition-colors"
        >
          Đóng
        </button>
      </div>

      <div className="p-6">
        {errorMessage && (
          <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg p-3 text-sm flex items-start gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* UC02: Quick Template Selection grid */}
        {!editDocument && (
          <div className="mb-6">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5" />
              Bước 1: Chọn mẫu biểu quy chuẩn (Template)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {templates.map(tpl => {
                const isSelected = selectedTemplate?.id === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleTemplateSelect(tpl)}
                    className={`text-left p-3.5 rounded-lg border transition-all relative ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                        {tpl.category}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-indigo-600" />}
                    </div>
                    <h4 className="text-sm font-bold text-gray-800">{tpl.title}</h4>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-1">{tpl.description}</p>
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => {
                  setSelectedTemplate(null);
                  setTemplateFieldValues({});
                  setTitle(`Văn bản tự soạn - ${currentUser.name}`);
                  setContent('');
                }}
                className={`text-left p-3.5 rounded-lg border transition-all ${
                  selectedTemplate === null
                    ? 'border-indigo-600 bg-indigo-50/50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
                    Khác
                  </span>
                </div>
                <h4 className="text-sm font-bold text-gray-800">Văn bản tự do</h4>
                <p className="text-xs text-gray-500 mt-1">Bắt đầu soạn thảo văn bản trống không cần mẫu định dạng sẵn.</p>
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Render dynamic inputs if template chosen */}
          {selectedTemplate && (
            <div className="bg-slate-50 border border-slate-150 p-4.5 rounded-lg">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Thông tin biểu mẫu: {selectedTemplate.title}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedTemplate.requiredFields.map(field => (
                  <div key={field.id} className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-700" htmlFor={`tpl-field-${field.id}`}>
                      {field.label}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea
                        id={`tpl-field-${field.id}`}
                        rows={3}
                        value={templateFieldValues[field.id] || ''}
                        onChange={(e) => handleFieldValueChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full text-xs bg-white border border-gray-300 rounded-md p-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      />
                    ) : (
                      <input
                        id={`tpl-field-${field.id}`}
                        type={field.type}
                        value={templateFieldValues[field.id] || ''}
                        onChange={(e) => handleFieldValueChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full text-xs bg-white border border-gray-300 rounded-md p-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* UC01: Soạn thảo tiêu đề & Nội dung */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              Bước 2: Nội dung văn bản phê duyệt
            </h3>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700" htmlFor="draft-title-input">
                Tiêu đề văn bản <span className="text-rose-500">*</span>
              </label>
              <input
                id="draft-title-input"
                type="text"
                placeholder="Ví dụ: Tờ trình đề xuất cấp kinh phí hội thảo quý 3"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-sm font-medium bg-white border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-150 focus:border-indigo-500 focus:outline-none transition-colors"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-700" htmlFor="draft-content-textarea">
                  Nội dung chi tiết <span className="text-rose-500">*</span>
                </label>
                {selectedTemplate && (
                  <span className="text-xxs text-indigo-600 bg-indigo-50 font-medium px-1.5 py-0.5 rounded">
                    Tự động đồng bộ từ form điền thông tin bên trên
                  </span>
                )}
              </div>
              <textarea
                id="draft-content-textarea"
                rows={12}
                placeholder="Nhập nội dung văn bản chính thức cần trình duyệt tại đây..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full text-sm font-mono bg-white border border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-indigo-150 focus:border-indigo-500 focus:outline-none leading-relaxed transition-colors"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* UC03: Đính kèm tài liệu với Drag & Drop */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Bước 3: Đính kèm tài liệu hỗ trợ (File)
              </h3>
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-5 text-center transition-all ${
                  dragActive
                    ? 'border-indigo-500 bg-indigo-50/30'
                    : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'
                }`}
              >
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-gray-700">Kéo thả file đính kèm vào đây</p>
                <p className="text-xxs text-gray-400 mt-1">hoặc click để chọn tệp từ máy tính</p>
                <input
                  type="file"
                  multiple
                  onChange={handleFileInputChange}
                  className="hidden"
                  id="draft-file-upload-input"
                />
                <label
                  htmlFor="draft-file-upload-input"
                  className="mt-3 inline-block text-xs font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer border border-indigo-200 px-3 py-1 rounded bg-white hover:bg-indigo-50/30 transition-colors"
                >
                  Chọn tệp tin
                </label>
              </div>

              {/* Uploading indicator */}
              {isUploading && (
                <div className="flex items-center gap-2 justify-center text-xs text-gray-500">
                  <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Đang xử lý tải tài liệu...</span>
                </div>
              )}

              {/* Attachments List */}
              {attachments.length > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2">
                  <span className="text-xxs font-bold text-gray-500 uppercase block">Danh sách tệp đính kèm ({attachments.length}):</span>
                  {attachments.map(att => (
                    <div key={att.id} className="flex items-center justify-between text-xs bg-white border border-gray-150 p-2 rounded">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <FileText className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="font-medium text-gray-700 truncate">{att.name}</span>
                        <span className="text-xxs text-gray-400 shrink-0">({att.size})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(att.id)}
                        className="text-gray-400 hover:text-rose-500 p-1 rounded hover:bg-gray-50 transition-colors"
                        title="Xóa tệp"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* UC04: Chọn quy trình duyệt */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5" />
                Bước 4: Thiết lập Luồng phê duyệt
              </h3>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-600" htmlFor="workflow-routing-select">
                  Chọn luồng phê duyệt định sẵn:
                </label>
                <select
                  id="workflow-routing-select"
                  value={selectedWorkflowId}
                  onChange={(e) => setSelectedWorkflowId(e.target.value)}
                  className="w-full text-xs bg-white border border-gray-300 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none font-medium text-gray-800"
                >
                  {workflows.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.steps.length} bước ký duyệt)
                    </option>
                  ))}
                </select>
              </div>

              {/* Dynamic steps display */}
              {selectedWorkflowId && (
                <div className="bg-indigo-50/40 border border-indigo-100 rounded-lg p-4.5">
                  <span className="text-xxs font-bold text-indigo-800 uppercase block mb-2.5">Xem trước các bước duyệt trong luồng:</span>
                  <div className="relative pl-4 space-y-4 border-l-2 border-indigo-200">
                    {workflows.find(w => w.id === selectedWorkflowId)?.steps.map((step, idx) => (
                      <div key={idx} className="relative">
                        {/* Dot indicator */}
                        <div className="absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full border-2 border-indigo-500 bg-white flex items-center justify-center text-[8px] font-bold text-indigo-600">
                          {step.stepNumber}
                        </div>
                        <div className="text-xs">
                          <p className="font-bold text-gray-800">{step.label}</p>
                          <p className="text-xxs text-gray-500 mt-0.5">
                            Người ký: <span className="font-medium text-indigo-700">{step.userName || 'Tùy thuộc vai trò'}</span> ({step.role.toUpperCase()})
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="border-t border-gray-150 pt-5 flex items-center justify-between">
            <button
              type="button"
              onClick={handleReset}
              className="text-gray-500 hover:text-gray-700 text-xs font-semibold flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Làm mới nội dung
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="text-gray-700 bg-gray-100 hover:bg-gray-200 text-xs font-bold px-4 py-2 rounded-lg transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm text-xs font-bold px-5 py-2 rounded-lg flex items-center gap-1.5 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Send className="w-3.5 h-3.5" />
                {editDocument ? 'Gửi lại yêu cầu duyệt' : 'Gửi yêu cầu phê duyệt'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
