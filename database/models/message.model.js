import mongoose from "mongoose";

const messageSchema = mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "task",
      required: true,
    },
    content: {
        type: String,
        required: true,
    },
    image: {
        type: String,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { timestamps: true }
);

export const messageModel = mongoose.model("message", messageSchema);