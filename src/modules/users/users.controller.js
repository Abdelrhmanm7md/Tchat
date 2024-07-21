import { userModel } from "../../../database/models/user.model.js";
import ApiFeature from "../../utils/apiFeature.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";
import AppError from "../../utils/appError.js";
import path from "path";
import fsExtra from "fs-extra";

// const addPhoto = catchAsync(async (req, res, next) => {
//   if (req.file) req.body.profilePic = req.file.originalname;
//   let profilePic = "";
//   if (req.body.profilePic) {
//     profilePic = req.body.profilePic;
//   }

//   // profilePic = profilePic.map(
//   //   (file) => `http://localhost:8000/tasks/${file.originalname.split(" ").join("")}`
//   // );

//     const directoryPath = path.join(profilePic, 'uploads/profilePic');

//     fsExtra.readdir(directoryPath, (err, files) => {
//         if (err) {
//             return console.error('Unable to scan directory: ' + err);
//         }

//         files.forEach(file => {
//             const oldPath = path.join(directoryPath, file);
//             const newPath = path.join(directoryPath, file.replace(/\s+/g, ''));

//             fsExtra.rename(oldPath, newPath, (err) => {
//                 if (err) {
//                     console.error('Error renaming file: ', err);
//                 } else {
//                     console.log(`Renamed: ${file} -> ${file.replace(/\s+/g, '')}`);
//                 }
//             });
//         });
//     });

//   if (!req.body.profilePic) {
//     return res.status(404).json({ message: "Couldn't update!  not found!" });
//   }
//   res.status(200).json({
//     message: "Photo updated successfully!",
//     // profilePic: `http://localhost:8000/profilePic/${profilePic}`,
//     profilePic
//   });
// });

const addPhotos = catchAsync(async (req, res, next) => {
  let profilePic = "";
  req.body.profilePic =
    req.files.profilePic &&
    req.files.profilePic.map(
      (file) =>
        `https://tchatpro.com/profilePic/${file.filename.split(" ").join("")}`
    );

  const directoryPath = path.join(profilePic, "uploads/profilePic");

  fsExtra.readdir(directoryPath, (err, files) => {
    if (err) {
      return console.error("Unable to scan directory: " + err);
    }

    files.forEach((file) => {
      const oldPath = path.join(directoryPath, file);
      const newPath = path.join(directoryPath, file.replace(/\s+/g, ""));

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
  if(profilePic !== ""){
    profilePic =profilePic[0]
    res.status(200).json({
      message: "Photo created successfully!",
      profilePic,
    });
}else {
  res.status(400).json({ message: 'File upload failed.'});
}
});

const getAllUsersByAdmin = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(userModel.find(), req.query).sort().search();

  let results = await ApiFeat.mongooseQuery;
  res.json({
    message: "done",

    count: await userModel.countDocuments(),
    results,
  });
  if (!results) {
    return res.status(404).json({
      message: "No users was found! add a new user to get started!",
    });
  }
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

const deleteUser = catchAsync(async (req, res, next) => {
  let { id } = req.params;

  let deletedUser = await userModel.findByIdAndDelete(id);

  if (!deletedUser) {
    return res
      .status(404)
      .json({ message: "Couldn't delete! User not found!" });
  }

  res.status(200).json({ message: "User deleted successfully!" });
});

export { getAllUsersByAdmin, getUserById, updateUser, deleteUser, addPhotos };
