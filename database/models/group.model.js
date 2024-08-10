import mongoose from "mongoose";

const groupSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    tasks: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "task",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    
  },
  { timestamps: true }
);



export const groupModel = mongoose.model("group", groupSchema);
