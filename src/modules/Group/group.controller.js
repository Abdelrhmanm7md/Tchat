import { groupModel } from "../../../database/models/group.model.js";
import ApiFeature from "../../utils/apiFeature.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";

const createGroup = catchAsync(async (req, res, next) => {

  const newGroup = new groupModel(req.body);
  const savedGroup = await newGroup.save();
  res.status(201).json({
    message: "Group created successfully!",
    savedGroup,
  });
});

const editGroup = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const updatedGroup = await groupModel.findByIdAndUpdate(id, req.body, {
    new: true,
  });

  if (!updatedGroup) {
    return res.status(404).json({ message: "Group not found!" });
  }

  res.status(200).json({
    message: "Group updated successfully!",
    updatedGroup,
  });
});

const deleteGroup = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  if (!deletedGroup) {
    return res.status(404).json({ message: "Group not found!" });
  }
  const deletedGroup = await groupModel.findByIdAndDelete(id);
  
  res.status(200).json({ message: "Group deleted successfully!" });
});

const getAllGroups = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(groupModel.find().populate("tasks tasks.users tasks.createdBy"), req.query).sort().search();

  let results = await ApiFeat.mongooseQuery;
  res.json({ message: "done", results });
  if (!ApiFeat) {
    return res.status(404).json({
      message: "No Group was found!",
    });
  }
});

export { createGroup, editGroup, deleteGroup, getAllGroups };
