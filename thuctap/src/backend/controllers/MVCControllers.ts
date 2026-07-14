import { Request, Response } from 'express';
import { UserModel } from '../models/UserModel';
import { FormModel } from '../models/FormModel';
import { WorkflowModel } from '../models/WorkflowModel';
import { RequestModel } from '../models/RequestModel';
import { AssetModel } from '../models/AssetModel';
import { ChatMessageModel } from '../models/ChatMessageModel';
import { ChatGroupModel } from '../models/ChatGroupModel';
import { NotificationModel } from '../models/NotificationModel';
import { PaymentModel } from '../models/PaymentModel';
import { IncomingDocumentModel } from '../models/IncomingDocumentModel';
import { OutgoingDocumentModel } from '../models/OutgoingDocumentModel';
import { EventModel } from '../models/EventModel';
import { TaskModel } from '../models/TaskModel';
import { InternalDocumentModel } from '../models/InternalDocumentModel';
import { AuditLogModel } from '../models/AuditLogModel';
import { SharedCategoryModel } from '../models/SharedCategoryModel';
import { OCRDocumentModel } from '../models/OCRDocumentModel';
import { CloudFileModel } from '../models/CloudFileModel';

import { WorkflowService } from '../services/WorkflowService';
import { AssetService } from '../services/AssetService';
import { AIService } from '../services/AIService';

import { FormTemplate, WorkflowConfig, User } from '../../types';

export class UserController {
  static getUsers(req: Request, res: Response) {
    try {
      const users = UserModel.findAll();
      res.json(users);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static getUserById(req: Request, res: Response) {
    try {
      const user = UserModel.findById(req.params.id);
      if (!user) return res.status(404).json({ error: 'Không tìm thấy người dùng' });
      res.json(user);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static login(req: Request, res: Response) {
    try {
      const { identifier, employeeId, skip2FA } = req.body;
      if (!identifier || !employeeId) {
        return res.status(400).json({ error: 'Email/Số điện thoại và Mã nhân viên là bắt buộc.' });
      }

      const user = UserModel.findByEmailOrPhoneAndId(identifier, employeeId);
      if (!user) {
        return res.status(401).json({ error: 'Thông tin đăng nhập không chính xác hoặc người dùng không tồn tại.' });
      }

      if (!skip2FA) {
        // MOCK: Require 2FA OTP
        return res.status(202).json({ require2FA: true, message: 'Vui lòng nhập mã OTP đã gửi qua SMS/Email.' });
      }

      AuditLogModel.create({
        id: `audit-${Date.now()}`,
        userId: user.id,
        userName: user.name,
        action: 'login',
        details: 'Đăng nhập thành công',
        ipAddress: req.ip || '127.0.0.1',
        timestamp: new Date().toISOString()
      });

      res.json({ success: true, user });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static register(req: Request, res: Response) {
    try {
      const { name, email, phoneNumber, role, department, id, avatar, salary, gender, birthday, age, position, level } = req.body;
      if (!name || !email || !phoneNumber || !role || !department || !id) {
        return res.status(400).json({ error: 'Tất cả các trường bắt buộc phải điền.' });
      }

      // Check if email already registered
      const existingEmail = UserModel.findByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ error: 'Email đã được đăng ký trong hệ thống.' });
      }

      // Check if ID (mã nhân viên) already registered
      const existingId = UserModel.findById(id);
      if (existingId) {
        return res.status(400).json({ error: 'Mã nhân viên đã tồn tại.' });
      }

      const newUser: User = {
        id,
        name,
        email,
        phoneNumber,
        role: role as 'admin' | 'manager' | 'employee',
        department: department as 'Tech' | 'HR' | 'Finance' | 'Sales' | 'Admin',
        avatar: avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`,
        salary: Number(salary) || 12000000,
        gender: gender || 'Nam',
        birthday: birthday || '1995-01-01',
        age: Number(age) || 30,
        position: position || 'Nhân viên',
        level: level || 'L3 - Senior'
      };

      const created = UserModel.create(newUser);

      // Create Audit Log
      AuditLogModel.create({
        id: `audit-${Date.now()}`,
        userId: 'system',
        userName: 'Hệ thống',
        action: 'USER_REGISTER',
        details: `Đăng ký nhân viên mới thành công: ${created.name} (${created.id}) - Phòng ban: ${created.department} - Chức danh: ${created.position}`,
        ipAddress: req.ip || '127.0.0.1',
        timestamp: new Date().toISOString()
      });

      res.status(201).json({ success: true, user: created });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static updateUser(req: Request, res: Response) {
    try {
      const success = UserModel.update(req.params.id, req.body);
      if (!success) return res.status(404).json({ error: 'Không tìm thấy người dùng' });
      
      const updatedUser = UserModel.findById(req.params.id);
      if (updatedUser) {
        // Create Audit Log
        AuditLogModel.create({
          id: `audit-${Date.now()}`,
          userId: req.body.operatorId || 'system',
          userName: req.body.operatorName || 'Hệ thống',
          action: 'USER_UPDATE',
          details: `Cập nhật thông tin nhân viên: ${updatedUser.name} (${updatedUser.id})`,
          ipAddress: req.ip || '127.0.0.1',
          timestamp: new Date().toISOString()
        });
      }

      res.json({ success: true, user: updatedUser });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static deleteUser(req: Request, res: Response) {
    try {
      const targetUser = UserModel.findById(req.params.id);
      const success = UserModel.delete(req.params.id);
      if (!success) return res.status(404).json({ error: 'Không tìm thấy người dùng' });

      // Create Audit Log
      AuditLogModel.create({
        id: `audit-${Date.now()}`,
        userId: 'system',
        userName: 'Hệ thống',
        action: 'USER_DELETE',
        details: `Xóa tài khoản nhân viên: ${targetUser ? targetUser.name : req.params.id} (ID: ${req.params.id})`,
        ipAddress: req.ip || '127.0.0.1',
        timestamp: new Date().toISOString()
      });

      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}

export class FormController {
  static getForms(req: Request, res: Response) {
    try {
      const forms = FormModel.findAll();
      res.json(forms);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static getFormById(req: Request, res: Response) {
    try {
      const form = FormModel.findById(req.params.id);
      if (!form) return res.status(404).json({ error: 'Không tìm thấy mẫu đơn' });
      res.json(form);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static createForm(req: Request, res: Response) {
    try {
      const { title, description, category, fields, status, createdBy } = req.body;
      if (!title || !fields || !Array.isArray(fields)) {
        return res.status(400).json({ error: 'Tiêu đề và danh sách trường là bắt buộc.' });
      }

      const formId = 'form-' + Math.random().toString(36).substring(2, 11);
      const newForm: FormTemplate = {
        id: formId,
        title,
        description: description || '',
        category: category || 'general',
        fields,
        status: status || 'active',
        createdBy: createdBy || 'admin-1',
        createdAt: new Date().toISOString()
      };

      FormModel.create(newForm);

      // Automatically build a default workflow for any custom form built via Drag-and-drop!
      const workflowId = 'wf-' + Math.random().toString(36).substring(2, 11);
      const defaultWorkflow: WorkflowConfig = {
        id: workflowId,
        formTemplateId: formId,
        name: `Quy trình duyệt: ${title}`,
        stages: [
          {
            stageIndex: 0,
            roleRequired: 'manager',
            title: 'Duyệt cấp Trưởng bộ phận',
            description: 'Trưởng bộ phận của phòng ban xem xét và ký duyệt đầu tiên.'
          },
          {
            stageIndex: 1,
            roleRequired: 'admin',
            title: 'Duyệt cấp Ban giám đốc',
            description: 'Phê duyệt tối cao cuối cùng từ phía Quản trị viên/Ban giám đốc.'
          }
        ]
      };

      WorkflowModel.create(defaultWorkflow);

      res.status(201).json({ form: newForm, workflow: defaultWorkflow });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static updateForm(req: Request, res: Response) {
    try {
      const success = FormModel.update(req.params.id, req.body);
      if (!success) return res.status(404).json({ error: 'Không tìm thấy mẫu đơn hoặc cập nhật thất bại' });
      res.json({ success: true, form: FormModel.findById(req.params.id) });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static deleteForm(req: Request, res: Response) {
    try {
      const success = FormModel.delete(req.params.id);
      if (!success) return res.status(404).json({ error: 'Không tìm thấy mẫu đơn' });
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async generateFormFields(req: Request, res: Response) {
    try {
      const { prompt, user } = req.body;
      if (!prompt || !user) {
        return res.status(400).json({ error: 'Nội dung yêu cầu và thông tin người dùng là bắt buộc' });
      }
      const result = await AIService.generateFormFields(prompt, user);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}

export class RequestController {
  static getRequests(req: Request, res: Response) {
    try {
      const { submitterId } = req.query;
      let requests;
      if (submitterId) {
        requests = RequestModel.findBySubmitter(submitterId as string);
      } else {
        requests = RequestModel.findAll();
      }
      res.json(requests);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static getRequestById(req: Request, res: Response) {
    try {
      const request = RequestModel.findById(req.params.id);
      if (!request) return res.status(404).json({ error: 'Không tìm thấy yêu cầu' });
      res.json(request);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static createRequest(req: Request, res: Response) {
    try {
      const { formTemplateId, submitterId, submissionData } = req.body;
      if (!formTemplateId || !submitterId || !submissionData) {
        return res.status(400).json({ error: 'Mã biểu mẫu, Người nộp và Dữ liệu đơn là bắt buộc' });
      }

      const request = WorkflowService.submitRequest(formTemplateId, submitterId, submissionData);

      // Create Audit Log
      const submitter = UserModel.findById(submitterId);
      AuditLogModel.create({
        id: `audit-${Date.now()}`,
        userId: submitterId,
        userName: submitter ? submitter.name : 'Nhân viên',
        action: 'WORKFLOW_SUBMIT',
        details: `Nộp đơn trình duyệt thành công: "${request.formTitle}" (Mã đơn: ${request.id.toUpperCase()})`,
        ipAddress: req.ip || '127.0.0.1',
        timestamp: new Date().toISOString()
      });

      res.status(201).json(request);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static approveRequest(req: Request, res: Response) {
    try {
      const approverId = req.body.approverId || req.body.userId;
      const { comment } = req.body;
      if (!approverId) return res.status(400).json({ error: 'Mã người phê duyệt là bắt buộc' });

      const request = WorkflowService.approveRequest(req.params.id, approverId, comment);

      // Create Audit Log
      const approver = UserModel.findById(approverId);
      AuditLogModel.create({
        id: `audit-${Date.now()}`,
        userId: approverId,
        userName: approver ? approver.name : 'Người phê duyệt',
        action: 'WORKFLOW_APPROVE',
        details: `Ký duyệt thông qua hồ sơ đề xuất: "${request.formTitle}" (Mã đơn: ${request.id.toUpperCase()})${comment ? ` - Ý kiến: "${comment}"` : ''}`,
        ipAddress: req.ip || '127.0.0.1',
        timestamp: new Date().toISOString()
      });

      res.json(request);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static rejectRequest(req: Request, res: Response) {
    try {
      const approverId = req.body.approverId || req.body.userId;
      const { comment } = req.body;
      if (!approverId) return res.status(400).json({ error: 'Mã người phê duyệt là bắt buộc' });

      const request = WorkflowService.rejectRequest(req.params.id, approverId, comment);

      // Create Audit Log
      const approver = UserModel.findById(approverId);
      AuditLogModel.create({
        id: `audit-${Date.now()}`,
        userId: approverId,
        userName: approver ? approver.name : 'Người phê duyệt',
        action: 'WORKFLOW_REJECT',
        details: `Từ chối / Bác bỏ hồ sơ đề xuất: "${request.formTitle}" (Mã đơn: ${request.id.toUpperCase()})${comment ? ` - Ý kiến: "${comment}"` : ''}`,
        ipAddress: req.ip || '127.0.0.1',
        timestamp: new Date().toISOString()
      });

      res.json(request);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async analyzeComplexity(req: Request, res: Response) {
    try {
      const { formTitle, submissionData } = req.body;
      if (!formTitle || !submissionData) {
        return res.status(400).json({ error: 'Tiêu đề đơn và dữ liệu nộp là bắt buộc' });
      }
      const analysis = await AIService.analyzeRequestComplexity(formTitle, submissionData);
      res.json(analysis);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}

export class AssetController {
  static getAssets(req: Request, res: Response) {
    try {
      const { assignedTo } = req.query;
      let assets;
      if (assignedTo) {
        assets = AssetModel.findAssignedTo(assignedTo as string);
      } else {
        assets = AssetModel.findAll();
      }
      res.json(assets);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static getAssetById(req: Request, res: Response) {
    try {
      const asset = AssetModel.findById(req.params.id);
      if (!asset) return res.status(404).json({ error: 'Không tìm thấy thiết bị' });
      res.json(asset);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static requestAsset(req: Request, res: Response) {
    try {
      const { assetId, userId, details } = req.body;
      if (!assetId || !userId || !details) {
        return res.status(400).json({ error: 'Thiếu thông tin bàn giao thiết bị' });
      }
      const asset = AssetService.requestAsset(assetId, userId, details);
      res.json(asset);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static requestReturn(req: Request, res: Response) {
    try {
      const { assetId, userId, details, condition } = req.body;
      if (!assetId || !userId || condition === undefined) {
        return res.status(400).json({ error: 'Thiếu thông tin trả thiết bị' });
      }
      const asset = AssetService.requestReturn(assetId, userId, details || '', Number(condition));
      res.json(asset);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static requestExchange(req: Request, res: Response) {
    try {
      const { assetId, userId, details } = req.body;
      if (!assetId || !userId || !details) {
        return res.status(400).json({ error: 'Thiếu thông tin đổi trả thiết bị' });
      }
      const asset = AssetService.requestExchange(assetId, userId, details);
      res.json(asset);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static requestBuyback(req: Request, res: Response) {
    try {
      const { assetId, userId, details } = req.body;
      if (!assetId || !userId || !details) {
        return res.status(400).json({ error: 'Thiếu thông tin đăng ký mua thiết bị' });
      }
      const asset = AssetService.requestBuyback(assetId, userId, details);
      res.json(asset);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static approveAssetRequest(req: Request, res: Response) {
    try {
      const { action, reviewerId, paymentMethod } = req.body;
      if (!action || !reviewerId) {
        return res.status(400).json({ error: 'Thiếu thông tin phê duyệt thiết bị' });
      }
      const asset = AssetService.approveAssetRequest(req.params.id, action, reviewerId, paymentMethod);
      res.json(asset);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static rejectAssetRequest(req: Request, res: Response) {
    try {
      const { reviewerId, comment } = req.body;
      if (!reviewerId || !comment) {
        return res.status(400).json({ error: 'Thiếu lý do từ chối yêu cầu tài sản' });
      }
      const asset = AssetService.rejectAssetRequest(req.params.id, reviewerId, comment);
      res.json(asset);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}

export class ChatController {
  static getChats(req: Request, res: Response) {
    try {
      const { userId } = req.query;
      let chats = ChatMessageModel.findAll();
      if (userId) {
        chats = chats.filter(c => !c.deletedForUsers || !c.deletedForUsers.includes(userId as string));
      }
      res.json(chats);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static sendChat(req: Request, res: Response) {
    try {
      const { senderId, senderName, senderRole, senderAvatar, recipientId, content, fileUrl, fileName, fileType, fileSize, replyTo } = req.body;
      if (!senderId || !senderName || !senderRole || (!content && !fileUrl)) {
        return res.status(400).json({ error: 'Nội dung tin nhắn không đầy đủ.' });
      }

      // Handle cloud files quota limit & file saving
      if (fileUrl) {
        const user = UserModel.findById(senderId);
        if (user) {
          const sizeInBytes = fileSize || Math.round(fileUrl.length * 0.75);
          const currentUsed = user.cloudUsed || 0;
          const MAX_QUOTA = 2 * 1024 * 1024 * 1024; // 2GB
          
          if (currentUsed + sizeInBytes > MAX_QUOTA) {
            return res.status(400).json({ error: 'Không đủ dung lượng lưu trữ đám mây (Tối đa 2GB).' });
          }
          
          // Save cloud file record
          CloudFileModel.create({
            id: 'file-' + Math.random().toString(36).substring(2, 11),
            userId: senderId,
            fileName: fileName || 'unnamed_file',
            fileUrl,
            fileType: fileType || 'file',
            fileSize: sizeInBytes,
            uploadedAt: new Date().toISOString()
          });

          // Update user's cloudUsed
          UserModel.update(senderId, { cloudUsed: currentUsed + sizeInBytes });
        }
      }

      const msg = ChatMessageModel.create({
        id: 'msg-' + Math.random().toString(36).substring(2, 11),
        senderId,
        senderName,
        senderRole,
        senderAvatar,
        recipientId: recipientId || 'all',
        content: content || '',
        timestamp: new Date().toISOString(),
        fileUrl,
        fileName,
        fileType,
        replyTo
      });

      // Generate Push Notification for Chat Recipient(s)
      const snippet = content ? (content.length > 60 ? content.substring(0, 60) + '...' : content) : `[${fileType === 'image' ? 'Hình ảnh' : 'Tài liệu'}]: ${fileName}`;
      
      const createChatNotification = (userId: string, title: string, link: string) => {
        NotificationModel.create({
          id: 'notif-' + Math.random().toString(36).substring(2, 11),
          userId,
          title,
          message: snippet,
          read: false,
          type: 'chat',
          link,
          timestamp: new Date().toISOString()
        });
      };

      const targetRecip = recipientId || 'all';
      if (targetRecip === 'all') {
        // Corporate chat: notify all other users
        const allUsers = UserModel.findAll();
        allUsers.forEach(u => {
          if (u.id !== senderId) {
            createChatNotification(u.id, `Kênh Chung - ${senderName}`, 'tab=chat&chatTab=corporate');
          }
        });
      } else if (targetRecip.startsWith('dept:')) {
        const deptName = targetRecip.replace('dept:', '');
        const deptUsers = UserModel.findAll().filter(u => u.department === deptName);
        deptUsers.forEach(u => {
          if (u.id !== senderId) {
            createChatNotification(u.id, `Phòng ban ${deptName} - ${senderName}`, `tab=chat&chatTab=department&recipientId=${deptName}`);
          }
        });
      } else if (targetRecip.startsWith('group:')) {
        const groupId = targetRecip.replace('group:', '');
        const group = ChatGroupModel.findAll().find(g => g.id === groupId);
        if (group && Array.isArray(group.memberIds)) {
          group.memberIds.forEach(mId => {
            if (mId !== senderId) {
              createChatNotification(mId, `Nhóm ${group.name} - ${senderName}`, `tab=chat&chatTab=private&recipientId=group:${groupId}`);
            }
          });
        }
      } else {
        // Private 1-1 chat
        if (targetRecip !== 'ai-bot' && targetRecip !== senderId) {
          createChatNotification(targetRecip, senderName, `tab=chat&chatTab=private&recipientId=${senderId}`);
        }
      }

      res.status(201).json(msg);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static deleteChat(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { userId, mode } = req.query; // mode: 'me' | 'everyone'
      
      const chat = ChatMessageModel.findById(id);
      if (!chat) {
        return res.status(404).json({ error: 'Không tìm thấy tin nhắn.' });
      }

      // If mode is 'me' or requester is NOT the sender of this message,
      // we only hide it for them (add to deletedForUsers) so it doesn't get lost for the sender or other party
      if (mode === 'me' || (userId && chat.senderId !== userId)) {
        if (userId) {
          const deletedFor = chat.deletedForUsers || [];
          if (!deletedFor.includes(userId as string)) {
            deletedFor.push(userId as string);
          }
          ChatMessageModel.update(id, { deletedForUsers: deletedFor });
          return res.json({ success: true, mode: 'me' });
        }
      }

      // Otherwise, requester is the sender (or no userId specified in a legacy call), so delete for everyone
      const success = ChatMessageModel.delete(id);
      if (!success) {
        return res.status(404).json({ error: 'Không tìm thấy tin nhắn.' });
      }
      res.json({ success: true, mode: 'everyone' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static getGroups(req: Request, res: Response) {
    try {
      const groups = ChatGroupModel.findAll();
      res.json(groups);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static createGroup(req: Request, res: Response) {
    try {
      const { name, memberIds } = req.body;
      if (!name || !memberIds || !Array.isArray(memberIds)) {
        return res.status(400).json({ error: 'Tên nhóm hoặc danh sách thành viên không hợp lệ.' });
      }
      const group = ChatGroupModel.create({
        id: 'group-' + Math.random().toString(36).substring(2, 11),
        name,
        memberIds,
        createdAt: new Date().toISOString()
      });
      res.status(201).json(group);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static updateGroup(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, memberIds } = req.body;
      const updated = ChatGroupModel.update(id, { name, memberIds });
      if (!updated) {
        return res.status(404).json({ error: 'Không tìm thấy nhóm.' });
      }
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static async chatWithAI(req: Request, res: Response) {
    try {
      const { senderId, senderName, senderRole, senderAvatar, content } = req.body;
      if (!content) return res.status(400).json({ error: 'Tin nhắn không thể trống' });
      
      // Save user message
      ChatMessageModel.create({
        id: 'msg-' + Math.random().toString(36).substring(2, 11),
        senderId,
        senderName,
        senderRole,
        senderAvatar,
        recipientId: 'ai-bot',
        content,
        timestamp: new Date().toISOString()
      });

      // Get history
      const allChats = ChatMessageModel.findAll();
      const userAiChats = allChats.filter(m => 
        (m.senderId === senderId && m.recipientId === 'ai-bot') || 
        (m.senderId === 'ai-bot' && m.recipientId === senderId)
      );
      
      const history = userAiChats.slice(-6).map(m => ({
        role: m.senderId === 'ai-bot' ? 'model' : 'user',
        text: m.content
      }));

      const response = await AIService.chatWithAI(content, history as any);
      
      // Save AI response
      const aiMsg = ChatMessageModel.create({
        id: 'msg-' + Math.random().toString(36).substring(2, 11),
        senderId: 'ai-bot',
        senderName: 'Trợ Lý AI',
        senderRole: 'system',
        recipientId: senderId,
        content: response,
        timestamp: new Date().toISOString()
      });

      res.json(aiMsg);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}

export class NotificationController {
  static getNotifications(req: Request, res: Response) {
    try {
      const { userId } = req.query;
      let notifications;
      if (userId) {
        notifications = NotificationModel.findByUserId(userId as string);
      } else {
        notifications = NotificationModel.findAll();
      }
      res.json(notifications);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static markAllAsRead(req: Request, res: Response) {
    try {
      const { userId } = req.body;
      if (!userId) return res.status(400).json({ error: 'Mã người dùng là bắt buộc' });

      NotificationModel.markAllAsRead(userId);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static markAsRead(req: Request, res: Response) {
    try {
      NotificationModel.markAsRead(req.params.id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static createNotification(req: Request, res: Response) {
    try {
      const { userId, title, message, type, link } = req.body;
      if (!userId || !title || !message) {
        return res.status(400).json({ error: 'Thiếu thông tin thông báo.' });
      }
      const notif = NotificationModel.create({
        id: 'notif-' + Math.random().toString(36).substring(2, 11),
        userId,
        title,
        message,
        read: false,
        type: type || 'system',
        link: link || '',
        timestamp: new Date().toISOString()
      });
      res.status(201).json(notif);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}

export class PaymentController {
  static getPayments(req: Request, res: Response) {
    try {
      const { userId } = req.query;
      let payments;
      if (userId) {
        payments = PaymentModel.findByUserId(userId as string);
      } else {
        payments = PaymentModel.findAll();
      }
      res.json(payments);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}

export class IncomingDocumentController {
  static getDocuments(req: Request, res: Response) {
    try {
      res.json(IncomingDocumentModel.findAll());
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static getDocumentById(req: Request, res: Response) {
    try {
      const doc = IncomingDocumentModel.findById(req.params.id);
      if (!doc) return res.status(404).json({ error: 'Không tìm thấy văn bản' });
      res.json(doc);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static createDocument(req: Request, res: Response) {
    try {
      const newDoc = {
        ...req.body,
        id: `doc-${Date.now()}`
      };
      const created = IncomingDocumentModel.create(newDoc);
      res.status(201).json(created);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static updateDocument(req: Request, res: Response) {
    try {
      const success = IncomingDocumentModel.update(req.params.id, req.body);
      if (!success) return res.status(404).json({ error: 'Không tìm thấy văn bản' });
      res.json({ success: true, document: IncomingDocumentModel.findById(req.params.id) });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static deleteDocument(req: Request, res: Response) {
    try {
      const success = IncomingDocumentModel.delete(req.params.id);
      if (!success) return res.status(404).json({ error: 'Không tìm thấy văn bản' });
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}

export class OutgoingDocumentController {
  static getDocuments(req: Request, res: Response) {
    try {
      res.json(OutgoingDocumentModel.findAll());
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static getDocumentById(req: Request, res: Response) {
    try {
      const doc = OutgoingDocumentModel.findById(req.params.id);
      if (!doc) return res.status(404).json({ error: 'Không tìm thấy văn bản' });
      res.json(doc);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static createDocument(req: Request, res: Response) {
    try {
      const newDoc = {
        ...req.body,
        id: `out-${Date.now()}`
      };
      const created = OutgoingDocumentModel.create(newDoc);
      res.status(201).json(created);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static updateDocument(req: Request, res: Response) {
    try {
      const success = OutgoingDocumentModel.update(req.params.id, req.body);
      if (!success) return res.status(404).json({ error: 'Không tìm thấy văn bản' });
      res.json({ success: true, document: OutgoingDocumentModel.findById(req.params.id) });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static deleteDocument(req: Request, res: Response) {
    try {
      const success = OutgoingDocumentModel.delete(req.params.id);
      if (!success) return res.status(404).json({ error: 'Không tìm thấy văn bản' });
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}

export class EventController {
  static getEvents(req: Request, res: Response) {
    try {
      res.json(EventModel.findAll());
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static getEventById(req: Request, res: Response) {
    try {
      const e = EventModel.findById(req.params.id);
      if (!e) return res.status(404).json({ error: 'Không tìm thấy sự kiện' });
      res.json(e);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static createEvent(req: Request, res: Response) {
    try {
      const newEvent = { ...req.body, id: `evt-${Date.now()}` };
      const created = EventModel.create(newEvent);
      res.status(201).json(created);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static updateEvent(req: Request, res: Response) {
    try {
      const success = EventModel.update(req.params.id, req.body);
      if (!success) return res.status(404).json({ error: 'Không tìm thấy sự kiện' });
      res.json({ success: true, event: EventModel.findById(req.params.id) });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static deleteEvent(req: Request, res: Response) {
    try {
      const success = EventModel.delete(req.params.id);
      if (!success) return res.status(404).json({ error: 'Không tìm thấy sự kiện' });
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}

export class TaskController {
  static getTasks(req: Request, res: Response) {
    try {
      res.json(TaskModel.findAll());
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static getTaskById(req: Request, res: Response) {
    try {
      const t = TaskModel.findById(req.params.id);
      if (!t) return res.status(404).json({ error: 'Không tìm thấy công việc' });
      res.json(t);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static createTask(req: Request, res: Response) {
    try {
      const newTask = { ...req.body, id: `task-${Date.now()}` };
      const created = TaskModel.create(newTask);
      res.status(201).json(created);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static updateTask(req: Request, res: Response) {
    try {
      const success = TaskModel.update(req.params.id, req.body);
      if (!success) return res.status(404).json({ error: 'Không tìm thấy công việc' });
      res.json({ success: true, task: TaskModel.findById(req.params.id) });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static deleteTask(req: Request, res: Response) {
    try {
      const success = TaskModel.delete(req.params.id);
      if (!success) return res.status(404).json({ error: 'Không tìm thấy công việc' });
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}

export class InternalDocumentController {
  static getDocuments(req: Request, res: Response) {
    try {
      res.json(InternalDocumentModel.findAll());
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static getDocumentById(req: Request, res: Response) {
    try {
      const doc = InternalDocumentModel.findById(req.params.id);
      if (!doc) return res.status(404).json({ error: 'Không tìm thấy văn bản' });
      res.json(doc);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static createDocument(req: Request, res: Response) {
    try {
      const newDoc = { ...req.body, id: `int-${Date.now()}`, createdAt: new Date().toISOString() };
      const created = InternalDocumentModel.create(newDoc);
      res.status(201).json(created);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static updateDocument(req: Request, res: Response) {
    try {
      const success = InternalDocumentModel.update(req.params.id, req.body);
      if (!success) return res.status(404).json({ error: 'Không tìm thấy văn bản' });
      res.json({ success: true, document: InternalDocumentModel.findById(req.params.id) });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static deleteDocument(req: Request, res: Response) {
    try {
      const success = InternalDocumentModel.delete(req.params.id);
      if (!success) return res.status(404).json({ error: 'Không tìm thấy văn bản' });
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}

export class AuditLogController {
  static getLogs(req: Request, res: Response) {
    try {
      res.json(AuditLogModel.findAll());
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static createLog(req: Request, res: Response) {
    try {
      const userId = req.body.userId || 'system';
      let userName = req.body.userName;
      
      if (!userName && userId && userId !== 'system') {
        const u = UserModel.findById(userId);
        if (u) {
          userName = u.name;
        }
      }
      if (!userName) {
        userName = userId === 'system' ? 'Hệ thống' : 'Người dùng';
      }

      let details = req.body.details;
      if (details && typeof details === 'object') {
        details = details.message || JSON.stringify(details);
      }
      if (!details) {
        details = `Thao tác thực hiện bởi ${userName}`;
      }

      const newLog = {
        id: `log-${Date.now()}`,
        userId,
        userName,
        action: req.body.action || 'ACTION',
        details,
        ipAddress: req.ip || '127.0.0.1',
        timestamp: new Date().toISOString()
      };

      const created = AuditLogModel.create(newLog);
      res.status(201).json(created);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}

export class SharedCategoryController {
  static getCategories(req: Request, res: Response) {
    try {
      res.json(SharedCategoryModel.findAll());
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static getCategoryById(req: Request, res: Response) {
    try {
      const cat = SharedCategoryModel.findById(req.params.id);
      if (!cat) return res.status(404).json({ error: 'Không tìm thấy danh mục' });
      res.json(cat);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static createCategory(req: Request, res: Response) {
    try {
      const newCat = { ...req.body, id: `cat-${Date.now()}` };
      const created = SharedCategoryModel.create(newCat);
      res.status(201).json(created);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static updateCategory(req: Request, res: Response) {
    try {
      const success = SharedCategoryModel.update(req.params.id, req.body);
      if (!success) return res.status(404).json({ error: 'Không tìm thấy danh mục' });
      res.json({ success: true, category: SharedCategoryModel.findById(req.params.id) });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static deleteCategory(req: Request, res: Response) {
    try {
      const success = SharedCategoryModel.delete(req.params.id);
      if (!success) return res.status(404).json({ error: 'Không tìm thấy danh mục' });
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}

export class OCRDocumentController {
  static getDocuments(req: Request, res: Response) {
    try {
      res.json(OCRDocumentModel.findAll());
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static getDocumentById(req: Request, res: Response) {
    try {
      const doc = OCRDocumentModel.findById(req.params.id);
      if (!doc) return res.status(404).json({ error: 'Không tìm thấy tài liệu OCR' });
      res.json(doc);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static createDocument(req: Request, res: Response) {
    try {
      const newDoc = { ...req.body, id: `ocr-${Date.now()}`, uploadedAt: new Date().toISOString() };
      const created = OCRDocumentModel.create(newDoc);
      res.status(201).json(created);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static updateDocument(req: Request, res: Response) {
    try {
      const success = OCRDocumentModel.update(req.params.id, req.body);
      if (!success) return res.status(404).json({ error: 'Không tìm thấy tài liệu OCR' });
      res.json({ success: true, document: OCRDocumentModel.findById(req.params.id) });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static deleteDocument(req: Request, res: Response) {
    try {
      const success = OCRDocumentModel.delete(req.params.id);
      if (!success) return res.status(404).json({ error: 'Không tìm thấy tài liệu OCR' });
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}

export class CloudFileController {
  static getFiles(req: Request, res: Response) {
    try {
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ error: 'Thiếu userId' });
      }
      const files = CloudFileModel.findByUserId(userId as string);
      res.json(files);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static uploadFile(req: Request, res: Response) {
    try {
      const { userId, fileName, fileUrl, fileType, fileSize } = req.body;
      if (!userId || !fileUrl || !fileName) {
        return res.status(400).json({ error: 'Nội dung file không đầy đủ.' });
      }

      const user = UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'Không tìm thấy người dùng.' });
      }

      const sizeInBytes = fileSize || Math.round(fileUrl.length * 0.75);
      const currentUsed = user.cloudUsed || 0;
      const MAX_QUOTA = 2 * 1024 * 1024 * 1024; // 2GB

      if (currentUsed + sizeInBytes > MAX_QUOTA) {
        return res.status(400).json({ error: 'Không đủ dung lượng lưu trữ đám mây (Tối đa 2GB).' });
      }

      // Update user
      UserModel.update(userId, { cloudUsed: currentUsed + sizeInBytes });

      // Create Cloud File
      const file = CloudFileModel.create({
        id: 'file-' + Math.random().toString(36).substring(2, 11),
        userId,
        fileName,
        fileUrl,
        fileType,
        fileSize: sizeInBytes,
        uploadedAt: new Date().toISOString()
      });

      res.status(201).json(file);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  static deleteFile(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const file = CloudFileModel.findById(id);
      if (!file) {
        return res.status(404).json({ error: 'Không tìm thấy file.' });
      }

      const user = UserModel.findById(file.userId);
      if (user) {
        const currentUsed = user.cloudUsed || 0;
        const newUsed = Math.max(0, currentUsed - file.fileSize);
        UserModel.update(file.userId, { cloudUsed: newUsed });
      }

      CloudFileModel.delete(id);
      res.json({ success: true, message: 'Đã xóa file thành công và giải phóng bộ nhớ.' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}
