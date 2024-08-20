import mongoose from "mongoose";
import { taskLogModel } from "./tasksLog.model.js";
import fsExtra from "fs-extra";
import path from "path";

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
      type: [mongoose.Schema.Types.ObjectId],
      ref: "group",
      default: undefined,
      // required: true,
    },
  },
  { timestamps: true }
);

taskSchema.pre(/^delete/, { document: false, query: true }, async function () {
  const doc = await this.model.findOne(this.getFilter());
  if (doc) {
    await taskLogModel.deleteMany({ taskId: doc._id });

    if (!doc.documents || !Array.isArray(doc.documents)) {
      console.error("doc.documents is either undefined or not an array");
      return;
    }
    const photoPaths =
      doc.documents &&
      doc.documents.map((url) =>
        url.replace("http://localhost:8000/tasks/", "")
      );
    console.log(photoPaths);

    photoPaths.forEach((photoPath) => {
      // Resolve the full path to the file
      const fullPath = path.resolve("uploads/tasks", photoPath);
      // Check if the file exists
      fsExtra.access(fullPath, fsExtra.constants.F_OK, (err) => {
        if (err) {
          console.error("File does not exist or cannot be accessed");
          return;
        }
        // Delete the file
        fsExtra.unlink(fullPath, (err) => {
          if (err) {
            console.error("Error deleting the file:", err);
          } else {
            console.log("Files deleted successfully");
          }
        });
      });
    });
  }
});
export const taskModel = mongoose.model("task", taskSchema);
