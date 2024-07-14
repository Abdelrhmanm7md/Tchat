import { messageModel } from "../../../database/models/message.model.js";
import ApiFeature from "../../utils/apiFeature.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";

const createmessage = catchAsync(async (req, res, next) => {
  const newmessage = new messageModel(req.body);
  const savedmessage = await newmessage.save();

  res.status(201).json({
    message: "message created successfully!",
    savedmessage,
  });
});
const addPhoto = catchAsync(async (req, res, next) => {
  if (req.file) req.body.image = req.file.filename;
  let image = "";
  if (req.body.image) {
    image = req.body.image;
  }
  if (!req.body.image) {
    return res.status(404).json({ message: "Couldn't update!  not found!" });
  }
  res.status(200).json({
    message: "Photo updated successfully!",
    image: `${process.env.BASE_URL}image/${image}`,
  });
});
const getAllmessage = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(messageModel.find(), req.query)
    .pagination()
    .search()

  let results = await ApiFeat.mongooseQuery;
  results = JSON.stringify(results);
  results = JSON.parse(results);
  res.json({
    message: "done",
    page: ApiFeat.page,
    count: await messageModel.countDocuments(),
    results,
  });
  if (!ApiFeat) {
    return res.status(404).json({
      message: "No message was found!",
    });
  }
});

export {
  createmessage,
  getAllmessage,
  addPhoto,
};
