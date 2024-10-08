import { taskModel } from "../../../database/models/tasks.model.js";
import { taskLogModel } from "../../../database/models/tasksLog.model.js";
import { userModel } from "../../../database/models/user.model.js";
import ApiFeature from "../../utils/apiFeature.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";

const getInProgressTasksByAdmin = catchAsync(async (req, res, next) => {
    let ApiFeat = new ApiFeature(
      taskModel.find({ taskStatus: "InProgress" }),
      req.query
    )
      .sort()
      .search();
    let results = await ApiFeat.mongooseQuery;
    if (!ApiFeat || !results) {
      return res.status(404).json({
        message: "No Task was found!",
      });
    }
    res.json({
      message: "Done",
      results,
      count: await taskModel.countDocuments({ taskStatus: "InProgress" }),
    });
  });

  const getAllTasksByAdminByWeek = catchAsync(async (req, res, next) => {
    const now = new Date();
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(now.getDate() - 90);
  
    const priorities = ['low', 'normal', 'high']; // Adjust based on your application's priorities
  
    const taskResults = await taskModel.aggregate([
      {
        $match: {
          createdAt: {
            $gte: ninetyDaysAgo, // Filter tasks from the last 90 days
            $lte: now, // Until the current date
          },
        },
      },
      {
        $group: {
          _id: "$priority", // Group by the priority field
          count: { $sum: 1 }, // Count the number of tasks for each priority
        },
      },
    ]);
  
    // Convert the taskResults to a map for easy lookup
    const taskCountMap = taskResults.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});
  
    // Create results that include all priorities, defaulting to 0 if not found
    const results = priorities.map(priority => ({
      priority,
      count: taskCountMap[priority] || 0, // Use count from map or default to 0
    }));
  
    // Optionally sort by count (descending)
    results.sort((a, b) => b.count - a.count);
  res.json({
    message: "Done",
    results,
    countAll: await taskModel.countDocuments(),
    countDone: await taskModel.countDocuments({ taskStatus: "Done" }),
    countCancel: await taskModel.countDocuments({ taskStatus: "Cancelled" }),
  });
});
const getAllTasksByAdminByDay = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(
    taskModel
      .find({
          priority: req.params.priority ,
      })
      .populate("users")
      .populate("createdBy"),
    req.query
  )
    .sort()
    .search();
  let results = await ApiFeat.mongooseQuery;
  if (!ApiFeat || !results) {
    return res.status(404).json({
      message: "No Task was found!",
    });
  }
  res.json({
    message: "Done",
    results,
  });
});
  const getCancelTasksByAdmin = catchAsync(async (req, res, next) => {
    let ApiFeat = new ApiFeature(
      taskModel.find({ taskStatus: "Cancelled" }),
      req.query
    )
      .sort()
      .search();
    let results = await ApiFeat.mongooseQuery;
    if (!ApiFeat || !results) {
      return res.status(404).json({
        message: "No Task was found!",
      });
    }
    res.json({
      message: "Done",
      results,
      count: await taskModel.countDocuments({ taskStatus: "Cancelled" }),
    });
  });
  const getDoneTasksByAdmin = catchAsync(async (req, res, next) => {
    let ApiFeat = new ApiFeature(
      taskModel
        .find({ taskStatus: "Done" })
        .populate("users")
        .populate("createdBy")
        .select("-messages"),
      req.query
    )
      .sort()
      .search();
    let results = await ApiFeat.mongooseQuery;
    if (!ApiFeat || !results) {
      return res.status(404).json({
        message: "No Task was found!",
      });
    }
    let { filterType, filterValue } = req.query;
    if (filterType && filterValue) {
      results = results.filter(function (item) {
        if (filterType == "date") {
          return item.eDate == filterValue;
        }
      });
    }
    res.json({
      message: "Done",
      results,
      count: await taskModel.countDocuments({ taskStatus: "Done" }),
    });
  });
  const getAllTasksByAdmin = catchAsync(async (req, res, next) => {
    let ApiFeat = new ApiFeature(taskModel.find({}), req.query).sort().search();
    let results = await ApiFeat.mongooseQuery;
    if (!ApiFeat || !results) {
      return res.status(404).json({
        message: "No Task was found!",
      });
    }
    res.json({
      message: "Done",
      count: await taskModel.countDocuments(),
    });
  });
  const getAllTaskByAdmin = catchAsync(async (req, res, next) => {
    let ApiFeat = new ApiFeature(
      taskModel
        .find()
        .populate("users")
        .populate("createdBy")
        .sort({ $natural: -1 })
        .select("-messages"),
      req.query
    )
      .pagination()
  
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
    let { filterType, filterValue } = req.query;
  
    if (filterType && filterValue) {
      results = results.filter(function (item) {
        if (filterType == "title") {
          return item.title.toLowerCase().includes(filterValue.toLowerCase());
        }
        if (filterType == "description") {
          return item.desc.toLowerCase().includes(filterValue.toLowerCase());
        }
        if (filterType == "taskStatus") {
          return item.taskStatus
            .toLowerCase()
            .includes(filterValue.toLowerCase());
        }
        if (filterType == "priority") {
          return item.priority.toLowerCase().includes(filterValue.toLowerCase());
        }
        if (filterType == "date") {
          return item.eDate.includes(filterValue);
        }
        if (filterType == "taskType") {
          return item.taskType.toLowerCase().includes(filterValue.toLowerCase());
        }
        if (filterType == "users") {
          if (item.users[0]) {
            return item.users[0].name
              .toLowerCase()
              .includes(filterValue.toLowerCase());
          }
        }
      });
    }
    if (filterType == "sort") {
      let filter = await taskModel.find();
      results = filter;
    }
    res.json({
      message: "Done",
      page: ApiFeat.page,
      count: await taskModel.countDocuments(),
      countDone: await taskModel.countDocuments({ taskStatus: "Done" }),
      countCancel: await taskModel.countDocuments({ taskStatus: "Cancelled" }),
      results,
    });
  });
export { getAllTasksByAdminByWeek ,
    getAllTasksByAdminByDay,
    getInProgressTasksByAdmin,
    getCancelTasksByAdmin,
    getDoneTasksByAdmin,
    getAllTasksByAdmin,
    getAllTaskByAdmin

};
