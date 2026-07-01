export type Role = 'staff' | 'approver' | 'admin' | 'leader';

export interface Company {
  id: string;
  name: string;
  taxCode?: string;
  description?: string;
  active?: boolean; // Set to true if approved by System Admin
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  department: string;
  companyId: string;    // Scoped to a company
  companyName: string;  // Cached company name
  signatureCode?: string; // Digital signature certificate identifier
  password?: string;    // Account password
}

export interface DocumentTemplate {
  id: string;
  title: string;
  category: string;
  content: string; // HTML or Markdown default content structure
  description: string;
  companyId: string; // Scoped to a company
  requiredFields: Array<{
    id: string;
    label: string;
    type: 'text' | 'textarea' | 'date' | 'number';
    placeholder?: string;
  }>;
}

export interface WorkflowStepConfig {
  stepNumber: number;
  label: string;
  role: Role;
  userId?: string; // Specific user assigned if any
  userName?: string; // Cache user name for UI
}

export interface WorkflowConfig {
  id: string;
  name: string;
  description: string;
  companyId: string; // Scoped to a company
  steps: WorkflowStepConfig[];
}

export interface Attachment {
  id: string;
  name: string;
  size: string;
  type: string;
  url?: string;
}

export interface ApprovalHistoryItem {
  timestamp: string;
  actor: string;
  role: string;
  action: 'create' | 'submit' | 'comment' | 'approve' | 'reject' | 'delegate' | 'sign' | 'edit_request';
  comment?: string;
  details?: string;
}

export interface LiveApprovalStep {
  stepNumber: number;
  label: string;
  role: Role;
  assignedUserId: string;
  assignedUserName: string;
  status: 'pending' | 'approved' | 'rejected' | 'waiting' | 'delegated';
  comment?: string;
  signedAt?: string;
  signatureCode?: string;
  delegatedToId?: string;
  delegatedToName?: string;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  templateId?: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'editing_required';
  creatorId: string;
  creatorName: string;
  creatorDepartment: string;
  companyId: string;    // Scoped to a company
  createdAt: string;
  updatedAt: string;
  attachments: Attachment[];
  workflowId: string;
  workflowName: string;
  currentStepNumber: number; // 1-indexed, or 0 if draft, or completed
  approvalSteps: LiveApprovalStep[];
  history: ApprovalHistoryItem[];
  digitalSignature?: {
    signedBy: string;
    signedAt: string;
    certificateCode: string;
  };
}

export interface DashboardReport {
  totalDocs: number;
  pendingDocs: number;
  approvedDocs: number;
  rejectedDocs: number;
  docsByType: Record<string, number>;
  docsByDepartment: Record<string, number>;
  avgApprovalTimeHours: number;
}
