import mongoose from "mongoose";

const affiliationSchema = mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
    },
    reward: {
      type: Number,
      required: true,
    },
    num: {
      type: Number,
    },
    referrals: {
      type: [mongoose.Schema.Types.ObjectId],
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
