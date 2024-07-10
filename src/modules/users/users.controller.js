import { userModel } from "../../../database/models/user.model.js";
import ApiFeature from "../../utils/apiFeature.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";
import AppError from "../../utils/appError.js";

const createUser = catchAsync(async (req, res, next) => {
  let phoneFormat = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/; //+XX XXXXX XXXXX
  if (req.body.phone !== "" && req.body.phone.match(phoneFormat)) {
    let existUser = await userModel.findOne({ phone: req.body.phone });
    if (existUser) {
      return res.status(409).json({ message: "this phone already exist" });
    }
  }
  let results = new userModel(req.body);
  await results.save();
  res.json({ message: "added", results });
});

const addPhoto = catchAsync(async (req, res, next) => {
  if (req.file) req.body.profilePic = req.file.filename;
  let profilePic = "";
  if (req.body.profilePic) {
    profilePic = req.body.profilePic;
  }
  if (!req.body.profilePic) {
    return res.status(404).json({ message: "Couldn't update!  not found!" });
  }
  res.status(200).json({
    message: "Photo updated successfully!",
    profilePic: `${process.env.BASE_URL}profilePic/${profilePic}`,
  });
});


const getAllUsers = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(userModel.find(), req.query)
    .pagination()
    .filter()
    .sort()
    .search()

  let results = await ApiFeat.mongooseQuery;
  res.json({ message: "done", page: ApiFeat.page,count: await userModel.countDocuments(), results });
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
  !results && next(new AppError(`not found `, 404));
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

export {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  addPhoto,
};
