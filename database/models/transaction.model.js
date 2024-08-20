import mongoose from "mongoose";

const transSchema = mongoose.Schema(
  {
    transId: {
      type: String,
      // required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    method: {
      type: String,
      // required: true,
    },
    features: {
      type: [String],
      required: true,
    },
  },
  { timestamps: true }
);

export const transModel = mongoose.model("transaction", transSchema);
