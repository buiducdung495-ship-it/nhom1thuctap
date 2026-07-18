import mongoose from "mongoose";

const LogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    action: String,

    ip: String,
  },
  {
    timestamps: true,
  }
);

const Log = mongoose.model("Log", LogSchema);

export default Log;