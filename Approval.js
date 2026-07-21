import mongoose from "mongoose";

const ApprovalSchema = new mongoose.Schema(
  {
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
    },

    approver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },

    comment: String,
  },
  {
    timestamps: true,
  }
);

const Approval = mongoose.model("Approval", ApprovalSchema);

export default Approval;