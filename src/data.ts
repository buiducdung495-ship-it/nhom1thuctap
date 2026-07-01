import { User, DocumentTemplate, WorkflowConfig, Document, Company } from './types';

export const DEFAULT_COMPANIES: Company[] = [
  { id: 'com_1', name: 'Công ty Công nghệ Việt Nam (VinaTech)', taxCode: '0101234567', description: 'Đơn vị phát triển phần mềm và giải pháp chuyển đổi số doanh nghiệp.', active: true },
  { id: 'com_2', name: 'Tập đoàn Bán lẻ Toàn Cầu (VinaGroup)', taxCode: '0309876543', description: 'Chuỗi cung ứng dịch vụ bán lẻ và thương mại điện tử đa kênh.', active: true }
];

export const DEFAULT_USERS: User[] = [
  { id: 'usr_1', name: 'Nguyễn Văn A', email: 'vana@company.com', role: 'staff', active: true, department: 'Hành chính Nhân sự', companyId: 'com_1', companyName: 'Công ty Công nghệ Việt Nam (VinaTech)', password: '123' },
  { id: 'usr_2', name: 'Trần Thị B', email: 'thib@company.com', role: 'staff', active: true, department: 'Kỹ thuật Công nghệ', companyId: 'com_1', companyName: 'Công ty Công nghệ Việt Nam (VinaTech)', password: '123' },
  { id: 'usr_3', name: 'Phạm Minh C', email: 'minhc@company.com', role: 'approver', active: true, department: 'Phòng Kế hoạch', companyId: 'com_1', companyName: 'Công ty Công nghệ Việt Nam (VinaTech)', signatureCode: 'SIG-PM-C-8891', password: '123' },
  { id: 'usr_4', name: 'Lê Hoàng D', email: 'hoangd@company.com', role: 'approver', active: true, department: 'Ban Giám đốc', companyId: 'com_1', companyName: 'Công ty Công nghệ Việt Nam (VinaTech)', signatureCode: 'SIG-LH-D-2342', password: '123' },
  { id: 'usr_5', name: 'Nguyễn Thùy E', email: 'thuye@company.com', role: 'leader', active: true, department: 'Ban Điều hành', companyId: 'com_1', companyName: 'Công ty Công nghệ Việt Nam (VinaTech)', signatureCode: 'SIG-NT-E-9901', password: '123' },
  { id: 'usr_6', name: 'Trần Hữu Admin', email: 'admin', role: 'admin', active: true, department: 'Ban Quản trị Website', companyId: 'system', companyName: 'Hệ thống Quản trị Web', password: 'admin' },
  
  // com_2 members
  { id: 'usr_7', name: 'Phạm Khánh Linh', email: 'linh.pk@vinagroup.com', role: 'staff', active: true, department: 'Hành chính Nhân sự', companyId: 'com_2', companyName: 'Tập đoàn Bán lẻ Toàn Cầu (VinaGroup)', password: '123' },
  { id: 'usr_8', name: 'Nguyễn Minh Quân', email: 'quan.nm@vinagroup.com', role: 'leader', active: true, department: 'Ban Giám đốc', companyId: 'com_2', companyName: 'Tập đoàn Bán lẻ Toàn Cầu (VinaGroup)', signatureCode: 'SIG-NM-Q-7721', password: '123' },
  { id: 'usr_9', name: 'Đặng Hồng Phong', email: 'phong@vinagroup.com', role: 'approver', active: true, department: 'Ban Điều hành', companyId: 'com_2', companyName: 'Tập đoàn Bán lẻ Toàn Cầu (VinaGroup)', signatureCode: 'SIG-DH-P-1290', password: '123' }
];

export const DEFAULT_TEMPLATES: DocumentTemplate[] = [
  {
    id: 'tpl_1',
    title: 'Đơn Xin Nghỉ Phép Năm',
    category: 'Hành chính Nhân sự',
    description: 'Mẫu đơn xin nghỉ phép năm dành cho cán bộ nhân viên công ty.',
    companyId: 'com_1',
    content: 'Kính gửi Ban Giám đốc và Phòng Hành chính Nhân sự,\n\nTên tôi là: {{Full Name}}\nChức vụ: {{Job Title}}\nPhòng ban: {{Department}}\n\nTôi viết đơn này để xin phép được nghỉ phép năm từ ngày {{Start Date}} đến hết ngày {{End Date}}.\nLý do xin nghỉ: {{Reason}}\n\nTrong thời gian nghỉ, tôi xin ủy quyền giải quyết công việc khẩn cấp cho đồng nghiệp: {{Backup Person}}.\n\nRất mong Ban Giám đốc xem xét và phê duyệt.\nXin trân trọng cảm ơn!',
    requiredFields: [
      { id: 'fullName', label: 'Họ và tên nhân viên', type: 'text', placeholder: 'Nhập đầy đủ họ tên' },
      { id: 'jobTitle', label: 'Chức danh công việc', type: 'text', placeholder: 'Ví dụ: Kỹ sư Phần mềm' },
      { id: 'dept', label: 'Phòng ban công tác', type: 'text', placeholder: 'Ví dụ: Phòng Kỹ thuật' },
      { id: 'startDate', label: 'Từ ngày', type: 'date' },
      { id: 'endDate', label: 'Đến hết ngày', type: 'date' },
      { id: 'reason', label: 'Lý do xin nghỉ phép', type: 'textarea', placeholder: 'Nêu rõ lý do nghỉ...' },
      { id: 'backup', label: 'Người bàn giao công việc', type: 'text', placeholder: 'Tên đồng nghiệp hỗ trợ' }
    ]
  },
  {
    id: 'tpl_2',
    title: 'Tờ Trình Mua Sắm Trang Thiết Bị',
    category: 'Kế hoạch Tài chính',
    description: 'Yêu cầu cấp phát hoặc mua sắm trang thiết bị làm việc mới cho dự án hoặc phòng ban.',
    companyId: 'com_1',
    content: 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập - Tự do - Hạnh phúc\n\nTỜ TRÌNH MUA SẮM THIẾT BỊ\n\nKính gửi: Ban Giám đốc Công ty và Phòng Kế hoạch Tài chính,\n\nBộ phận đề xuất: {{Department}}\nNgười làm tờ trình: {{Requester}}\nLý do mua sắm: {{Reason}}\n\nDanh sách trang thiết bị đề xuất:\n{{Items List}}\n\nTổng kinh phí dự kiến: {{Budget}} VNĐ\n\nKính trình Ban Giám đốc xem xét, phê duyệt chủ trương mua sắm để đơn vị có đầy đủ trang thiết bị thực hiện nhiệm vụ.',
    requiredFields: [
      { id: 'department', label: 'Bộ phận đề xuất', type: 'text', placeholder: 'Ví dụ: Ban Công nghệ' },
      { id: 'requester', label: 'Người lập đề xuất', type: 'text', placeholder: 'Họ và tên' },
      { id: 'reason', label: 'Mục đích sử dụng & Tính cấp thiết', type: 'textarea', placeholder: 'Tại sao cần mua trang thiết bị này?' },
      { id: 'itemsList', label: 'Danh sách thiết bị (Số lượng, Đơn giá)', type: 'textarea', placeholder: '1. Laptop Dell XPS - SL: 2 - Đơn giá: 35.000.000đ\n2. Màn hình Dell 24 inch - SL: 2 - Đơn giá: 5.000.000đ' },
      { id: 'budget', label: 'Tổng ngân sách dự kiến (VNĐ)', type: 'number', placeholder: 'Ví dụ: 80000000' }
    ]
  },
  {
    id: 'tpl_3',
    title: 'Quyết Định Bổ Nhiệm Nhân Sự',
    category: 'Văn bản Pháp lý',
    description: 'Quyết định bổ nhiệm nhân sự vào các vị trí quản lý hoặc chuyên môn cao.',
    companyId: 'com_1',
    content: 'CÔNG TY CỔ PHẦN CÔNG NGHỆ & ĐẦU TƯ TOÀN CẦU\n\nQUYẾT ĐỊNH BỔ NHIỆM CÁN BỘ\n\n- Căn cứ vào Điều lệ hoạt động công ty.\n- Căn cứ vào nhu cầu nhân sự và năng lực cán bộ.\n\nQUYẾT ĐỊNH:\n\nĐiều 1: Bổ nhiệm ông/bà: {{Appointed Person}}\nGiữ chức vụ: {{New Role}} kể từ ngày {{Effective Date}}.\n\nĐiều 2: Mức lương, phụ cấp và các quyền lợi khác của ông/bà {{Appointed Person}} được thực hiện theo Quy chế lương thưởng của Công ty.\n\nĐiều 3: Các Phòng Ban liên quan và ông/bà {{Appointed Person}} có trách nhiệm thi hành quyết định này.',
    requiredFields: [
      { id: 'appointedPerson', label: 'Họ tên nhân sự được bổ nhiệm', type: 'text', placeholder: 'Nhập họ tên đầy đủ' },
      { id: 'newRole', label: 'Chức danh mới bổ nhiệm', type: 'text', placeholder: 'Ví dụ: Trưởng phòng Marketing' },
      { id: 'effectiveDate', label: 'Ngày có hiệu lực', type: 'date' }
    ]
  },
  // com_2 templates
  {
    id: 'tpl_4',
    title: 'Đơn Xin Nghỉ Phép Năm',
    category: 'Hành chính Nhân sự',
    description: 'Đơn đề nghị nghỉ phép của VinaGroup.',
    companyId: 'com_2',
    content: 'Kính gửi Ban nhân sự VinaGroup,\nTên tôi là: {{Full Name}}\nMục đích nghỉ phép: {{Reason}}',
    requiredFields: [
      { id: 'fullName', label: 'Họ và tên', type: 'text' },
      { id: 'reason', label: 'Lý do', type: 'textarea' }
    ]
  }
];

export const DEFAULT_WORKFLOWS: WorkflowConfig[] = [
  {
    id: 'wf_1',
    name: 'Quy trình Duyệt Nghỉ Phép (VinaTech)',
    description: 'Quy trình phê duyệt đơn xin nghỉ phép cấp phòng ban và nhân sự.',
    companyId: 'com_1',
    steps: [
      { stepNumber: 1, label: 'Quản lý Trực tiếp Phê duyệt', role: 'approver', userId: 'usr_3', userName: 'Phạm Minh C' },
      { stepNumber: 2, label: 'Ban Giám đốc Phê duyệt', role: 'leader', userId: 'usr_5', userName: 'Nguyễn Thùy E' }
    ]
  },
  {
    id: 'wf_2',
    name: 'Quy trình Mua Sắm Tài Sản (VinaTech)',
    description: 'Luồng duyệt mua sắm công cụ dụng cụ ngân sách vừa và nhỏ.',
    companyId: 'com_1',
    steps: [
      { stepNumber: 1, label: 'Phòng Kế hoạch Thẩm định', role: 'approver', userId: 'usr_3', userName: 'Phạm Minh C' },
      { stepNumber: 2, label: 'Ban Điều hành Phê duyệt Chi', role: 'leader', userId: 'usr_5', userName: 'Nguyễn Thùy E' }
    ]
  },
  {
    id: 'wf_3',
    name: 'Quy trình Ký Quyết định Bổ nhiệm (VinaTech)',
    description: 'Luồng duyệt quyết định bổ nhiệm nhân sự trung và cao cấp.',
    companyId: 'com_1',
    steps: [
      { stepNumber: 1, label: 'Trưởng phòng Nhân sự thông qua', role: 'approver', userId: 'usr_3', userName: 'Phạm Minh C' },
      { stepNumber: 2, label: 'Phó Giám đốc Ký nháy', role: 'approver', userId: 'usr_4', userName: 'Lê Hoàng D' },
      { stepNumber: 3, label: 'Tổng Giám đốc Ký phê duyệt chính thức', role: 'leader', userId: 'usr_5', userName: 'Nguyễn Thùy E' }
    ]
  },
  // com_2 workflows
  {
    id: 'wf_4',
    name: 'Quy trình Ký duyệt Nội bộ (VinaGroup)',
    description: 'Quy trình duyệt hồ sơ chung của VinaGroup.',
    companyId: 'com_2',
    steps: [
      { stepNumber: 1, label: 'Tổng Giám đốc phê duyệt và ký số CA', role: 'leader', userId: 'usr_8', userName: 'Nguyễn Minh Quân' }
    ]
  }
];

export const DEFAULT_DOCUMENTS: Document[] = [
  {
    id: 'doc_1',
    title: 'Đơn xin nghỉ phép cưới - Nguyễn Văn A',
    content: 'Kính gửi Ban Giám đốc và Phòng Hành chính Nhân sự,\n\nTên tôi là: Nguyễn Văn A\nChức vụ: Nhân viên Lập trình\nPhòng ban: Kỹ thuật Công nghệ\n\nTôi viết đơn này để xin phép được nghỉ phép năm từ ngày 2026-07-05 đến hết ngày 2026-07-12.\nLý do xin nghỉ: Giải quyết việc cưới xin của gia đình.\n\nTrong thời gian nghỉ, tôi xin ủy quyền giải quyết công việc khẩn cấp cho đồng nghiệp: Trần Thị B.\n\nRất mong Ban Giám đốc xem xét và phê duyệt.\nXin trân trọng cảm ơn!',
    templateId: 'tpl_1',
    status: 'approved',
    creatorId: 'usr_1',
    creatorName: 'Nguyễn Văn A',
    creatorDepartment: 'Hành chính Nhân sự',
    companyId: 'com_1',
    createdAt: '2026-06-25T08:30:00Z',
    updatedAt: '2026-06-26T14:20:00Z',
    attachments: [
      { id: 'att_1', name: 'Giay_moi_cuoi.pdf', size: '1.2 MB', type: 'application/pdf' }
    ],
    workflowId: 'wf_1',
    workflowName: 'Quy trình Duyệt Nghỉ Phép (VinaTech)',
    currentStepNumber: 3, // Finished (exceeded step 2)
    approvalSteps: [
      {
        stepNumber: 1,
        label: 'Quản lý Trực tiếp Phê duyệt',
        role: 'approver',
        assignedUserId: 'usr_3',
        assignedUserName: 'Phạm Minh C',
        status: 'approved',
        comment: 'Phòng đã sắp xếp nhân sự hỗ trợ, đồng ý cho A nghỉ phép.',
        signedAt: '2026-06-25T10:15:00Z',
        signatureCode: 'SIG-PM-C-8891'
      },
      {
        stepNumber: 2,
        label: 'Ban Giám đốc Phê duyệt',
        role: 'leader',
        assignedUserId: 'usr_5',
        assignedUserName: 'Nguyễn Thùy E',
        status: 'approved',
        comment: 'Chúc mừng hạnh phúc gia đình em! Đồng ý duyệt phép năm.',
        signedAt: '2026-06-26T14:20:00Z',
        signatureCode: 'SIG-NT-E-9901'
      }
    ],
    history: [
      { timestamp: '2026-06-25T08:30:00Z', actor: 'Nguyễn Văn A', role: 'staff', action: 'create', details: 'Khởi tạo tài liệu từ mẫu Đơn Xin Nghỉ Phép Năm' },
      { timestamp: '2026-06-25T08:35:00Z', actor: 'Nguyễn Văn A', role: 'staff', action: 'submit', details: 'Gửi yêu cầu phê duyệt lên hệ thống' },
      { timestamp: '2026-06-25T10:15:00Z', actor: 'Phạm Minh C', role: 'approver', action: 'approve', comment: 'Phòng đã sắp xếp nhân sự hỗ trợ, đồng ý cho A nghỉ phép.', details: 'Phê duyệt bước 1 và chuyển tiếp lên Ban Giám đốc' },
      { timestamp: '2026-06-26T14:20:00Z', actor: 'Nguyễn Thùy E', role: 'leader', action: 'approve', comment: 'Chúc mừng hạnh phúc gia đình em! Đồng ý duyệt phép năm.', details: 'Ký số phê duyệt hoàn thành quy trình' }
    ],
    digitalSignature: {
      signedBy: 'Nguyễn Thùy E',
      signedAt: '2026-06-26T14:20:00Z',
      certificateCode: 'SIG-NT-E-9901'
    }
  },
  {
    id: 'doc_2',
    title: 'Tờ trình mua 2 chiếc Laptop Dell phục vụ dự án AI mới',
    content: 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\nĐộc lập - Tự do - Hạnh phúc\n\nTỜ TRÌNH MUA SẮM THIẾT BỊ\n\nKính gửi: Ban Giám đốc Công ty và Phòng Kế hoạch Tài chính,\n\nBộ phận đề xuất: Kỹ thuật Công nghệ\nNgười làm tờ trình: Trần Thị B\nLý do mua sắm: Cấp phát máy tính cấu hình cao cho 2 kỹ sư AI mới gia nhập dự án ngày 15/7.\n\nDanh sách trang thiết bị đề xuất:\n1. Laptop Dell XPS 15 - SL: 2 - Đơn giá: 35.000.000 VNĐ\n\nTổng kinh phí dự kiến: 70000000 VNĐ\n\nKính trình Ban Giám đốc xem xét, phê duyệt chủ trương mua sắm để đơn vị có đầy đủ trang thiết bị thực hiện nhiệm vụ.',
    templateId: 'tpl_2',
    status: 'pending',
    creatorId: 'usr_2',
    creatorName: 'Trần Thị B',
    creatorDepartment: 'Kỹ thuật Công nghệ',
    companyId: 'com_1',
    createdAt: '2026-06-28T09:00:00Z',
    updatedAt: '2026-06-29T11:00:00Z',
    attachments: [
      { id: 'att_2', name: 'Bao_gia_dell_laptop.pdf', size: '240 KB', type: 'application/pdf' }
    ],
    workflowId: 'wf_2',
    workflowName: 'Quy trình Mua Sắm Tài Sản (VinaTech)',
    currentStepNumber: 2, // Waiting for CEO E
    approvalSteps: [
      {
        stepNumber: 1,
        label: 'Phòng Kế hoạch Thẩm định',
        role: 'approver',
        assignedUserId: 'usr_3',
        assignedUserName: 'Phạm Minh C',
        status: 'approved',
        comment: 'Đã thẩm định giá thị trường và đối chiếu ngân sách dự phòng. Phù hợp.',
        signedAt: '2026-06-29T11:00:00Z',
        signatureCode: 'SIG-PM-C-8891'
      },
      {
        stepNumber: 2,
        label: 'Ban Điều hành Phê duyệt Chi',
        role: 'leader',
        assignedUserId: 'usr_5',
        assignedUserName: 'Nguyễn Thùy E',
        status: 'pending',
        comment: ''
      }
    ],
    history: [
      { timestamp: '2026-06-28T09:00:00Z', actor: 'Trần Thị B', role: 'staff', action: 'create', details: 'Khởi tạo tài liệu từ mẫu Tờ Trình Mua Sắm Trang Thiết Bị' },
      { timestamp: '2026-06-28T09:12:00Z', actor: 'Trần Thị B', role: 'staff', action: 'submit', details: 'Gửi yêu cầu phê duyệt lên hệ thống' },
      { timestamp: '2026-06-29T11:00:00Z', actor: 'Phạm Minh C', role: 'approver', action: 'approve', comment: 'Đã thẩm định giá thị trường và đối chiếu ngân sách dự phòng. Phù hợp.', details: 'Phê duyệt bước 1 và chuyển tiếp lên Ban Điều hành' }
    ]
  },
  {
    id: 'doc_3',
    title: 'Đơn xin nghỉ phép 5 ngày nghỉ ốm điều trị - Nguyễn Văn A',
    content: 'Kính gửi Ban Giám đốc và Phòng Hành chính Nhân sự,\n\nTên tôi là: Nguyễn Văn A\nChức vụ: Nhân viên Lập trình\nPhòng ban: Kỹ thuật Công nghệ\n\nTôi viết đơn này để xin phép được nghỉ phép năm từ ngày 2026-06-29 đến hết ngày 2026-07-03.\nLý do xin nghỉ: Điều trị y khoa theo chỉ định của bác sĩ tại bệnh viện Trung ương.\n\nTrong thời gian nghỉ, tôi xin ủy quyền giải quyết công việc khẩn cấp cho đồng nghiệp: Trần Thị B.\n\nRất mong Ban Giám đốc xem xét và phê duyệt.\nXin trân trọng cảm ơn!',
    templateId: 'tpl_1',
    status: 'editing_required',
    creatorId: 'usr_1',
    creatorName: 'Nguyễn Văn A',
    creatorDepartment: 'Hành chính Nhân sự',
    companyId: 'com_1',
    createdAt: '2026-06-29T02:00:00Z',
    updatedAt: '2026-06-29T04:30:00Z',
    attachments: [],
    workflowId: 'wf_1',
    workflowName: 'Quy trình Duyệt Nghỉ Phép (VinaTech)',
    currentStepNumber: 1, // Still step 1, needs rewrite
    approvalSteps: [
      {
        stepNumber: 1,
        label: 'Quản lý Trực tiếp Phê duyệt',
        role: 'approver',
        assignedUserId: 'usr_3',
        assignedUserName: 'Phạm Minh C',
        status: 'rejected',
        comment: 'Vui lòng đính kèm hình ảnh Giấy khám sức khỏe hoặc chỉ định nhập viện để phòng nhân sự lưu hồ sơ bảo hiểm.'
      },
      {
        stepNumber: 2,
        label: 'Ban Giám đốc Phê duyệt',
        role: 'leader',
        assignedUserId: 'usr_5',
        assignedUserName: 'Nguyễn Thùy E',
        status: 'waiting',
        comment: ''
      }
    ],
    history: [
      { timestamp: '2026-06-29T02:00:00Z', actor: 'Nguyễn Văn A', role: 'staff', action: 'create', details: 'Khởi tạo tài liệu nghỉ ốm' },
      { timestamp: '2026-06-29T02:10:00Z', actor: 'Nguyễn Văn A', role: 'staff', action: 'submit', details: 'Gửi yêu cầu phê duyệt' },
      { timestamp: '2026-06-29T04:30:00Z', actor: 'Phạm Minh C', role: 'approver', action: 'edit_request', comment: 'Vui lòng đính kèm hình ảnh Giấy khám sức khỏe hoặc chỉ định nhập viện để phòng nhân sự lưu hồ sơ bảo hiểm.', details: 'Yêu cầu nhân viên bổ sung hồ sơ và trả về trạng thái Chờ Chỉnh Sửa' }
    ]
  },
  {
    id: 'doc_4',
    title: 'Đơn xin nghỉ phép thử việc VinaGroup - Phạm Khánh Linh',
    content: 'Kính gửi Ban nhân sự VinaGroup,\nTên tôi là: Phạm Khánh Linh\nMục đích nghỉ phép: Giải quyết việc cá nhân gấp gia đình.',
    templateId: 'tpl_4',
    status: 'pending',
    creatorId: 'usr_7',
    creatorName: 'Phạm Khánh Linh',
    creatorDepartment: 'Hành chính Nhân sự',
    companyId: 'com_2',
    createdAt: '2026-06-29T05:00:00Z',
    updatedAt: '2026-06-29T05:00:00Z',
    attachments: [],
    workflowId: 'wf_4',
    workflowName: 'Quy trình Ký duyệt Nội bộ (VinaGroup)',
    currentStepNumber: 1,
    approvalSteps: [
      {
        stepNumber: 1,
        label: 'Tổng Giám đốc phê duyệt và ký số CA',
        role: 'leader',
        assignedUserId: 'usr_8',
        assignedUserName: 'Nguyễn Minh Quân',
        status: 'pending'
      }
    ],
    history: [
      { timestamp: '2026-06-29T05:00:00Z', actor: 'Phạm Khánh Linh', role: 'staff', action: 'create', details: 'Khởi tạo tài liệu' }
    ]
  }
];

// Helper functions for Local Storage Persistence
export function loadFromLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const saved = localStorage.getItem(`applet_v2_${key}`);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (e) {
    console.error(`Error loading key ${key} from localStorage`, e);
    return defaultValue;
  }
}

export function saveToLocalStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`applet_v2_${key}`, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving key ${key} to localStorage`, e);
  }
}

export function initializeDatabase() {
  const companies = loadFromLocalStorage<Company[]>('companies', DEFAULT_COMPANIES);
  let users = loadFromLocalStorage<User[]>('users', DEFAULT_USERS);
  
  // Ensure the admin user exists with username 'admin' and password 'admin'
  const adminIndex = users.findIndex(u => u.role === 'admin');
  if (adminIndex !== -1) {
    users[adminIndex] = {
      ...users[adminIndex],
      email: 'admin',
      password: 'admin',
      companyId: 'system',
      companyName: 'Hệ thống Quản trị Web',
      active: true
    };
  } else {
    users.push({
      id: 'usr_6',
      name: 'Trần Hữu Admin',
      email: 'admin',
      role: 'admin',
      active: true,
      department: 'Ban Quản trị Website',
      companyId: 'system',
      companyName: 'Hệ thống Quản trị Web',
      password: 'admin'
    });
  }

  const templates = loadFromLocalStorage<DocumentTemplate[]>('templates', DEFAULT_TEMPLATES);
  const workflows = loadFromLocalStorage<WorkflowConfig[]>('workflows', DEFAULT_WORKFLOWS);
  const documents = loadFromLocalStorage<Document[]>('documents', DEFAULT_DOCUMENTS);

  // Re-save to guarantee they exist in local storage
  saveToLocalStorage('companies', companies);
  saveToLocalStorage('users', users);
  saveToLocalStorage('templates', templates);
  saveToLocalStorage('workflows', workflows);
  saveToLocalStorage('documents', documents);

  return { companies, users, templates, workflows, documents };
}
