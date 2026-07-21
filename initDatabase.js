import connectDB from "./connect.js";

import User from "./models/User.js";
import Department from "./models/Department.js";
import Document from "./models/Document.js";
import ApprovalFlow from "./models/ApprovalFlow.js";
import Approval from "./models/Approval.js";
import Notification from "./models/Notification.js";
import Log from "./models/Log.js";

const initialize = async () => {

    await connectDB();

    await User.createCollection();
    console.log("✔ users");

    await Department.createCollection();
    console.log("✔ departments");

    await Document.createCollection();
    console.log("✔ documents");

    await ApprovalFlow.createCollection();
    console.log("✔ approvalflows");

    await Approval.createCollection();
    console.log("✔ approvals");

    await Notification.createCollection();
    console.log("✔ notifications");

    await Log.createCollection();
    console.log("✔ logs");

    console.log("Hoàn tất.");

    process.exit();

};

initialize();

initialize();