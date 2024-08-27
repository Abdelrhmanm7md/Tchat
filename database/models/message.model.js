import mongoose from "mongoose";

const messageSchema = mongoose.Schema(
  {
    content: {
      type: String,
      default: " ",
      // required: true,
    },
    isSender: {
      type: Boolean,
      default: false,
      // required: true,
    },
    date: {
      type: String,
      default: "",
    },
    documents: {
      type: [String],
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      // required: true,
    },
    senderName: {
      type: String,
      // required: true,
    },
  },
  { timestamps: true }
);

export const messageModel = mongoose.model("message", messageSchema);
