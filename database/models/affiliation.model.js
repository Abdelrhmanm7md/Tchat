import mongoose from "mongoose";

const affiliationSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { timestamps: true }
);

export const affiliationModel = mongoose.model(
  "affiliation",
  affiliationSchema
);
