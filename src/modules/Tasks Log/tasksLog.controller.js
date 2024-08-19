import { taskLogModel } from "../../../database/models/tasksLog.model.js";
import ApiFeature from "../../utils/apiFeature.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";

// const createTask = catchAsync(async (req, res, next) => {
//   let newTask = new taskLogModel(req.body);
//   let addedTask = await newTask.save();

//   res.status(201).json({
//     message: " Task has been created successfully!",
//     addedTask,
//   });
// });

const getAllTaskLogByTask = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(
    taskLogModel.find({ taskId: req.params.id }).sort({ $natural: -1 }),
    req.query
  )
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
results=results[0]
  res.json({
    message: "Done",
    results,
  });
});

export { getAllTaskLogByTask };
