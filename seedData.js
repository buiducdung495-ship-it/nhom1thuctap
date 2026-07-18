import connectDB from "../connect.js";

import User from "../models/User.js";
import Department from "../models/Department.js";
import Document from "../models/Document.js";
import ApprovalFlow from "../models/ApprovalFlow.js";
import Approval from "../models/Approval.js";
import Notification from "../models/Notification.js";
import Log from "../models/Log.js";

const seedData = async () => {
    try {

        await connectDB();

        // Xóa dữ liệu cũ
        await User.deleteMany({});
        await Department.deleteMany({});
        await Document.deleteMany({});
        await ApprovalFlow.deleteMany({});
        await Approval.deleteMany({});
        await Notification.deleteMany({});
        await Log.deleteMany({});

        console.log("Đã xóa dữ liệu cũ.");

        // =====================
        // Department
        // =====================

        const hr = await Department.create({
            departmentName: "Phòng Nhân sự",
            description: "Quản lý nhân sự"
        });

        const it = await Department.create({
            departmentName: "Phòng CNTT",
            description: "Quản lý hệ thống"
        });

        const finance = await Department.create({
            departmentName: "Phòng Kế toán",
            description: "Quản lý tài chính"
        });

        console.log("Đã tạo Department.");

        // =====================
        // User
        // =====================

        const admin = await User.create({
            username: "admin",
            password: "123456",
            fullName: "Quản trị viên",
            email: "admin@gmail.com"
        });

        const manager = await User.create({
            username: "manager",
            password: "123456",
            fullName: "Nguyễn Văn B",
            email: "manager@gmail.com"
        });

        console.log("Đã tạo User.");

        // =====================
        // Document
        // =====================

        const document1 = await Document.create({

            title: "Đơn xin nghỉ phép",

            documentCode: "VB001",

            content: "Nội dung đơn xin nghỉ phép.",

            creator: admin._id,

            department: hr._id,

            status: "Pending"

        });

        const document2 = await Document.create({

            title: "Quy trình mua thiết bị",

            documentCode: "VB002",

            content: "Quy trình mua thiết bị CNTT.",

            creator: manager._id,

            department: it._id,

            status: "Draft"

        });

        console.log("Đã tạo Document.");

        // =====================
        // Approval Flow
        // =====================

        const flow = await ApprovalFlow.create({

            flowName: "Quy trình phê duyệt văn bản",

            description: "Nhân viên -> Trưởng phòng -> Giám đốc",

            steps: [

                {
                    order: 1,
                    role: "Trưởng phòng"
                },

                {
                    order: 2,
                    role: "Giám đốc"
                }

            ]

        });

        console.log("Đã tạo Approval Flow.");

        // =====================
        // Approval
        // =====================

        await Approval.create({

            document: document1._id,

            approver: manager._id,

            status: "Pending",

            comment: "Đang chờ phê duyệt"

        });

        console.log("Đã tạo Approval.");

        // =====================
        // Notification
        // =====================

        await Notification.create({

            user: manager._id,

            title: "Có văn bản mới",

            message: "Bạn có một văn bản cần phê duyệt.",

            isRead: false

        });

        console.log("Đã tạo Notification.");

        // =====================
        // Log
        // =====================

        await Log.create({

            user: admin._id,

            action: "Tạo văn bản VB001",

            ip: "127.0.0.1"

        });

        console.log("Đã tạo Log.");

        console.log("\n==============================");
        console.log("Seed Data thành công!");
        console.log("==============================");

        process.exit();

    } catch (error) {

        console.log(error);

        process.exit(1);

    }
};

seedData();