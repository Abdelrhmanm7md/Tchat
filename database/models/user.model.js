import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { taskModel } from "./tasks.model.js";
import { affiliationModel } from "./affiliation.model.js";
import { removeFile } from "../../src/utils/middleWare/removeFiles.js";

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
      // minLength: 11,
      unique: [true, "Phone must be unique."],
    },
    otp: {
      type: String,
      // required: true,
    },
    profilePic: {
      type: String,
      default: "",
      // required: true,
    },
    role: {
      type: String,
      enum: [ "admin","user"],
      default: "user",
    },
    subscriptionType: {
      type: String,
      enum: [ "normal","premium"],
      default: "normal",
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// userSchema.post("init", (doc) => {
//   doc.profilePic = process.env.BASE_URL + "profilePic/" + doc.profilePic;
// });

// userSchema.pre("save", function () {
//   this.password = bcrypt.hashSync(this.password, 10);
// });
// userSchema.pre("findOneAndUpdate", function () {
//   if(this._update.password){
//   this._update.password = bcrypt.hashSync(this._update.password, 10);
//   }
// });
userSchema.pre(/^delete/, { document: false, query: true }, async function() {
  const doc = await this.model.findOne(this.getFilter());
  if (doc) {
    await taskModel.deleteMany({ $and: [{ createdBy: doc._id}, { taskType: "normal" }] });
    await affiliationModel.deleteMany({ user: doc._id });
    await taskModel.updateMany({ users: doc._id }, { $pull: { users: doc._id } },{ new: true });

    // const photoPath = doc.profilePic.replace("https://tchatpro.com/profilePic/", "");
    // const fullPath = path.resolve("uploads/profilePic", photoPath);
    // // Check if the file exists
    // fsExtra.access(fullPath, fsExtra.constants.F_OK, (err) => {
    //     if (err) {
    //         console.error('File does not exist or cannot be accessed');
    //         return;
    //     }
    //     // Delete the file
    //     fsExtra.unlink(fullPath, (err) => {
    //         if (err) {
    //             console.error('Error deleting the file:', err);
    //         } else {
    //             console.log('File deleted successfully');
    //         }
    //     });
    // });
    removeFile("profilePic",doc.profilePic)
  }
});

export const userModel = mongoose.model("user", userSchema);
