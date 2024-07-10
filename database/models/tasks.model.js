import mongoose from "mongoose";

const taskSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    tasksPriority: {
      type: String,
      required: true,
    },
    resources: {
      type: [String],
      // required: true,
    },
    documments: {
      type: [String],
      // required: true,
    },
    users: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "user",
      // required: true,
    },
    sDate: {
      type: Date,
      required: true,
    },
    eDate: {
      type: Date,
      required: true,
    },
    taskType: {
      type: String,
      enum: ["normal", "shared"],
      default: "normal",
      required: true,
    },
    review: {
      type: [
        {
          review: { type: String},
          status: { type: String},
          uId: { type: mongoose.Schema.Types.ObjectId, ref: "user"},
          createdAt: { type: Date},
        },
      ],
      required: true,
    },
  },
  { timestamps: true }
);



export const taskModel = mongoose.model("task", taskSchema);
