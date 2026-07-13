import fs from 'fs';
import path from 'path';
import { User, FormTemplate, WorkflowConfig, WorkflowRequest, Asset, ChatMessage, Notification, PaymentTransaction, IncomingDocument, OutgoingDocument, Event, Task, InternalDocument, AuditLog, SharedCategory, OCRDocument, ChatGroup, CloudFile } from '../../types';

interface DatabaseSchema {
  users: User[];
  forms: FormTemplate[];
  workflows: WorkflowConfig[];
  requests: WorkflowRequest[];
  assets: Asset[];
  chats: ChatMessage[];
  notifications: Notification[];
  payments: PaymentTransaction[];
  incomingDocuments: IncomingDocument[];
  outgoingDocuments: OutgoingDocument[];
  events: Event[];
  tasks: Task[];
  internalDocuments: InternalDocument[];
  auditLogs: AuditLog[];
  sharedCategories: SharedCategory[];
  ocrDocuments: OCRDocument[];
  chatGroups?: ChatGroup[];
  cloudFiles?: CloudFile[];
}

const DB_FILE_PATH = path.join(process.cwd(), 'data', 'db.json');

const DEFAULT_USERS: User[] = [
  {
    id: 'admin-1',
    name: 'Kim Kim Tiểu Trương',
    email: 'huwei.techno@gmail.com',
    phoneNumber: '0912345678',
    role: 'admin',
    department: 'Admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    salary: 45000000,
    realName: 'Kim Kim Tiểu Trương',
    cccd: '001096008742',
    address: 'Khu đô thị Vinhomes Ocean Park, Gia Lâm, Hà Nội',
    secondaryPhoneNumber: '',
    gender: 'Nữ',
    birthday: '1995-05-12',
    age: 28,
    position: 'UI/UX Designer',
    level: 'Trung cấp'
  },
  {
    id: 'mgr-tech',
    name: 'Trương Vĩ Thành',
    email: 'quan.tran@company.com',
    phoneNumber: '0987654321',
    role: 'manager',
    department: 'Tech',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    salary: 35000000,
    gender: 'Nam',
    birthday: '1995-05-12',
    age: 28,
    position: 'UI/UX Designer',
    level: 'Trung cấp'
  },
  {
    id: 'mgr-hr',
    name: 'Vương Nhất Nguyệt',
    email: 'hanh.pham@company.com',
    phoneNumber: '0901234567',
    role: 'manager',
    department: 'HR',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    salary: 30000000,
    gender: 'Nữ',
    birthday: '1995-05-12',
    age: 28,
    position: 'Thư ký',
    level: 'Sơ cấp'
  },
  {
    id: 'mgr-finance',
    name: 'Lý Hạc Hiên',
    email: 'khanh.lam@company.com',
    phoneNumber: '0934567890',
    role: 'manager',
    department: 'Finance',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    salary: 32000000,
    gender: 'Nữ',
    birthday: '1995-05-12',
    age: 28,
    position: 'Văn án',
    level: 'Trung cấp'
  },
  {
    id: 'emp-1',
    name: 'Chân Bác Siêu',
    email: 'dat.nguyen@company.com',
    phoneNumber: '0945678901',
    role: 'employee',
    department: 'Tech',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    salary: 18000000,
    gender: 'Nam',
    birthday: '1995-05-12',
    age: 28,
    position: 'Lập trình viên iOS',
    level: 'Cao cấp'
  },
  {
    id: 'emp-2',
    name: 'Đoạn Hân Di',
    email: 'thu.le@company.com',
    phoneNumber: '0956789012',
    role: 'employee',
    department: 'HR',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    salary: 15000000,
    gender: 'Nữ',
    birthday: '1995-05-12',
    age: 28,
    position: 'Thiết kế giao diện UI',
    level: 'Cao cấp'
  },
  {
    id: 'emp-3',
    name: 'Nghiêm Thụy Nguyên',
    email: 'tuan.phan@company.com',
    phoneNumber: '0967890123',
    role: 'employee',
    department: 'Sales',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    salary: 16000000,
    gender: 'Nam',
    birthday: '1995-05-12',
    age: 28,
    position: 'Lập trình viên Android',
    level: 'Cao cấp'
  },
  {
    id: 'emp-4',
    name: 'Vương Tiểu Dạng',
    email: 'yang.wang@company.com',
    phoneNumber: '0978901234',
    role: 'employee',
    department: 'Sales',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    salary: 16000000,
    gender: 'Nữ',
    birthday: '1995-05-12',
    age: 28,
    position: 'Thiết kế trải nghiệm người dùng UE',
    level: 'Cao cấp'
  }
];

const DEFAULT_FORMS: FormTemplate[] = [
  {
    id: 'form-leave',
    title: 'Đơn xin nghỉ phép',
    description: 'Sử dụng để xin nghỉ phép năm, nghỉ ốm, nghỉ chế độ hoặc việc cá nhân.',
    category: 'leave',
    fields: [
      {
        id: 'leave_type',
        type: 'select',
        label: 'Loại nghỉ phép',
        placeholder: 'Chọn loại nghỉ phép...',
        required: true,
        options: ['Nghỉ phép năm (Phép năm)', 'Nghỉ ốm đau', 'Nghỉ việc riêng không lương', 'Nghỉ thai sản/chế độ']
      },
      {
        id: 'start_date',
        type: 'date',
        label: 'Từ ngày',
        placeholder: 'Chọn ngày bắt đầu',
        required: true
      },
      {
        id: 'end_date',
        type: 'date',
        label: 'Đến ngày',
        placeholder: 'Chọn ngày kết thúc',
        required: true
      },
      {
        id: 'num_days',
        type: 'number',
        label: 'Số ngày nghỉ',
        placeholder: 'Nhập số ngày nghỉ',
        required: true,
        validationMin: 0.5,
        validationMax: 30
      },
      {
        id: 'reason',
        type: 'textarea',
        label: 'Lý do xin nghỉ',
        placeholder: 'Nhập chi tiết lý do nghỉ phép...',
        required: true,
        validationMin: 10
      }
    ],
    status: 'active',
    createdBy: 'admin-1',
    createdAt: new Date('2026-06-01').toISOString()
  },
  {
    id: 'form-device-request',
    title: 'Đơn yêu cầu cấp máy móc thiết bị',
    description: 'Yêu cầu cấp phát máy tính xách tay, màn hình, ghế văn phòng hoặc các tài sản làm việc khác.',
    category: 'asset',
    fields: [
      {
        id: 'device_category',
        type: 'select',
        label: 'Loại thiết bị yêu cầu',
        placeholder: 'Chọn loại thiết bị...',
        required: true,
        options: ['Laptop', 'Monitor', 'Phone', 'Chair', 'Desk', 'Other']
      },
      {
        id: 'urgency',
        type: 'select',
        label: 'Mức độ khẩn cấp',
        placeholder: 'Chọn mức độ...',
        required: true,
        options: ['Bình thường', 'Khẩn cấp (Cần ngay trong tuần)', 'Rất khẩn cấp (Cần ngay lập tức)']
      },
      {
        id: 'justification',
        type: 'textarea',
        label: 'Lý do yêu cầu cấp phát',
        placeholder: 'Giải thích lý do công việc cần cấp thiết bị này...',
        required: true,
        validationMin: 15
      }
    ],
    status: 'active',
    createdBy: 'admin-1',
    createdAt: new Date('2026-06-02').toISOString()
  }
];

const DEFAULT_WORKFLOWS: WorkflowConfig[] = [
  {
    id: 'wf-leave',
    formTemplateId: 'form-leave',
    name: 'Quy trình Duyệt Nghỉ Phép Tự Động Đa Cấp',
    stages: [
      {
        stageIndex: 0,
        roleRequired: 'manager',
        title: 'Trưởng phòng phê duyệt',
        description: 'Quản lý trực tiếp của phòng ban xem xét và duyệt lần 1.'
      },
      {
        stageIndex: 1,
        roleRequired: 'admin',
        title: 'Ban Giám Đốc / Nhân sự phê duyệt',
        description: 'Nhân sự kiểm tra số ngày phép còn lại và Ban Giám Đốc ký duyệt phê duyệt cuối.'
      }
    ],
    autoApproveRules: [
      {
        field: 'num_days',
        operator: 'lt',
        value: 3, // Nếu số ngày nghỉ < 3 ngày, chỉ cần 1 cấp duyệt (Quản lý trực tiếp), bỏ qua cấp duyệt 2 (Admin)
        action: 'skip'
      }
    ]
  },
  {
    id: 'wf-device',
    formTemplateId: 'form-device-request',
    name: 'Quy trình Cấp Phát Thiết Bị Công Ty',
    stages: [
      {
        stageIndex: 0,
        roleRequired: 'manager',
        title: 'Trưởng bộ phận xác nhận',
        description: 'Trưởng phòng xác minh nhu cầu cấp phát thực tế của nhân viên.'
      },
      {
        stageIndex: 1,
        roleRequired: 'admin',
        title: 'Quản trị viên / IT cấp phát',
        description: 'Admin kho kiểm tra thiết bị sẵn có và thực hiện bàn giao.'
      }
    ]
  }
];

const DEFAULT_ASSETS: Asset[] = [
  {
    id: 'asset-1',
    name: 'MacBook Pro M2 2023 (16GB/512GB)',
    description: 'Máy tính làm việc hiệu năng cao của Apple, dành cho lập trình viên hoặc thiết kế đồ họa.',
    category: 'Laptop',
    initialCondition: 0, // 0% hỏng hóc (hoàn hảo)
    currentCondition: 10, // 10% hỏng hóc (xước dăm mặt đáy)
    status: 'available',
    purchaseValue: 42000000,
    currentPriceForSale: 30000000
  },
  {
    id: 'asset-2',
    name: 'Dell XPS 15 9520 (32GB/1TB)',
    description: 'Máy tính Dell XPS cao cấp màn hình cảm ứng OLED.',
    category: 'Laptop',
    initialCondition: 5,
    currentCondition: 20, // 20% hỏng hóc (bàn phím mòn bóng nhẹ, pin chai 10%)
    assignedTo: 'emp-1',
    assignedToName: 'Vương An Na',
    assignmentDate: '2026-01-10T08:00:00Z',
    status: 'assigned',
    purchaseValue: 48000000,
    currentPriceForSale: 25000000
  },
  {
    id: 'asset-3',
    name: 'Màn hình Dell UltraSharp U2723QE 27" 4K',
    description: 'Màn hình chuyên dụng cho văn phòng, độ phân giải sắc nét 4K USB-C Hub.',
    category: 'Monitor',
    initialCondition: 0,
    currentCondition: 0,
    assignedTo: 'emp-1',
    assignedToName: 'Vương An Na',
    assignmentDate: '2026-01-15T08:30:00Z',
    status: 'assigned',
    purchaseValue: 12500000,
    currentPriceForSale: 8500000
  },
  {
    id: 'asset-4',
    name: 'Ghế Ergonomic văn phòng Epione EasyChair',
    description: 'Ghế công thái học bảo vệ cột sống cho nhân viên ngồi lâu.',
    category: 'Chair',
    initialCondition: 0,
    currentCondition: 5, // 5% mòn đệm lưới
    assignedTo: 'emp-2',
    assignedToName: 'Trịnh Y Kiện',
    assignmentDate: '2026-02-01T09:00:00Z',
    status: 'assigned',
    purchaseValue: 5500000,
    currentPriceForSale: 3500000
  },
  {
    id: 'asset-5',
    name: 'iPhone 14 Pro Max 256GB Gold',
    description: 'Điện thoại thử nghiệm ứng dụng di động cho phòng Tech.',
    category: 'Phone',
    initialCondition: 10, // xước nhẹ màn hình
    currentCondition: 25, // Pin chai 85%, móp nhẹ góc trái
    status: 'available',
    purchaseValue: 27000000,
    currentPriceForSale: 16000000
  }
];

const DEFAULT_CHATS: ChatMessage[] = [
  {
    id: 'chat-1',
    senderId: 'mgr-hr',
    senderName: 'Lý Hạc Loan',
    senderRole: 'manager',
    recipientId: 'all',
    content: 'Chào mừng tất cả mọi người đến với Hệ thống Quản trị Quy trình Nội bộ của công ty!',
    timestamp: new Date('2026-06-20T08:00:00Z').toISOString()
  },
  {
    id: 'chat-2',
    senderId: 'admin-1',
    senderName: 'Kim Kim Tiểu Trương',
    senderRole: 'admin',
    recipientId: 'all',
    content: 'Mọi người có thể tự tạo các mẫu đơn và cấu hình quy trình duyệt tự động bằng Form Builder kéo thả nhé.',
    timestamp: new Date('2026-06-20T08:15:00Z').toISOString()
  }
];

const DEFAULT_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    userId: 'mgr-tech',
    title: 'Đơn xin nghỉ phép mới',
    message: 'Nhân viên Vương An Na đã gửi đơn xin nghỉ phép 2 ngày đang chờ bạn duyệt.',
    read: false,
    type: 'workflow',
    timestamp: new Date('2026-06-25T01:30:00Z').toISOString()
  }
];

const DEFAULT_PAYMENTS: PaymentTransaction[] = [];

// Existing in-memory DB cache
const DEFAULT_INCOMING_DOCUMENTS: IncomingDocument[] = [
  {
    id: 'doc-1',
    documentNumber: '123/TĐEVN-TC',
    title: 'V/v hướng dẫn quyết toán thuế năm 2026',
    documentDate: '2026-06-15',
    receivedDate: '2026-06-16',
    sender: 'Tập đoàn Điện lực Việt Nam',
    category: 'Công văn',
    urgency: 'urgent',
    confidentiality: 'normal',
    status: 'new',
    attachments: ['HuongDanQuyetToanThue2026.pdf']
  },
  {
    id: 'doc-2',
    documentNumber: '45/QĐ-BCT',
    title: 'Quyết định phê duyệt kế hoạch sản xuất kinh doanh',
    documentDate: '2026-07-01',
    receivedDate: '2026-07-02',
    sender: 'Bộ Công Thương',
    category: 'Quyết định',
    urgency: 'normal',
    confidentiality: 'confidential',
    status: 'assigned',
    assignedTo: ['mgr-tech'],
    attachments: ['QDPheDuyetKH.pdf']
  }
];

const DEFAULT_OUTGOING_DOCUMENTS: OutgoingDocument[] = [
  {
    id: 'out-1',
    title: 'Đề xuất nâng cấp hệ thống phần mềm',
    documentType: 'Tờ trình',
    departmentId: 'Tech',
    drafterId: 'emp-1',
    content: 'Kính gửi Ban Giám đốc,\n\nPhòng Kỹ thuật đề xuất nâng cấp hệ thống máy chủ để đảm bảo...',
    status: 'draft'
  }
];

const DEFAULT_EVENTS: Event[] = [
  {
    id: 'evt-1',
    title: 'Họp giao ban tuần',
    description: 'Báo cáo tiến độ dự án tuần qua',
    startTime: '2026-07-10T09:00:00Z',
    endTime: '2026-07-10T11:00:00Z',
    location: 'Phòng họp A',
    organizerId: 'admin-1',
    attendees: ['mgr-tech', 'mgr-hr', 'mgr-finance'],
    type: 'meeting'
  }
];

const DEFAULT_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Cập nhật hệ thống ERP',
    description: 'Bảo trì bảo mật và nâng cấp tính năng mới',
    assigneeId: 'mgr-tech',
    creatorId: 'admin-1',
    dueDate: '2026-07-15T17:00:00Z',
    status: 'todo',
    priority: 'high'
  }
];

const DEFAULT_INTERNAL_DOCUMENTS: InternalDocument[] = [
  {
    id: 'int-1',
    title: 'Quyết định bổ nhiệm nhân sự mới',
    type: 'decision',
    content: 'Bổ nhiệm ông Nguyễn Văn A giữ chức vụ Giám đốc Kỹ thuật.',
    departmentId: 'Tech',
    creatorId: 'admin-1',
    createdAt: '2026-07-01T08:00:00Z',
    status: 'published'
  }
];

const DEFAULT_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    userId: 'admin-1',
    userName: 'Kim Kim Tiểu Trương',
    action: 'SYSTEM_STARTUP',
    details: 'Hệ thống khởi động',
    ipAddress: '127.0.0.1',
    timestamp: new Date().toISOString()
  }
];

const DEFAULT_SHARED_CATEGORIES: SharedCategory[] = [
  { id: 'cat-1', type: 'document_type', code: 'QD', name: 'Quyết định', isActive: true },
  { id: 'cat-2', type: 'document_type', code: 'TB', name: 'Thông báo', isActive: true },
  { id: 'cat-3', type: 'urgency_level', code: 'NORMAL', name: 'Bình thường', isActive: true },
  { id: 'cat-4', type: 'urgency_level', code: 'URGENT', name: 'Khẩn', isActive: true }
];

const DEFAULT_OCR_DOCUMENTS: OCRDocument[] = [
  {
    id: 'ocr-1',
    fileName: 'hoa_don_thanh_toan_t5.pdf',
    extractedText: 'HÓA ĐƠN GTGT\\nCÔNG TY CP ABC\\nSố tiền: 5.000.000 VNĐ\\nNgày: 15/05/2026',
    confidence: 0.95,
    status: 'completed',
    uploadedAt: '2026-05-15T10:00:00Z',
    uploaderId: 'admin-1'
  }
];

let memoryDB: DatabaseSchema = {
  users: DEFAULT_USERS,
  forms: DEFAULT_FORMS,
  workflows: DEFAULT_WORKFLOWS,
  requests: [],
  assets: DEFAULT_ASSETS,
  chats: DEFAULT_CHATS,
  notifications: DEFAULT_NOTIFICATIONS,
  payments: DEFAULT_PAYMENTS,
  incomingDocuments: DEFAULT_INCOMING_DOCUMENTS,
  outgoingDocuments: DEFAULT_OUTGOING_DOCUMENTS,
  events: DEFAULT_EVENTS,
  tasks: DEFAULT_TASKS,
  internalDocuments: DEFAULT_INTERNAL_DOCUMENTS,
  auditLogs: DEFAULT_AUDIT_LOGS,
  sharedCategories: DEFAULT_SHARED_CATEGORIES,
  ocrDocuments: DEFAULT_OCR_DOCUMENTS,
  chatGroups: [],
  cloudFiles: []
};

export class MockDB {
  private static isLoaded = false;

  private static ensureDataDirExists() {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  static load(): DatabaseSchema {
    if (this.isLoaded) return memoryDB;

    try {
      this.ensureDataDirExists();
      if (fs.existsSync(DB_FILE_PATH)) {
        const fileContent = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        const parsed = JSON.parse(fileContent);
        
        // Merge with defaults and backfill phone numbers if missing
        const rawUsers = parsed.users || DEFAULT_USERS;
        const usersWithPhones = rawUsers.map((u: any) => {
          const defUser = DEFAULT_USERS.find(du => du.id === u.id);
          return {
            ...u,
            phoneNumber: u.phoneNumber || (defUser ? defUser.phoneNumber : '09' + Math.floor(10000000 + Math.random() * 90000000))
          };
        });

        // Merge with defaults to handle schema changes gracefully
        memoryDB = {
          users: usersWithPhones,
          forms: parsed.forms || DEFAULT_FORMS,
          workflows: parsed.workflows || DEFAULT_WORKFLOWS,
          requests: parsed.requests || [],
          assets: parsed.assets || DEFAULT_ASSETS,
          chats: parsed.chats || DEFAULT_CHATS,
          notifications: parsed.notifications || DEFAULT_NOTIFICATIONS,
          payments: parsed.payments || DEFAULT_PAYMENTS,
          incomingDocuments: parsed.incomingDocuments || DEFAULT_INCOMING_DOCUMENTS,
          outgoingDocuments: parsed.outgoingDocuments || DEFAULT_OUTGOING_DOCUMENTS,
          events: parsed.events || DEFAULT_EVENTS,
          tasks: parsed.tasks || DEFAULT_TASKS,
          internalDocuments: parsed.internalDocuments || DEFAULT_INTERNAL_DOCUMENTS,
          auditLogs: parsed.auditLogs || DEFAULT_AUDIT_LOGS,
          sharedCategories: parsed.sharedCategories || DEFAULT_SHARED_CATEGORIES,
          ocrDocuments: parsed.ocrDocuments || DEFAULT_OCR_DOCUMENTS,
          chatGroups: parsed.chatGroups || [],
          cloudFiles: parsed.cloudFiles || []
        };
      } else {
        this.save();
      }
    } catch (err) {
      console.warn('⚠️ Unable to read DB file, falling back to memory database:', err);
    }

    this.isLoaded = true;
    return memoryDB;
  }

  static save(): void {
    try {
      this.ensureDataDirExists();
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(memoryDB, null, 2), 'utf-8');
    } catch (err) {
      console.warn('⚠️ Unable to write to DB file, data is active in memory:', err);
    }
  }

  // MVC Models Mimic Interface

  static getCollection<K extends keyof DatabaseSchema>(collection: K): DatabaseSchema[K] {
    this.load();
    return memoryDB[collection];
  }

  static find<K extends keyof DatabaseSchema>(
    collection: K,
    predicate: (item: any) => boolean
  ): DatabaseSchema[K] {
    const data = this.getCollection(collection);
    return data.filter(predicate) as DatabaseSchema[K];
  }

  static findOne<K extends keyof DatabaseSchema>(
    collection: K,
    predicate: (item: any) => boolean
  ): any | undefined {
    const data = this.getCollection(collection);
    return data.find(predicate);
  }

  static insertOne<K extends keyof DatabaseSchema>(
    collection: K,
    item: any
  ): any {
    this.load();
    memoryDB[collection].push(item);
    this.save();
    return item;
  }

  static updateOne<K extends keyof DatabaseSchema>(
    collection: K,
    predicate: (item: any) => boolean,
    update: Partial<any>
  ): boolean {
    this.load();
    const list = memoryDB[collection];
    const index = list.findIndex(predicate);
    if (index !== -1) {
      list[index] = { ...list[index], ...update };
      this.save();
      return true;
    }
    return false;
  }

  static deleteOne<K extends keyof DatabaseSchema>(
    collection: K,
    predicate: (item: any) => boolean
  ): boolean {
    this.load();
    const list = memoryDB[collection];
    const index = list.findIndex(predicate);
    if (index !== -1) {
      list.splice(index, 1);
      this.save();
      return true;
    }
    return false;
  }

  static reset(): void {
    memoryDB = {
      users: DEFAULT_USERS,
      forms: DEFAULT_FORMS,
      workflows: DEFAULT_WORKFLOWS,
      requests: [],
      assets: DEFAULT_ASSETS,
      chats: DEFAULT_CHATS,
      notifications: DEFAULT_NOTIFICATIONS,
      payments: DEFAULT_PAYMENTS,
      incomingDocuments: DEFAULT_INCOMING_DOCUMENTS,
      outgoingDocuments: DEFAULT_OUTGOING_DOCUMENTS,
      events: DEFAULT_EVENTS,
      tasks: DEFAULT_TASKS,
      internalDocuments: DEFAULT_INTERNAL_DOCUMENTS,
      auditLogs: DEFAULT_AUDIT_LOGS,
      sharedCategories: DEFAULT_SHARED_CATEGORIES,
      ocrDocuments: DEFAULT_OCR_DOCUMENTS,
      chatGroups: [],
      cloudFiles: []
    };
    this.save();
  }
}
