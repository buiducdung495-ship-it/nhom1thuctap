import React from 'react';
import { WorkflowRequest, Asset, PaymentTransaction, User, FormTemplate } from '../types';
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Cloud,
  FileText,
  FolderKanban,
  Gauge,
  Laptop,
  Layers3,
  ShieldCheck,
  Users
} from 'lucide-react';

interface DashboardAnalyticsProps {
  requests: WorkflowRequest[];
  assets: Asset[];
  payments: PaymentTransaction[];
  users: User[];
  forms: FormTemplate[];
}

type Tone = 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky' | 'slate';

const toneStyles: Record<Tone, { icon: string; soft: string; text: string; bar: string; dot: string }> = {
  indigo: {
    icon: 'bg-indigo-50 text-indigo-600',
    soft: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    text: 'text-indigo-700',
    bar: 'bg-indigo-600',
    dot: 'bg-indigo-500'
  },
  emerald: {
    icon: 'bg-emerald-50 text-emerald-600',
    soft: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    text: 'text-emerald-700',
    bar: 'bg-emerald-600',
    dot: 'bg-emerald-500'
  },
  amber: {
    icon: 'bg-amber-50 text-amber-600',
    soft: 'bg-amber-50 text-amber-700 border-amber-100',
    text: 'text-amber-700',
    bar: 'bg-amber-500',
    dot: 'bg-amber-500'
  },
  rose: {
    icon: 'bg-rose-50 text-rose-600',
    soft: 'bg-rose-50 text-rose-700 border-rose-100',
    text: 'text-rose-700',
    bar: 'bg-rose-600',
    dot: 'bg-rose-500'
  },
  sky: {
    icon: 'bg-sky-50 text-sky-600',
    soft: 'bg-sky-50 text-sky-700 border-sky-100',
    text: 'text-sky-700',
    bar: 'bg-sky-500',
    dot: 'bg-sky-500'
  },
  slate: {
    icon: 'bg-slate-100 text-slate-600',
    soft: 'bg-slate-50 text-slate-700 border-slate-100',
    text: 'text-slate-700',
    bar: 'bg-slate-500',
    dot: 'bg-slate-400'
  }
};

const formatMoney = (value: number) => `${value.toLocaleString('vi-VN')} đ`;

const percent = (value: number, total: number) => {
  if (!total) return 0;
  return Math.round((value / total) * 100);
};

const clampPercent = (value: number) => `${Math.min(100, Math.max(0, value))}%`;

export const DashboardAnalytics: React.FC<DashboardAnalyticsProps> = ({
  requests,
  assets,
  payments,
  users,
  forms
}) => {
  const totalUsers = users.length;
  const totalForms = forms.length;
  const totalSubmissions = requests.length;
  const totalApproved = requests.filter((request) => request.status === 'approved').length;
  const totalPending = requests.filter((request) => request.status === 'pending').length;
  const totalRejected = requests.filter((request) => request.status === 'rejected').length;
  const completionRate = percent(totalApproved, totalSubmissions);
  const totalLiquidationRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const completedPaymentCount = payments.filter((payment) => payment.status === 'completed').length;

  const categoryCounts = {
    leave: requests.filter((request) => request.formTemplateId.includes('leave') || request.formTitle.toLowerCase().includes('phép')).length,
    asset: requests.filter((request) => request.formTemplateId.includes('asset') || request.formTitle.toLowerCase().includes('thiết bị')).length,
    finance: requests.filter((request) => request.formTemplateId.includes('finance') || request.formTitle.toLowerCase().includes('tài chính') || request.formTitle.toLowerCase().includes('tạm ứng')).length,
    general: 0
  };
  categoryCounts.general = Math.max(0, totalSubmissions - categoryCounts.leave - categoryCounts.asset - categoryCounts.finance);

  const assetConditions = {
    excellent: assets.filter((asset) => asset.currentCondition <= 10).length,
    good: assets.filter((asset) => asset.currentCondition > 10 && asset.currentCondition <= 30).length,
    damaged: assets.filter((asset) => asset.currentCondition > 30).length
  };
  const assignedAssets = assets.filter((asset) => asset.status === 'assigned').length;
  const pendingAssetActions = assets.filter((asset) => asset.status.startsWith('pending')).length;

  const paymentMethodsSplit = {
    payroll: payments.filter((payment) => payment.paymentMethod === 'payroll_deduction').reduce((sum, payment) => sum + payment.amount, 0),
    credit: payments.filter((payment) => payment.paymentMethod === 'credit_card').reduce((sum, payment) => sum + payment.amount, 0),
    ewallet: payments.filter((payment) => payment.paymentMethod === 'e_wallet').reduce((sum, payment) => sum + payment.amount, 0)
  };

  const departments = users.reduce<Record<string, number>>((acc, user) => {
    acc[user.department] = (acc[user.department] || 0) + 1;
    return acc;
  }, {});

  const pendingRequests = requests
    .filter((request) => request.status === 'pending')
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const recentActivities = requests
    .slice()
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6)
    .map((request) => ({
      id: request.id,
      title: request.formTitle,
      owner: request.submitterName,
      department: request.submitterDepartment,
      status: request.status,
      time: new Date(request.updatedAt || request.createdAt).toLocaleDateString('vi-VN')
    }));

  const kpis = [
    {
      label: 'Nhân sự hệ thống',
      value: totalUsers.toLocaleString('vi-VN'),
      detail: `${Object.keys(departments).length || 0} phòng ban đang hoạt động`,
      icon: Users,
      tone: 'indigo' as Tone
    },
    {
      label: 'Hồ sơ đã nộp',
      value: totalSubmissions.toLocaleString('vi-VN'),
      detail: `${totalPending} hồ sơ đang chờ phê duyệt`,
      icon: FileText,
      tone: 'amber' as Tone
    },
    {
      label: 'Tỷ lệ hoàn tất',
      value: `${completionRate}%`,
      detail: `${totalApproved} duyệt, ${totalRejected} từ chối`,
      icon: CheckCircle2,
      tone: 'emerald' as Tone
    },
    {
      label: 'Doanh thu thanh lý',
      value: formatMoney(totalLiquidationRevenue),
      detail: `${completedPaymentCount} giao dịch đã hoàn tất`,
      icon: CircleDollarSign,
      tone: 'sky' as Tone
    }
  ];

  const categoryRows = [
    { label: 'Nghỉ phép', value: categoryCounts.leave, tone: 'sky' as Tone },
    { label: 'Thiết bị / tài sản', value: categoryCounts.asset, tone: 'amber' as Tone },
    { label: 'Tài chính', value: categoryCounts.finance, tone: 'emerald' as Tone },
    { label: 'Nghiệp vụ khác', value: categoryCounts.general, tone: 'indigo' as Tone }
  ];

  const assetRows = [
    { label: 'Máy tốt', value: assetConditions.excellent, caption: '<=10% hao mòn', tone: 'emerald' as Tone },
    { label: 'Cần theo dõi', value: assetConditions.good, caption: '11-30% hao mòn', tone: 'amber' as Tone },
    { label: 'Rủi ro cao', value: assetConditions.damaged, caption: '>30% hao mòn', tone: 'rose' as Tone }
  ];

  const paymentRows = [
    { label: 'Khấu trừ lương', value: paymentMethodsSplit.payroll, tone: 'indigo' as Tone },
    { label: 'Thẻ tín dụng', value: paymentMethodsSplit.credit, tone: 'sky' as Tone },
    { label: 'Ví điện tử', value: paymentMethodsSplit.ewallet, tone: 'emerald' as Tone }
  ];

  return (
    <section className="mx-auto w-full max-w-7xl p-4 sm:p-5 lg:p-6 space-y-5 lg:space-y-6" id="dashboard-analytics-view">
      <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-xs sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                <Cloud size={12} />
                Cloud-ready
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-[10px] font-bold text-indigo-700">
                <ShieldCheck size={12} />
                Strict accessibility
              </span>
            </div>
            <h2 className="mt-3 text-xl font-extrabold leading-tight text-slate-900 sm:text-2xl">
              Bảng điều khiển E-Office
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Theo dõi hồ sơ, phê duyệt, tài sản và thanh toán trong một màn hình vận hành rõ ràng cho nhân viên nội bộ.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs sm:min-w-[320px]">
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-[0.04em] text-slate-500">Trạng thái</span>
              <span className="mt-1 block font-bold text-slate-900">Đang đồng bộ</span>
            </div>
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-[0.04em] text-slate-500">Ưu tiên</span>
              <span className="mt-1 block font-bold text-amber-700">{totalPending + pendingAssetActions} việc chờ xử lý</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((item) => {
          const Icon = item.icon;
          const tone = toneStyles[item.tone];

          return (
            <article key={item.label} className="rounded-xl border border-slate-100 bg-white p-4 shadow-xs">
              <div className="flex items-start justify-between gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tone.icon}`}>
                  <Icon size={20} aria-hidden="true" />
                </div>
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${tone.soft}`}>Live</span>
              </div>
              <div className="mt-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-slate-500">{item.label}</p>
                <p className="mt-1 break-words text-xl font-extrabold leading-tight text-slate-900">{item.value}</p>
                <p className="mt-1 text-xs leading-5 text-slate-600">{item.detail}</p>
              </div>
            </article>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-xs sm:p-5 xl:col-span-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <FolderKanban className="text-indigo-600" size={18} aria-hidden="true" />
                Hàng chờ phê duyệt
              </h3>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                Các hồ sơ cần leader, bộ phận phụ trách hoặc cấp sếp xử lý tiếp theo.
              </p>
            </div>
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700">
              <Clock3 size={12} />
              {totalPending} đang chờ
            </span>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-8 text-center">
              <CheckCircle2 className="mx-auto text-emerald-600" size={28} aria-hidden="true" />
              <p className="mt-3 text-sm font-bold text-slate-800">Không có hồ sơ chờ duyệt</p>
              <p className="mt-1 text-xs text-slate-600">Tất cả luồng nghiệp vụ quan trọng hiện đã được xử lý.</p>
            </div>
          ) : (
            <>
              <div className="mt-5 hidden overflow-hidden rounded-xl border border-slate-100 md:block">
                <table className="w-full border-collapse text-left text-xs">
                  <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-[0.04em] text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Mã hồ sơ</th>
                      <th className="px-4 py-3">Nghiệp vụ</th>
                      <th className="px-4 py-3">Người gửi</th>
                      <th className="px-4 py-3">Phòng ban</th>
                      <th className="px-4 py-3 text-right">Cấp duyệt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pendingRequests.map((request) => (
                      <tr key={request.id} className="transition-colors hover:bg-slate-50/70">
                        <td className="px-4 py-3 font-mono text-[11px] font-bold text-slate-500">{request.id}</td>
                        <td className="max-w-[260px] px-4 py-3">
                          <span className="block truncate font-bold text-slate-900">{request.formTitle}</span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-700">{request.submitterName}</td>
                        <td className="px-4 py-3 text-slate-600">{request.submitterDepartment}</td>
                        <td className="px-4 py-3 text-right">
                          <span className="inline-flex rounded-full border border-indigo-100 bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                            Cấp {request.currentStageIndex + 1}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-5 grid gap-3 md:hidden">
                {pendingRequests.map((request) => (
                  <article key={request.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-mono text-[10px] font-bold text-slate-500">{request.id}</p>
                        <h4 className="mt-1 text-sm font-bold text-slate-900">{request.formTitle}</h4>
                      </div>
                      <span className="shrink-0 rounded-full border border-indigo-100 bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                        Cấp {request.currentStageIndex + 1}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-600">
                      {request.submitterName} · {request.submitterDepartment}
                    </p>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>

        <aside className="rounded-xl border border-slate-100 bg-white p-4 shadow-xs sm:p-5 xl:col-span-4">
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Gauge className="text-indigo-600" size={18} aria-hidden="true" />
            Sức khỏe vận hành
          </h3>
          <div className="mt-4 space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Hoàn tất quy trình</span>
                <span className="font-mono font-bold text-slate-900">{completionRate}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={completionRate} aria-valuemin={0} aria-valuemax={100}>
                <div className="h-full rounded-full bg-emerald-600" style={{ width: clampPercent(completionRate) }} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.04em] text-slate-500">Tài sản cấp phát</span>
                <p className="mt-1 text-lg font-extrabold text-slate-900">{assignedAssets}</p>
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.04em] text-slate-500">Chờ IT/kế toán</span>
                <p className="mt-1 text-lg font-extrabold text-amber-700">{pendingAssetActions}</p>
              </div>
            </div>
            <div className="rounded-lg border border-rose-100 bg-rose-50 p-3 text-xs text-rose-700">
              <div className="flex items-start gap-2">
                <AlertTriangle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                <p>
                  <b>{assetConditions.damaged} tài sản</b> vượt ngưỡng hao mòn cao và cần được đưa vào danh sách kiểm tra.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-xs sm:p-5">
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Layers3 className="text-indigo-600" size={18} aria-hidden="true" />
            Phân bổ hồ sơ
          </h3>
          <div className="mt-4 space-y-3">
            {categoryRows.map((row) => {
              const rowPercent = percent(row.value, totalSubmissions);
              const tone = toneStyles[row.tone];
              return (
                <div key={row.label}>
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="font-semibold text-slate-700">{row.label}</span>
                    <span className="font-mono font-bold text-slate-900">{row.value} · {rowPercent}%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label={row.label} aria-valuenow={rowPercent} aria-valuemin={0} aria-valuemax={100}>
                    <div className={`h-full rounded-full ${tone.bar}`} style={{ width: clampPercent(rowPercent) }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-xs sm:p-5">
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Laptop className="text-indigo-600" size={18} aria-hidden="true" />
            Tình trạng tài sản
          </h3>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {assetRows.map((row) => {
              const tone = toneStyles[row.tone];
              return (
                <div key={row.label} className={`rounded-lg border p-3 text-center ${tone.soft}`}>
                  <p className="text-xl font-extrabold">{row.value}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.04em]">{row.label}</p>
                  <p className="mt-1 text-[10px] opacity-80">{row.caption}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-xs sm:p-5">
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <CircleDollarSign className="text-indigo-600" size={18} aria-hidden="true" />
            Dòng tiền thanh lý
          </h3>
          <div className="mt-4 space-y-3">
            {paymentRows.map((row) => {
              const rowPercent = percent(row.value, totalLiquidationRevenue);
              const tone = toneStyles[row.tone];
              return (
                <div key={row.label} className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${tone.dot}`} />
                    <span className="truncate font-semibold text-slate-700">{row.label}</span>
                  </div>
                  <span className="shrink-0 font-mono font-bold text-slate-900">{formatMoney(row.value)} · {rowPercent}%</span>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-xs sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Activity className="text-indigo-600" size={18} aria-hidden="true" />
              Nhật ký nghiệp vụ gần đây
            </h3>
            <p className="mt-1 text-xs text-slate-600">Dữ liệu mới nhất từ các hồ sơ đang lưu trong hệ thống.</p>
          </div>
          <span className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-600">
            <ArrowUpRight size={12} />
            Audit trail
          </span>
        </div>

        {recentActivities.length === 0 ? (
          <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-8 text-center">
            <Activity className="mx-auto text-slate-400" size={28} aria-hidden="true" />
            <p className="mt-3 text-sm font-bold text-slate-800">Chưa có hoạt động</p>
            <p className="mt-1 text-xs text-slate-600">Hoạt động sẽ xuất hiện khi nhân viên gửi hoặc cập nhật hồ sơ.</p>
          </div>
        ) : (
          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            {recentActivities.map((activity) => {
              const tone = activity.status === 'approved' ? toneStyles.emerald : activity.status === 'rejected' ? toneStyles.rose : toneStyles.amber;
              const label = activity.status === 'approved' ? 'Đã duyệt' : activity.status === 'rejected' ? 'Từ chối' : 'Chờ duyệt';

              return (
                <article key={activity.id} className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${tone.dot}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-slate-500">{activity.id}</span>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${tone.soft}`}>{label}</span>
                    </div>
                    <h4 className="mt-1 truncate text-sm font-bold text-slate-900">{activity.title}</h4>
                    <p className="mt-1 text-xs text-slate-600">
                      {activity.owner} · {activity.department} · {activity.time}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </section>
  );
};
