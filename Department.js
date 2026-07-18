import mongoose from "mongoose";

const DepartmentSchema = new mongoose.Schema(
  {
    departmentName: {
      type: String,
      required: true,
      unique: true,
    },

    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Department = mongoose.model("Department", DepartmentSchema);

export default Department;