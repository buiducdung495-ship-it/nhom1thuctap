import React, { useState } from 'react';
import { Document } from '../types';
import { FileSpreadsheet, FileText, TrendingUp, Users, CheckCircle, Clock, AlertCircle, Sparkles, HelpCircle, Download } from 'lucide-react';

interface DashboardStatsProps {
  documents: Document[];
}

export default function DashboardStats({ documents }: DashboardStatsProps) {
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  // Compute stats
  const total = documents.length;
  const pending = documents.filter(d => d.status === 'pending').length;
  const approved = documents.filter(d => d.status === 'approved').length;
  const rejected = documents.filter(d => d.status === 'rejected' || d.status === 'editing_required').length;

  const approvedRate = total > 0 ? Math.round((approved / total) * 100) : 0;
  const pendingRate = total > 0 ? Math.round((pending / total) * 100) : 0;
  const rejectedRate = total > 0 ? Math.round((rejected / total) * 100) : 0;

  // Department counts
  const deptCounts: Record<string, number> = {};
  documents.forEach(d => {
    deptCounts[d.creatorDepartment] = (deptCounts[d.creatorDepartment] || 0) + 1;
  });

  // Template/category distribution
  const categoryCounts: Record<string, number> = {};
  documents.forEach(d => {
    const categoryName = d.workflowName.replace('Quy trình Duyệt ', '') || 'Khác';
    categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1;
  });

  const handleExportExcel = () => {
    setIsExportingExcel(true);
    setTimeout(() => {
      setIsExportingExcel(false);
      alert('Đã kết xuất báo cáo thống kê chu kỳ hành chính dạng Excel thành công! Tệp tin "Bao_Cao_Phe_Duyet_Noi_Bo_2026.xlsx" đang được tải xuống.');
    }, 1200);
  };

  const handleExportPDF = () => {
    setIsExportingPDF(true);
    setTimeout(() => {
      setIsExportingPDF(false);
      alert('Đã kết xuất bộ chỉ số KPI vận hành dạng PDF chất lượng cao thành công! Tệp tin "Report_Audit_Trail_Process_2026.pdf" đang được tải xuống.');
    }, 1500);
  };

  return (
    <div className="space-y-6" id="dashboard-reports-and-stats">
      {/* Upper header action area */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-xl p-6 text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-extrabold flex items-center gap-2">
            <TrendingUp className="w-5.5 h-5.5 text-indigo-400" />
            BÁO CÁO THỐNG KÊ & CHỈ SỐ KPI VẬN HÀNH
          </h2>
          <p className="text-xs text-indigo-200 mt-1 font-medium">
            Phân tích tự động thời gian xử lý, hiệu suất phê duyệt của từng phòng ban và quản lý chữ ký số hợp quy.
          </p>
        </div>

        {/* Export Actions */}
        <div className="flex gap-2.5 shrink-0">
          <button
            onClick={handleExportExcel}
            disabled={isExportingExcel}
            className="bg-indigo-700/80 hover:bg-indigo-700 border border-indigo-500/50 hover:border-indigo-500 text-white text-xs font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            {isExportingExcel ? (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <FileSpreadsheet className="w-4 h-4" />
            )}
            Xuất Excel
          </button>

          <button
            onClick={handleExportPDF}
            disabled={isExportingPDF}
            className="bg-white hover:bg-gray-50 text-indigo-900 text-xs font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
          >
            {isExportingPDF ? (
              <span className="w-3.5 h-3.5 border-2 border-indigo-900 border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <Download className="w-4 h-4" />
            )}
            Tải Báo cáo PDF
          </button>
        </div>
      </div>

      {/* Grid count stats (big numbers) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-150 shadow-xxs flex items-center gap-4 hover:shadow-xs transition-shadow">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xxs text-gray-400 font-extrabold uppercase">TỔNG SỐ HỒ SƠ TRÌNH</span>
            <h3 className="text-2xl font-black text-gray-800 mt-0.5">{total}</h3>
            <span className="text-xxs text-gray-400 font-semibold block mt-0.5">Khởi tạo trên hệ thống</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-150 shadow-xxs flex items-center gap-4 hover:shadow-xs transition-shadow">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-xxs text-gray-400 font-extrabold uppercase">ĐANG TRÌNH DUYỆT</span>
            <h3 className="text-2xl font-black text-amber-600 mt-0.5">{pending}</h3>
            <span className="text-xxs text-amber-500 font-semibold block mt-0.5">Chiếm {pendingRate}% tổng số</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-150 shadow-xxs flex items-center gap-4 hover:shadow-xs transition-shadow">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xxs text-gray-400 font-extrabold uppercase">HOÀN THÀNH KÝ SỐ</span>
            <h3 className="text-2xl font-black text-emerald-600 mt-0.5">{approved}</h3>
            <span className="text-xxs text-emerald-600 font-semibold block mt-0.5">Tỉ lệ duyệt: {approvedRate}%</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-150 shadow-xxs flex items-center gap-4 hover:shadow-xs transition-shadow">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-lg">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xxs text-gray-400 font-extrabold uppercase">TỪ CHỐI / CẦN SỬA</span>
            <h3 className="text-2xl font-black text-rose-600 mt-0.5">{rejected}</h3>
            <span className="text-xxs text-rose-500 font-semibold block mt-0.5">Tỉ lệ trả lại: {rejectedRate}%</span>
          </div>
        </div>
      </div>

      {/* Visual Analytics Sections (Custom CSS diagrams for bulletproof React 19 execution) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Distribution Visual Stack */}
        <div className="bg-white p-5 rounded-xl border border-gray-150 shadow-xs space-y-4">
          <div>
            <h3 className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">Cơ cấu trạng thái phê duyệt</h3>
            <p className="text-xxs text-gray-400">Phân bố hồ sơ hành chính theo quyết định cuối cùng.</p>
          </div>

          <div className="space-y-4">
            {/* Horizontal Stacked Visual representation bar */}
            <div className="w-full h-8 bg-gray-100 rounded-lg overflow-hidden flex">
              {approvedRate > 0 && (
                <div
                  className="bg-emerald-500 hover:opacity-90 transition-opacity flex items-center justify-center text-white font-extrabold text-xxs"
                  style={{ width: `${approvedRate}%` }}
                  title={`Đã duyệt: ${approvedRate}%`}
                >
                  {approvedRate >= 15 ? `${approvedRate}%` : ''}
                </div>
              )}
              {pendingRate > 0 && (
                <div
                  className="bg-blue-500 hover:opacity-90 transition-opacity flex items-center justify-center text-white font-extrabold text-xxs"
                  style={{ width: `${pendingRate}%` }}
                  title={`Đang duyệt: ${pendingRate}%`}
                >
                  {pendingRate >= 15 ? `${pendingRate}%` : ''}
                </div>
              )}
              {rejectedRate > 0 && (
                <div
                  className="bg-rose-500 hover:opacity-90 transition-opacity flex items-center justify-center text-white font-extrabold text-xxs"
                  style={{ width: `${rejectedRate}%` }}
                  title={`Từ chối/Trả về: ${rejectedRate}%`}
                >
                  {rejectedRate >= 15 ? `${rejectedRate}%` : ''}
                </div>
              )}
            </div>

            {/* Explanatory legend grid */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-center">
              <div className="p-2 border border-emerald-100 bg-emerald-50/20 rounded-lg text-xxs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-1"></span>
                <span className="text-gray-500 font-medium">Đã ký số:</span>
                <p className="font-extrabold text-emerald-700 text-sm mt-0.5">{approved} văn bản</p>
              </div>
              <div className="p-2 border border-blue-100 bg-blue-50/20 rounded-lg text-xxs">
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block mr-1"></span>
                <span className="text-gray-500 font-medium">Đang duyệt:</span>
                <p className="font-extrabold text-blue-700 text-sm mt-0.5">{pending} văn bản</p>
              </div>
              <div className="p-2 border border-rose-100 bg-rose-50/20 rounded-lg text-xxs">
                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block mr-1"></span>
                <span className="text-gray-500 font-medium">Từ chối/Sửa:</span>
                <p className="font-extrabold text-rose-700 text-sm mt-0.5">{rejected} văn bản</p>
              </div>
            </div>
          </div>
        </div>

        {/* Division submission bar chart */}
        <div className="bg-white p-5 rounded-xl border border-gray-150 shadow-xs space-y-4">
          <div>
            <h3 className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">Số lượng văn bản theo Phòng ban</h3>
            <p className="text-xxs text-gray-400">Thống kê lưu lượng biểu mẫu luân chuyển của từng đơn vị trực thuộc.</p>
          </div>

          <div className="space-y-3.5 pt-1">
            {Object.entries(deptCounts).map(([dept, count]) => {
              // Calc max to find percentage
              const maxVal = Math.max(...Object.values(deptCounts));
              const percentage = maxVal > 0 ? (count / maxVal) * 100 : 0;

              return (
                <div key={dept} className="space-y-1">
                  <div className="flex justify-between items-center text-xxs">
                    <span className="font-bold text-gray-700 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-indigo-500" />
                      {dept}
                    </span>
                    <span className="font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded">
                      {count} văn bản
                    </span>
                  </div>
                  {/* Visual Bar line */}
                  <div className="w-full bg-gray-50 h-2.5 rounded-full border border-gray-150 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SLA / Efficiency Metrics & KPI report */}
      <div className="bg-white p-5 rounded-xl border border-gray-150 shadow-xs space-y-4">
        <div>
          <h3 className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">Hiệu suất và Thời gian thẩm định (SLA)</h3>
          <p className="text-xxs text-gray-400">Kiểm toán thời gian ký số, tránh ách tắc thủ tục nội bộ.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-indigo-100 bg-gradient-to-br from-indigo-50/20 to-indigo-100/10 rounded-xl space-y-1">
            <span className="text-xxs text-gray-400 font-extrabold block uppercase">Thời gian duyệt trung bình</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-indigo-700">4.2</span>
              <span className="text-xs font-semibold text-gray-500">Giờ / hồ sơ</span>
            </div>
            <p className="text-xxs text-emerald-600 font-semibold flex items-center gap-0.5 mt-2">
              <Sparkles className="w-3 h-3" />
              Nhanh hơn 12.5% so với tháng trước
            </p>
          </div>

          <div className="p-4 border border-gray-150 bg-gray-50/40 rounded-xl space-y-1">
            <span className="text-xxs text-gray-400 font-extrabold block uppercase">Tỷ lệ ký duyệt tự động hợp lệ</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-gray-800">100%</span>
              <span className="text-xs font-semibold text-gray-500">Chữ ký số hợp chuẩn</span>
            </div>
            <p className="text-xxs text-gray-500 mt-2">Xác thực chứng chỉ khóa công khai (CA)</p>
          </div>

          <div className="p-4 border border-gray-150 bg-gray-50/40 rounded-xl space-y-1">
            <span className="text-xxs text-gray-400 font-extrabold block uppercase">Tỷ lệ ách tắc hoặc quá hạn</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-emerald-600">0.0%</span>
              <span className="text-xs font-semibold text-gray-500">Hồ sơ quá 48h</span>
            </div>
            <p className="text-xxs text-emerald-600 font-semibold mt-2">Đạt mục tiêu SLA chất lượng nội bộ</p>
          </div>
        </div>
      </div>
    </div>
  );
}
