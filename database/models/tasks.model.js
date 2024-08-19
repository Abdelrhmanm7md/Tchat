import mongoose from "mongoose";
import { taskLogModel } from "./tasksLog.model.js";

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
    isCompleted: {
      type: Boolean,
      default: false,
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
    resources:[
      {
        lng: { type: String},
        lat: { type: String},
        name: {type: String},
      },
    ],
    documments: {
      type: [String],
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
      enum: [ "low","normal","high"],
      required: true,
    },
    group: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "group",
      default: undefined,
      // required: true,
    },
  },
  { timestamps: true }
);

taskSchema.pre(/^delete/, { document: false, query: true }, async function() {
  const doc = await this.model.findOne(this.getFilter());
  if (doc) {
    await taskLogModel.deleteMany({ taskId: doc._id });
  }
});
export const taskModel = mongoose.model("task", taskSchema);
