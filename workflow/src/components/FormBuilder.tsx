import React, { useState } from 'react';
import { 
  Plus, 
  Send, 
  Sparkles, 
  Type, 
  List, 
  CheckSquare, 
  Calendar as CalendarIcon, 
  Trash2,
  FileText,
  AlignLeft
} from 'lucide-react';
import { User } from '../types';

interface FormBuilderProps {
  onSaveForm?: (form: any) => Promise<void>;
  onSubmitRequest?: (formTemplateId: string, values: Record<string, any>) => Promise<void>;
  userId: string;
  currentUser?: User;
}

interface CanvasField {
  id: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'checkbox' | 'date';
  label: string;
  value: any;
  options?: string[];
}

export const FormBuilder: React.FC<FormBuilderProps> = ({ onSubmitRequest, currentUser }) => {
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [documentTitle, setDocumentTitle] = useState('ĐƠN XIN NGHỈ PHÉP');
  const [fields, setFields] = useState<CanvasField[]>([]);
  const [signatureImage, setSignatureImage] = useState<string | null>(null);

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSignatureImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Use actual AI backend for parsing the request
  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/forms/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt, user: currentUser })
      });
      const data = await response.json();
      
      if (data && data.title) {
        setDocumentTitle(data.title);
        setFields(data.fields || []);
      }
    } catch (err) {
      console.error('Failed to parse form with AI', err);
    } finally {
      setIsGenerating(false);
      setAiPrompt('');
    }
  };

  const addField = (type: CanvasField['type']) => {
    const defaultLabels = {
      text: 'Trường văn bản',
      textarea: 'Nội dung chi tiết',
      number: 'Số lượng',
      select: 'Lựa chọn',
      checkbox: 'Xác nhận',
      date: 'Ngày tháng'
    };

    setFields([
      ...fields,
      {
        id: `custom-${Date.now()}`,
        type,
        label: defaultLabels[type],
        value: type === 'checkbox' ? false : '',
        options: type === 'select' ? ['Tùy chọn 1', 'Tùy chọn 2'] : undefined
      }
    ]);
  };

  const updateField = (id: string, prop: keyof CanvasField, value: any) => {
    let newFields = fields.map(f => f.id === id ? { ...f, [prop]: value } : f);
    
    // Auto calculate days if changing start/end date
    const updatedField = newFields.find(f => f.id === id);
    if (updatedField && updatedField.type === 'date') {
      const startDateField = newFields.find(f => f.label.toLowerCase().includes('ngày bắt đầu'));
      const endDateField = newFields.find(f => f.label.toLowerCase().includes('ngày kết thúc'));
      const numDaysField = newFields.find(f => f.label.toLowerCase().includes('số ngày'));
      
      if (startDateField && endDateField && numDaysField && startDateField.value && endDateField.value) {
        const start = new Date(startDateField.value as string);
        const end = new Date(endDateField.value as string);
        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
          const diffTime = Math.abs(end.getTime() - start.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive
          newFields = newFields.map(f => f.id === numDaysField.id ? { ...f, value: diffDays } : f);
        }
      }
    }
    
    setFields(newFields);
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const handleSubmit = async () => {
    if (!onSubmitRequest) return;
    setIsSubmitting(true);
    
    try {
      // Map canvas fields to submission data
      const submissionData: Record<string, any> = {};
      fields.forEach(f => {
        submissionData[f.label] = f.value;
      });

      // Submit direct to a generic form template (we assume backend can handle dynamically generated fields)
      // We will use 'tmpl-leave' as a default if it's a leave request, or just pass generic values.
      // Wait, the workflow requires a formTemplateId. Let's use an existing one or a generic one.
      const tmplId = documentTitle.includes('THIẾT BỊ') ? 'form-device-request' : 'form-leave';
      await onSubmitRequest(tmplId, submissionData);
      
      // Clear form after submit
      setFields([]);
      setDocumentTitle('ĐƠN ĐỀ NGHỊ MỚI');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Standard Vietnamese Document Header Dates
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = today.getFullYear();

  return (
    <div className="flex h-[calc(100vh-3.5rem)] bg-slate-100/50">
      
      {/* Left Sidebar: AI Composer */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col shadow-sm z-10 shrink-0">
        <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-indigo-50/50 to-white">
          <div className="flex items-center space-x-2 text-indigo-700 font-bold mb-1">
            <Sparkles size={18} />
            <h2>Trợ lý soạn đơn AI</h2>
          </div>
          <p className="text-[11px] text-slate-500">Mô tả yêu cầu của bạn, AI sẽ tự động tạo cấu trúc đơn chuẩn.</p>
        </div>

        <div className="p-5 space-y-6 overflow-y-auto flex-1">
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700">Bạn muốn viết đơn gì?</label>
            <textarea
              className="w-full text-sm p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all resize-none shadow-inner"
              rows={4}
              placeholder="Ví dụ: Xin nghỉ phép 2 ngày vì lý do cá nhân..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
            />
            <button
              onClick={handleAIGenerate}
              disabled={isGenerating || !aiPrompt.trim()}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>Tạo đơn tự động</span>
                </>
              )}
            </button>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gợi ý nhanh</label>
            <div className="flex flex-wrap gap-2">
              {['Xin nghỉ phép', 'Đề nghị mua thiết bị', 'Tạm ứng công tác phí', 'Xin làm việc từ xa (WFH)'].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setAiPrompt(suggestion)}
                  className="text-[11px] bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 px-3 py-1.5 rounded-full transition-colors font-medium border border-slate-200 hover:border-indigo-200 text-left cursor-pointer"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Canvas: Word Document Style */}
      <div className="flex-1 flex flex-col bg-slate-100 overflow-y-auto relative">
        
        {/* Floating Quick Add Toolbar */}
        <div className="sticky top-6 z-20 flex justify-center mb-6">
          <div className="bg-white px-4 py-2 rounded-2xl shadow-lg border border-slate-200 flex items-center space-x-2 animate-slide-up">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-2 hidden md:block">Thêm nhanh:</span>
            <button onClick={() => addField('text')} className="cursor-pointer flex items-center space-x-1.5 px-3 py-1.5 hover:bg-slate-50 rounded-lg text-xs font-medium text-slate-700 transition-colors border border-transparent hover:border-slate-200">
              <Type size={14} className="text-blue-500" />
              <span>Textbox</span>
            </button>
            <button onClick={() => addField('textarea')} className="cursor-pointer flex items-center space-x-1.5 px-3 py-1.5 hover:bg-slate-50 rounded-lg text-xs font-medium text-slate-700 transition-colors border border-transparent hover:border-slate-200">
              <AlignLeft size={14} className="text-amber-500" />
              <span>Lý do/Đoạn văn</span>
            </button>
            <button onClick={() => addField('checkbox')} className="cursor-pointer flex items-center space-x-1.5 px-3 py-1.5 hover:bg-slate-50 rounded-lg text-xs font-medium text-slate-700 transition-colors border border-transparent hover:border-slate-200">
              <CheckSquare size={14} className="text-emerald-500" />
              <span>Checkbox</span>
            </button>
            <button onClick={() => addField('select')} className="cursor-pointer flex items-center space-x-1.5 px-3 py-1.5 hover:bg-slate-50 rounded-lg text-xs font-medium text-slate-700 transition-colors border border-transparent hover:border-slate-200">
              <List size={14} className="text-purple-500" />
              <span>List</span>
            </button>
            <button onClick={() => addField('date')} className="cursor-pointer flex items-center space-x-1.5 px-3 py-1.5 hover:bg-slate-50 rounded-lg text-xs font-medium text-slate-700 transition-colors border border-transparent hover:border-slate-200">
              <CalendarIcon size={14} className="text-rose-500" />
              <span>Ngày tháng</span>
            </button>
          </div>
        </div>

        {/* A4 Paper Canvas */}
        <div className="flex-1 px-4 pb-20 w-full flex justify-center">
          <div className="w-full max-w-3xl bg-white min-h-[1000px] shadow-sm ring-1 ring-slate-900/5 my-0 sm:my-2 rounded-none sm:rounded-xl p-10 md:p-16 flex flex-col relative">
            
            {/* National Header */}
            <div className="text-center mb-10">
              <h3 className="font-bold text-[15px] uppercase tracking-wide">Cộng Hòa Xã Hội Chủ Nghĩa Việt Nam</h3>
              <p className="font-bold text-[14px] mt-1 underline underline-offset-4 decoration-slate-400">Độc lập - Tự do - Hạnh phúc</p>
              <p className="text-xs italic text-slate-600 mt-6 text-right w-full">Hà Nội, ngày {day} tháng {month} năm {year}</p>
            </div>

            {/* Document Title Editable */}
            <div className="text-center mb-12">
              <input 
                type="text" 
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                className="text-2xl font-bold uppercase text-center w-full border-b-2 border-transparent hover:border-slate-200 focus:border-indigo-500 focus:outline-none transition-colors"
                placeholder="NHẬP TIÊU ĐỀ ĐƠN..."
              />
            </div>

            {/* Dynamic Form Content */}
            <div className="space-y-6 flex-1">
              {fields.length === 0 ? (
                <div className="text-center py-20 text-slate-400 flex flex-col items-center">
                  <FileText size={48} className="mb-4 opacity-20" />
                  <p>Bản thảo đang trống.</p>
                  <p className="text-sm mt-1">Sử dụng thanh công cụ hoặc Trợ lý AI để tạo nội dung.</p>
                </div>
              ) : (
                fields.map((field) => (
                  <div key={field.id} className="group relative flex items-start space-x-4">
                    
                    {/* Inline Label */}
                    <div className="w-1/3 shrink-0 pt-1 flex items-start">
                      <input 
                        type="text"
                        value={field.label}
                        onChange={(e) => updateField(field.id, 'label', e.target.value)}
                        className="font-bold text-[13px] text-slate-800 w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none transition-colors"
                        placeholder="Tên trường..."
                      />
                      <span className="text-slate-800 font-bold ml-1">:</span>
                    </div>

                    {/* Inline Value Input */}
                    <div className="flex-1 relative">
                      {field.type === 'textarea' ? (
                        <textarea
                          value={field.value || ''}
                          onChange={(e) => updateField(field.id, 'value', e.target.value)}
                          className="w-full text-[13px] text-slate-700 bg-slate-50 hover:bg-slate-100 border-b border-slate-300 focus:bg-white focus:border-indigo-500 focus:outline-none transition-colors p-2 rounded-t resize-y min-h-[60px]"
                          placeholder="Nhập nội dung..."
                        />
                      ) : field.type === 'checkbox' ? (
                        <div className="flex items-center space-x-2 pt-1 h-full">
                          <input 
                            type="checkbox"
                            checked={!!field.value}
                            onChange={(e) => updateField(field.id, 'value', e.target.checked)}
                            className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                          />
                          <span className="text-[13px] text-slate-600 italic">Đánh dấu để xác nhận.</span>
                        </div>
                      ) : field.type === 'date' ? (
                        <input
                          type="date"
                          value={field.value || ''}
                          onChange={(e) => updateField(field.id, 'value', e.target.value)}
                          className="w-full text-[13px] text-slate-700 bg-slate-50 hover:bg-slate-100 border-b border-slate-300 focus:bg-white focus:border-indigo-500 focus:outline-none transition-colors p-2 rounded-t"
                        />
                      ) : field.type === 'select' ? (
                        <div className="space-y-2">
                          <select
                            value={field.value || ''}
                            onChange={(e) => updateField(field.id, 'value', e.target.value)}
                            className="w-full text-[13px] text-slate-700 bg-slate-50 hover:bg-slate-100 border-b border-slate-300 focus:bg-white focus:border-indigo-500 focus:outline-none transition-colors p-2 rounded-t cursor-pointer"
                          >
                            <option value="">-- Lựa chọn --</option>
                            {field.options?.map((opt, i) => (
                              <option key={i} value={opt}>{opt}</option>
                            ))}
                          </select>
                          <input 
                            type="text"
                            value={field.options?.join(', ') || ''}
                            onChange={(e) => updateField(field.id, 'options', e.target.value.split(',').map(s => s.trim()))}
                            className="text-[10px] text-slate-400 w-full bg-transparent border-b border-dashed border-slate-200 focus:outline-none pb-1"
                            placeholder="Sửa danh sách (cách nhau bằng dấu phẩy)..."
                          />
                        </div>
                      ) : (
                        <input
                          type={field.type}
                          value={field.value || ''}
                          onChange={(e) => updateField(field.id, 'value', e.target.value)}
                          className="w-full text-[13px] text-slate-700 bg-slate-50 hover:bg-slate-100 border-b border-slate-300 focus:bg-white focus:border-indigo-500 focus:outline-none transition-colors p-2 rounded-t"
                          placeholder="Nhập thông tin..."
                        />
                      )}
                      
                      {/* Delete Field Button - Appears on hover */}
                      <button 
                        onClick={() => removeField(field.id)}
                        className="absolute -right-8 top-1 p-1.5 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity bg-white hover:bg-rose-50 rounded-lg cursor-pointer shadow-sm"
                        title="Xóa dòng này"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bottom Signatures Section */}
            <div className="mt-16 pt-10 grid grid-cols-2 gap-8">
              <div className="text-center relative">
                <p className="font-bold text-[13px]">Người làm đơn</p>
                <p className="text-[11px] text-slate-500 italic mt-0.5">(Ký điện tử hoặc đính kèm ảnh ký tay)</p>
                
                <div className="h-24 flex items-center justify-center relative mt-2 group">
                  {signatureImage ? (
                    <img src={signatureImage} alt="Chữ ký tay" className="max-h-20 object-contain mix-blend-multiply" />
                  ) : (
                    <>
                      <div className="absolute opacity-10 blur-[1px]">
                        <div className="w-20 h-20 border-4 border-indigo-600 rounded-full flex items-center justify-center rotate-[-15deg]">
                          <span className="font-bold text-indigo-600 text-[10px]">DIGITAL SIGNATURE</span>
                        </div>
                      </div>
                      <div className="z-10 bg-white/60 px-4 py-2 rounded border border-indigo-100 shadow-sm flex flex-col items-center">
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">ĐÃ XÁC THỰC</span>
                        <span className="font-mono text-[9px] text-slate-400">UID: {currentUser?.id.substring(0,8).toUpperCase()}</span>
                        <span className="font-mono text-[9px] text-slate-400">{today.toISOString().split('T')[0]}</span>
                      </div>
                    </>
                  )}
                  
                  {/* Upload Signature Button overlay */}
                  <label className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-lg border border-dashed border-slate-300 backdrop-blur-[1px]">
                    <span className="bg-white text-indigo-600 text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm">
                      {signatureImage ? 'Thay đổi chữ ký' : 'Tải lên chữ ký tay'}
                    </span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleSignatureUpload} />
                  </label>
                </div>

                <p className="font-bold text-[13px] mt-2">{currentUser?.name}</p>
                <p className="text-[11px] text-slate-500 mt-1">{currentUser?.department}</p>
              </div>

              <div className="text-center opacity-60">
                <p className="font-bold text-[13px]">Ban Giám đốc</p>
                <p className="text-[11px] text-slate-500 italic mt-0.5">(Duyệt và đóng dấu)</p>
                <div className="h-24 flex items-center justify-center mt-2">
                  <span className="text-[11px] text-slate-400 italic">Hệ thống sẽ chuyển tiếp tự động sau khi gửi...</span>
                </div>
              </div>
            </div>

            {/* Action Bar Bottom Right */}
            <div className="mt-10 flex justify-end">
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting || fields.length === 0}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold flex items-center space-x-2 shadow-lg shadow-emerald-600/20 transition-all hover:-translate-y-0.5 cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                <span>Gửi yêu cầu tới Ban Giám đốc</span>
              </button>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};
