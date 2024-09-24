import mongoose from "mongoose";
import { taskModel } from "./tasks.model.js";
import { affiliationModel } from "./affiliation.model.js";
import { removeFile } from "../../src/utils/removeFiles.js";
import { messageModel } from "./message.model.js";

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Name is a required field."],
      minLength: [2, "Name is too short."],
    },
    phone: {
      type: String,
      required: [true, "Phone is a required field."],
      unique: [true, "Phone must be unique."],
    },
    otp: {
      type: String,
    },
    profilePic: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    subscriptionType: {
      type: String,
      enum: ["normal", "premium", "premiumPlus"],
      default: "normal",
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    isOnFreeTrial: {
      type: Boolean,
      default: true, 
    },
    trialStartDate: { 
      type: Date, 
      default: Date.now, 
    },
    trialEndDate: {
      type: Date,
      default: function() {
        return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); 
      }
    },
    isTrialActive: {
      type: Boolean,
      default: true,
    },
    remainingDays: {
      type: Number,
      default: 30, 
    }
  },
  { timestamps: true }
);
userSchema.methods.updateRemainingDays = function() {
  const now = new Date();
  
  // Calculate trialEndDate based on trialStartDate
  const diffTime = this.trialEndDate - now;
  const remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Update fields and save the document
  this.remainingDays = remainingDays > 0 ? remainingDays : 0;
  this.isTrialActive = remainingDays > 0;
  
  return this.save(); // Save the updated user document
};


userSchema.pre('save', function(next) {
  const now = new Date();
  
  if (this.trialEndDate) {
    const diffTime = this.trialEndDate - now;
    const remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    this.remainingDays = remainingDays > 0 ? remainingDays : 0;
    
    this.isTrialActive = remainingDays > 0;
  }
  next();
});

// userSchema.pre("save", function () {
//   this.password = bcrypt.hashSync(this.password, 10);
// });
// userSchema.pre("findOneAndUpdate", function () {
//   if(this._update.password){
//   this._update.password = bcrypt.hashSync(this._update.password, 10);
//   }
// });
userSchema.pre("findOneAndUpdate",async function () {
  
  if(this._update.name){
    await messageModel.updateMany(
      { sender: this._update._id },
      { $set: { senderName: this._update.name } },
      { new: true }
    )
  }
});
userSchema.pre(/^delete/, { document: false, query: true }, async function () {
  const doc = await this.model.findOne(this.getFilter());
  if (doc) {
    await taskModel.deleteMany({
      $and: [{ createdBy: doc._id }, { taskType: "normal" }],
    });
    await affiliationModel.deleteMany({ user: doc._id });
    await taskModel.updateMany(
      { users: doc._id },
      { $pull: { users: doc._id } },
      { new: true }
    );
    removeFile("profilePic", doc.profilePic);
  }
});

export const userModel = mongoose.model("user", userSchema);
