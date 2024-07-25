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
      default: " ",
      required: true,
    },
    isSender: {
      type: Boolean,
      default: false,
      required: true,
    },
    date: {
      type: String,
      default: "",
    },
    docs: {
      type: [String],
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    senderName: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const messageModel = mongoose.model("message", messageSchema);
