import mongoose from "mongoose";

const taskLogSchema = mongoose.Schema(
  {
    title: {
      type: String,
      // default:null,
    },
    desc: {
      type: String,
      // default:null,

    },
    isCompleted: {
      type: Boolean,
      // default:null,
    },
    isShared: {
      type: Boolean,
      // default:null,

    },
    token: {
      type: String,
    },
    tasksPriority: {
      type: String,
      // default:null,
    },
    resources: {
      type: [String],
      // default:null,

    },
    documments: {
      type: [String],
      // default:null,

    },
    users: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "user",
      // default:null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      // default:null,

    },
    sDate: {
      type: String,
      // default:null,
    },
    eDate: {
      type: String,
      // default:null,
    },
    sTime: {
      type: String,
      // default:null,
    },
    eTime: {
      type: String,
      // default:null,
    },
    taskType: {
      type: String,
      enum: ["normal", "shared"],
      // default:null,
    },
    taskStatus: {
      type: String,
      enum: ["Done", "InProgress", "Cancelled"],
      // default:null,
    },
    parentTask: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "task",
      // default:null,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "task",
      // default:null,
    },
    priority: {
      type: String,
      enum: [ "low","normal","high"],
      // default:null,
    },
    group: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "group",
      // default: null,
      // required: true,
    },

  },
  { timestamps: true }
);

export const taskLogModel = mongoose.model("taskLog", taskLogSchema);
