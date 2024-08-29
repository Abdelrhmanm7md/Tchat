import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";
import AppError from "../../utils/appError.js";
import { userModel } from "../../../database/models/user.model.js";
import { affiliationModel } from "../../../database/models/affiliation.model.js";
import generateUniqueId from "generate-unique-id";

export const signUp = catchAsync(async (req, res, next) => {
  // let phoneFormat = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/; //+XX XXXXX XXXXX
  // console.log(req.body.phone.length);
  // if (
  //   req.body.phone !== "" &&
  // req.body.phone.match(phoneFormat) &&
  //   req.body.phone.length > 10
  // )
  if (req.body.phone !== "") {
    let existUser = await userModel.findOne({ phone: req.body.phone });
    if (existUser) {
      return res.status(409).json({ message: "this phone already exist" });
    }
  } else {
    return res.status(409).json({ message: "this phone is not valid" });
  }
  req.body.profilePic = "https://tchatpro.com/profilePic/defaultImages.jpg";
  let results = new userModel(req.body);
  let token = jwt.sign(
    { name: results.name, userId: results._id },
    process.env.JWT_SECRET_KEY
  );

  req.body.code = generateUniqueId({
    length: 10,
    useLetters: true,
  });
  let codeUser = null;
  let savedAff = null;
  if (req.query.code) {
    codeUser = await affiliationModel
      .findOne({ code: req.query.code })
      .populate("user");
    if (codeUser) {
      let total = await affiliationModel.findByIdAndUpdate(
        { _id: codeUser._id },
        {
          $inc: { amount: codeUser.reward },
        }
      );
      codeUser = codeUser.user._id;
      const newAff = new affiliationModel({
        user: results._id,
        code: req.body.code,
        referredBy: codeUser,
      });
      savedAff = await newAff.save();
    } else {
      return res.status(401).json({ message: "invalid code" });
    }
  } else {
    const newAff = new affiliationModel({
      user: results._id,
      code: req.body.code,
    });
    savedAff = await newAff.save();
  }
  await results.save();
  res.json({ message: "added", token, results, savedAff });
});

export const signIn = catchAsync(async (req, res, next) => {
  // let phoneFormat = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/; //+XX XXXXX XXXXX
  // if (req.body.phone !== "" && req.body.phone.match(phoneFormat)) {
  if (req.body.phone !== "") {
    let { phone } = req.body;
    let isFound = await userModel.findOne({ phone });
    if (!isFound) return res.status(404).json({ message: "User Not Found" });
    if (isFound) {
      let token = jwt.sign(
        { name: isFound.name, userId: isFound._id },
        process.env.JWT_SECRET_KEY
      );
      return res.json({ message: "success", token, isFound });
    }
    return res.status(401).json({ message: "worng phone or password" });
  } else {
    return res.status(409).json({ message: "this phone is not valid" });
  }
});

// 1- check we have token or not
// 2- verfy token
// 3 if user of this token exist or not
// 4- check if this token is the last one or not (change password )

export const protectRoutes = catchAsync(async (req, res, next) => {
  let { token } = req.headers;
  if (!token) {
    return next(new AppError(`please login first`, 401));
  }
  let decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  let user = await userModel.findById(decoded.userId);
  if (!user) {
    return next(new AppError(`user Invalid`, 401));
  }
  if (user.changePasswordAt) {
    let changePasswordTime = parseInt(user.changePasswordAt.getTime() / 1000);
    if (changePasswordTime > decoded.iat) {
      return next(new AppError(`token Invalid`, 401));
    }
  }
  req.user = user;
  next();
});


