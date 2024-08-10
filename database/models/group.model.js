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
    
  },
  { timestamps: true }
);



export const groupModel = mongoose.model("group", groupSchema);
