import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { taskModel } from "./tasks.model.js";
import fsExtra from "fs-extra";

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
  console.log(doc.profilePic);
  if (doc) {
    await taskModel.deleteMany({ createdBy: doc._id });
    fsExtra.unlink(doc.profilePic, (err) => {
      if (err) {
        // An error occurred while deleting the file
        if (err.code === 'ENOENT') {
          // The file does not exist
          console.error('The file does not exist');
        } else {
          // Some other error
          console.error(err.message);
        }
      } else {
        // The file was deleted successfully
        console.log('The file was deleted');
      }
    });
  }
});

export const userModel = mongoose.model("user", userSchema);
