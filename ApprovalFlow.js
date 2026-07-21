import mongoose from "mongoose";

const ApprovalFlowSchema = new mongoose.Schema(
  {
    flowName: {
      type: String,
      required: true,
    },

    description: String,

    steps: [
      {
        order: Number,

        role: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const ApprovalFlow = mongoose.model("ApprovalFlow", ApprovalFlowSchema);

export default ApprovalFlow;