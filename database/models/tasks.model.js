import mongoose from "mongoose";
import { taskLogModel } from "./tasksLog.model.js";
import { removeFiles } from "../../src/utils/removeFiles.js";

const taskSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
      required: true,
    },
    isShared: {
      type: Boolean,
      default: false,
      required: true,
    },
    token: {
      type: String,
      // required: true,
    },
    resources: [
      {
        lng: { type: String },
        lat: { type: String },
        name: { type: String },
      },
    ],
    documents: {
      type: [String],
      // required: true,
    },
    messages: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "message",
      // required: true,
    },
    users: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "user",
      default: [],
      // required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    sDate: {
      type: String,
      required: true,
    },
    eDate: {
      type: String,
      required: true,
    },
    sTime: {
      type: String,
      required: true,
    },
    eTime: {
      type: String,
      required: true,
    },
    taskType: {
      type: String,
      enum: ["normal", "shared"],
      default: "normal",
      required: true,
    },
    taskStatus: {
      type: String,
      enum: ["Done", "InProgress", "Cancelled"],
      default: "InProgress",
      required: true,
    },
    parentTask: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "task",
      // required: true,
    },
    priority: {
      type: String,
      enum: ["low", "normal", "high"],
      required: true,
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "group",
      // default: [],
      // required: true,
    },
    admins: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "user",
      default: [],
      // required: true,
    },
  },
  { timestamps: true }
);

taskSchema.pre(/^delete/, { document: false, query: true }, async function () {
  const doc = await this.model.findOne(this.getFilter());
  if (doc) {
    await taskLogModel.deleteMany({ taskId: doc._id });

    if (doc.documents) {
      removeFiles("tasks", doc.documents);
    }
  }
});

export const taskModel = mongoose.model("task", taskSchema);
