import mongoose from "mongoose";

const taskLogSchema = mongoose.Schema(
  {
    title: {
      type: String,
      default:undefined,
    },
    desc: {
      type: String,
      default:undefined,
    },
    isCompleted: {
      type: Boolean,
      default:undefined,
    },
    isShared: {
      type: Boolean,
      default:undefined,
    },
    token: {
      type: String,
    },
    tasksPriority: {
      type: String,
      default:undefined,
    },
    resources: {
      type: [String],
      default:undefined,
    },
    documments: {
      type: [String],
      default:undefined,
    },
    users: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "user",
      default:undefined,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    sDate: {
      type: String,
      default:undefined,
    },
    eDate: {
      type: String,
      default:undefined,
    },
    sTime: {
      type: String,
      default:undefined,
    },
    eTime: {
      type: String,
      default:undefined,
    },
    taskType: {
      type: String,
      enum: ["normal", "shared"],
      default:undefined,
    },
    taskStatus: {
      type: String,
      enum: ["Done", "InProgress", "Cancelled"],
      default:undefined,
    },
    parentTask: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "task",
      default:undefined,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "task",
    },
    priority: {
      type: String,
      enum: [ "low","normal","high"],
      default:undefined,
    },
    group: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "group",
      default:undefined,
    },

  },
  { timestamps: true }
);

export const taskLogModel = mongoose.model("taskLog", taskLogSchema);
