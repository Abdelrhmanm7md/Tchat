import { taskLogModel } from "../../../database/models/tasksLog.model.js";
import ApiFeature from "../../utils/apiFeature.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";
import fsExtra from "fs-extra";
import path from "path";

// const createTask = catchAsync(async (req, res, next) => {
//   let newTask = new taskLogModel(req.body);
//   let addedTask = await newTask.save();

//   res.status(201).json({
//     message: " Task has been created successfully!",
//     addedTask,
//   });
// });

const getAllTaskLogByAdmin = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(taskLogModel.find().populate("users").populate("createdBy").sort({ $natural: -1 }), req.query).pagination()
    .sort()
    .search();

  let results = await ApiFeat.mongooseQuery;
  results = JSON.stringify(results);
  results = JSON.parse(results);
  if (!ApiFeat || !results) {
    return res.status(404).json({
      message: "No Task was found!",
    });
  }
  
  res.json({
    message: "done",
    page: ApiFeat.page,
    count: await taskLogModel.countDocuments(),
    results,
  });

});
const getAllTaskLogByTask = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(taskLogModel.find({taskId:req.params.id}).populate("users").populate("createdBy").sort({ $natural: -1 }), req.query).pagination()
    .sort()
    .search();

  let results = await ApiFeat.mongooseQuery;
  results = JSON.stringify(results);
  results = JSON.parse(results);
  if (!ApiFeat || !results) {
    return res.status(404).json({
      message: "No Task was found!",
    });
  }
  
  res.json({
    message: "done",
    page: ApiFeat.page,
    count: await taskLogModel.countDocuments(),
    results,
  });

});

const deleteTask = catchAsync(async (req, res, next) => {
  let { id } = req.params;

  let deletedTask = await taskLogModel.findByIdAndDelete({ _id: id });

  if (!deletedTask) {
    return res.status(404).json({ message: "Couldn't delete!  not found!" });
  }

  res.status(200).json({ message: "Task deleted successfully!" });
});



    const deleteUserTask = catchAsync(async (req, res, next) => {
      let { id,userId } = req.params;
    
      let deleteUserTask = await taskLogModel.findOneAndUpdate(
        { _id: id },
        { $pull: { users:  userId  } },
        { new: true }  );  
      if (!deleteUserTask) {
        return res.status(404).json({ message: "tasks not found!" });
      }
      if(deleteUserTask.users.length == 0){
        deleteUserTask = await taskLogModel.findOneAndUpdate(
          { _id: id },
          { isShared: false, taskType: "normal"},
          { new: true }  );
      }
      
      res.status(200).json({ message: "user deleted successfully!", deleteUserTask });
    });


export {
  getAllTaskLogByTask,  getAllTaskLogByAdmin,
  deleteTask,
  deleteUserTask,
};
