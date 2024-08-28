import { groupModel } from "../../../database/models/group.model.js";
import { taskModel } from "../../../database/models/tasks.model.js";
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
const deleteTaskGroup = catchAsync(async (req, res, next) => {
  let { id, groupId } = req.params;

  let deleteTaskGroup = await taskModel.findOneAndUpdate(
    { _id: id },
    { $pull: { group: groupId } },
    { new: true }
  );
  if (!deleteTaskGroup) {
    return res.status(404).json({ message: "Group not found!" });
  }

  res
    .status(200)
    .json({ message: "task deleted successfully!", deleteTaskGroup });
});

const deleteGroup = catchAsync(async (req, res, next) => {
  let { id } = req.params;

  let deleteGroup = await groupModel.findOneAndDelete({ _id: id });
  if (!deleteGroup) {
    return res.status(404).json({ message: "Group not found!" });
  }
  let deleteTaskGroup = await taskModel.findOneAndUpdate(
    { _id: id },
    { $pull: { group: groupId } },
    { new: true }
  );
  if (!deleteTaskGroup) {
    return res.status(404).json({ message: "Group not found!" });
  }

  res.status(200).json({ message: "task deleted successfully!" });
});

const getAllGroupsByAdmin = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(
    groupModel
      .find(),
    req.query
  )
    .pagination()
    .sort()
    .search();

  let results = await ApiFeat.mongooseQuery;
  if (!ApiFeat || !results) {
    return res.status(404).json({
      message: "No Group was found!",
    });
  }
  res.json({ message: "done", page: ApiFeat.page, results });
});
const getAllGroupsByUser = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(
    groupModel
      .find({ createdBy: req.params.id }),
    req.query
  )
    .sort()
    .search();
  

  let results = await ApiFeat.mongooseQuery;
  if (!ApiFeat || !results) {
    return res.status(404).json({
      message: "No Group was found!",
    });
  }
  res.json({ message: "done", results });
});
const getAllTasksByGroup = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(
    taskModel
      .find({ group: req.params.id }).populate("createdBy").populate("users"),
    req.query
  )
    .sort()
    .search();
  

  let results = await ApiFeat.mongooseQuery;
  if (!ApiFeat || !results) {
    return res.status(404).json({
      message: "No Group was found!",
    });
  }
  res.json({ message: "done", results });
});

export {
  createGroup,
  editGroup,
  deleteGroup,
  getAllGroupsByAdmin,
  getAllGroupsByUser,
  deleteTaskGroup,
  getAllTasksByGroup,
};
