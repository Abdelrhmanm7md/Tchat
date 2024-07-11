import { subModel } from "../../../database/models/subscription.model.js";
import ApiFeature from "../../utils/apiFeature.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";


const createSub = catchAsync(async (req, res, next) => {
  
  const { title, content, tags ,author} = req.body;
  
  const newSub = new subModel({ title, content,tags, author });
  const savedSub = await newSub.save();
  res.status(201).json({
    message: "Sub created successfully!",
     savedSub
  });
});

const editSub = catchAsync(async (req, res, next) => {
  const {id} = req.params;

  const updatedSub = await subModel.findByIdAndUpdate(
    id,
    req.body,
    { new: true }
  );

  if (!updatedSub) {
    return res.status(404).json({ message: "Sub not found!" });
  }

  res.status(200).json({
    message: "Sub updated successfully!",
    updatedSub
  });
});

const deleteSub = catchAsync(async (req, res, next) => {
  const {id} = req.params;

  const deletedSub = await subModel.findByIdAndDelete(id);

  if (!deletedSub) {
    return res.status(404).json({ message: "Sub not found!" });
  }

  res.status(200).json({ message: "Sub deleted successfully!" });
});

const getAllSubs = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(subModel.find(), req.query)
    .pagination()
    .sort()
    .search()

  let results = await ApiFeat.mongooseQuery;
  res.json({ message: "done", page: ApiFeat.page, results });
  if (!ApiFeat) {
    return res.status(404).json({
      message: "No Sub was found!",
    });
  }
});

export { createSub, editSub, deleteSub,getAllSubs };
