import { userModel } from "../../../database/models/user.model.js";
import ApiFeature from "../../utils/apiFeature.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";
import AppError from "../../utils/appError.js";
import path from "path";
import fsExtra from "fs-extra";
import { sendEmail } from "../../email/sendEmail.js";

const addPhotos = catchAsync(async (req, res, next) => {
  let profilePic = "";
  req.body.profilePic =
    req.files.profilePic &&
    req.files.profilePic.map(
      (file) =>
        `https://tchatpro.com/profilePic/${file.filename.split(" ").join("-")}`
    );

  const directoryPath = path.join(profilePic, "uploads/profilePic");

  fsExtra.readdir(directoryPath, (err, files) => {
    if (err) {
      return console.error("Unable to scan directory: " + err);
    }

    files.forEach((file) => {
      const oldPath = path.join(directoryPath, file);
      const newPath = path.join(directoryPath, file.replace(/\s+/g, "-"));

      fsExtra.rename(oldPath, newPath, (err) => {
        if (err) {
          console.error("Error renaming file: ", err);
        }
      });
    });
  });

  if (req.body.profilePic) {
    profilePic = req.body.profilePic;
  }
  if (profilePic !== "") {
    profilePic = profilePic[0];
    res.status(200).json({
      message: "Photo created successfully!",
      profilePic,
    });
  } else {
    res.status(400).json({ message: "File upload failed." });
  }
});

const getAllUsersByAdmin = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(
    userModel.find().sort({ $natural: -1 }),
    req.query
  )
    .sort()
    .search()
    .pagination();
  let results = await ApiFeat.mongooseQuery;
  if (!results || !ApiFeat) {
    return res.status(404).json({
      message: "No users was found! add a new user to get started!",
    });
  }
  let { filterType, filterValue } = req.query;
  if (filterType && filterValue) {
    results = results.filter(function (item) {
      if (filterType == "name") {
        return item.name.toLowerCase().includes(filterValue.toLowerCase());
      }
      if (filterType == "phone") {
        return item.phone.toLowerCase().includes(filterValue.toLowerCase());
      }
      if (filterType == "subscriptionType") {
        return item.subscriptionType
          .toLowerCase()
          .includes(filterValue.toLowerCase());
      }
    });
  }

  if (filterType == "sort") {
    let filter = await userModel.find();
    results = filter;
  }
  res.json({
    message: "Done",
    page: ApiFeat.page,
    count: await userModel.countDocuments(),
    results,
  });
});
const getContacts = catchAsync(async (req, res, next) => {
  let results = [];
let notExist = [];

// Extract phone numbers from the request body
const phoneNumbers = req.body.contacts.map(item => item.phone);

// Find users in the database whose phone numbers exist
let exists = await userModel
  .find({ phone: { $in: phoneNumbers } })
  .select("name phone _id");

// Get an array of phone numbers that exist in the database
const existingNumbers = exists.map(doc => doc.phone);

// Process the original contacts array
req.body.contacts.forEach(contact => {
  if (existingNumbers.includes(contact.phone)) {
    // If the phone number exists, return it with isExist: true and keep the original name
    results.push({
      phone: contact.phone,
      name: contact.name,
      isExist: true
    });
  } else {
    // If the phone number doesn't exist, return it with isExist: false and keep the original name
    notExist.push({
      phone: contact.phone,
      name: contact.name,
      isExist: false
    });
  }
});

// Combine the existing users from the database with the non-existing contacts
exists = exists.map(user => ({
  phone: user.phone,
  name: user.name, // If the name from the DB should be used, otherwise use the original name from the contacts array
  isExist: true
}));

// Combine the results and notExist arrays
results = results.concat(notExist);

// Return the response
res.json({ message: "Done", results });
});

const getUserById = catchAsync(async (req, res, next) => {
  let { id } = req.params;

  let results = await userModel.findById(id);
  !results && next(new AppError(`not found `, 404));
  results && res.json({ message: "done", results });
});

const updateUser = catchAsync(async (req, res, next) => {
  let { id } = req.params;

  let results = await userModel.findByIdAndUpdate(id, req.body, { new: true });
  !results && res.status(404).json({ message: "couldn't update! not found!" });
  results && res.json({ message: "updatedd", results });
});
const postMessage = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  // let {message} = req.body

  let results = await userModel.findById(id);
  !results && res.status(404).json({ message: "couldn't post! not found!" });
  sendEmail(req.body.message, results.name, results.phone);
  res.json({ message: "Message sent to admin", results });
});

const deleteUser = catchAsync(async (req, res, next) => {
  let { id } = req.params;

  let deletedUser = await userModel.deleteOne({ _id: id });

  if (!deletedUser) {
    return res
      .status(404)
      .json({ message: "Couldn't delete! User not found!" });
  }
  // let deletedTask = await taskModel.deleteMany({ createdBy: id });
  // console.log(deletedTask);

  res.status(200).json({ message: "User deleted successfully!" });
});

export {
  getAllUsersByAdmin,
  getUserById,
  updateUser,
  deleteUser,
  addPhotos,
  postMessage,
  getContacts,
};
