import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    documentCode: {
      type: String,
      unique: true,
    },

    content: String,

    status: {
      type: String,
      enum: ["Draft", "Pending", "Approved", "Rejected"],
      default: "Draft",
    },

    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },
  },
  {
    timestamps: true,
  }
);

const Document = mongoose.model("Document", DocumentSchema);

export default Document;