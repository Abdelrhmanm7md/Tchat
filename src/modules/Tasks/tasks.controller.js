import { log } from "console";
import { taskModel } from "../../../database/models/tasks.model.js";
import { taskLogModel } from "../../../database/models/tasksLog.model.js";
import { userModel } from "../../../database/models/user.model.js";
import ApiFeature from "../../utils/apiFeature.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";
import fsExtra from "fs-extra";
import path from "path";
import { removeFile } from "../../utils/middleWare/removeFiles.js";

const createTask = catchAsync(async (req, res, next) => {
  if (req.body.users) {
    if (req.body.users.length >= 1) {
      req.body.isShared = true;
      req.body.taskType = "shared";
    }
  }
  req.body.users = [];
  req.body.group = [];
  let newTask = new taskModel(req.body);
  let addedTask = await newTask.save();
  let user = await userModel.findById(req.body.createdBy);

  // Create a new task log
  let newTaskLog = new taskLogModel({
    taskId: addedTask._id,
    updates: [
      {
        changes: [`${user.name} Created a Task`],
      },
    ],
  });

  // Save the new task log
  let addedTaskLog = await newTaskLog.save();

  if (req.body.parentTask) {
    let newSubTaskLog = await taskLogModel.findOneAndUpdate(
      { taskId: req.body.parentTask },
      {
        $push: {
          updates: [
            {
              changes: [`${user.name} Created a Sub Task`],
            },
          ],
        },
      },
      { new: true }
    );

    res.status(201).json({
      message: " Task has been created successfully!",
      addedTask,
    });
  }
  res.status(201).json({
    message: " Task has been created successfully!",
    addedTask,
  });
});

const getAllTaskByAdmin = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(
    taskModel
      .find()
      .populate("users")
      .populate("createdBy")
      .sort({ $natural: -1 }),
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
const getAllTaskByUser = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(
    taskModel
      .find({ $or: [{ createdBy: req.params.id }, { users: req.params.id }] })
      .populate("users")
      .populate("createdBy"),
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
  let { filterType, filterValue, filterDate } = req.query;

  if (filterType && filterValue && filterDate) {
    if (filterType == "taskStatus") {
      let filter = await taskModel.find({
        $and: [
          { taskStatus: filterValue.toLowerCase() },
          { eDate: filterDate },
        ],
      });
      results = filter;
    }
    if (filterType == "priority") {
      let filter = await taskModel.find({
        $and: [{ priority: filterValue.toLowerCase() }, { eDate: filterDate }],
      });
      results = filter;
    }
  }
  if (filterType && filterValue) {
    results = results.filter(function (item) {
      if (filterType == "taskStatus") {
        return item.taskStatus
          .toLowerCase()
          .includes(filterValue.toLowerCase());
      }
      if (filterType == "date") {
        return item.eDate.includes(filterValue);
      }
      if (filterType == "priority") {
        return item.priority.toLowerCase().includes(filterValue.toLowerCase());
      }
      // if (filterType == "users") {
      //   if(item.users[0]){
      //     return item.users[0].name.toLowerCase().includes(filterValue.toLowerCase());
      //   }      }
    });
  }
  res.json({
    message: "Done",
    results,
  });
});

const getAllSubTaskByUser = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(
    taskModel
      .find({ parentTask: req.params.id })
      .populate("users")
      .populate("createdBy"),
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
  res.json({
    message: "Done",
    results,
  });
});
const getAllPeopleTask = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(
    taskModel.findById(req.params.id).populate("users"),
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
    results: results.users,
  });
});
const getAllDocsTask = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(taskModel.findById(req.params.id), req.query)
    .sort()
    .search();

  let results = await ApiFeat.mongooseQuery;

  if (!ApiFeat || !results) {
    return res.status(404).json({
      message: "No Task was found!",
    });
  }
  let documents = [];
  if (results.documents) {
    documents = results.documents;
  }

  res.json({
    message: "Done",
    documents,
  });
});
const getAllResTask = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(taskModel.findById(req.params.id), req.query)
    .sort()
    .search();

  let results = await ApiFeat.mongooseQuery;

  if (!ApiFeat || !results) {
    return res.status(404).json({
      message: "No Task was found!",
    });
  }
  let resources = [];
  if (results.resources) {
    resources = results.resources;
  }

  res.json({
    message: "Done",
    resources,
  });
});
const getAllTaskByUserShared = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(
    taskModel
      .find({
        $and: [
          { $or: [{ createdBy: req.params.id }, { users: req.params.id }] },
          { taskType: "shared" },
          { isShared: true },
          { parentTask: null },
        ],
      })
      .populate("createdBy")
      .populate("users")
      .populate("users.createdBy"),
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
  let { filterType, filterValue, filterDate } = req.query;
  let filter = [
    { $or: [{ createdBy: req.params.id }, { users: req.params.id }] },
    { taskType: "shared" },
    { isShared: true },
    { parentTask: null },
  ];
  if ((filterType && filterValue) || filterDate) {
    if (filterType == "taskStatus") {
      filter.push({ taskStatus: filterValue });
    }
    if (filterType == "priority") {
      filter.push({ priority: filterValue });
    }
    if (filterType == "date") {
      filter.push({ eDate: filterValue });
    }
    if (filterDate) {
      filter.push({ eDate: filterDate });
    }
    let query = await taskModel
      .find({
        $and: filter,
      })
      .populate("createdBy")
      .populate("users")
      .populate("users.createdBy");

    results = query;
  }
  res.json({
    message: "Done",
    results,
  });
});
const getAllTaskByUserNormal = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(
    taskModel
      .find({
        $and: [
          { $or: [{ createdBy: req.params.id }, { users: req.params.id }] },
          { taskType: "normal" },
          { isShared: false },
          { parentTask: null },
        ],
      })
      .populate("createdBy")
      .populate("users"),
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

  let filter = [
    { $or: [{ createdBy: req.params.id }, { users: req.params.id }] },
    { taskType: "normal" },
    { isShared: false },
    { parentTask: null },
  ];
  let { filterType, filterValue, filterDate } = req.query;

  if ((filterType && filterValue) || filterDate) {
    if (filterType == "taskStatus") {
      filter.push({ taskStatus: filterValue });
    }
    if (filterType == "priority") {
      filter.push({ priority: filterValue });
    }
    if (filterType == "date") {
      filter.push({ eDate: filterValue });
    }
    if (filterDate) {
      filter.push({ eDate: filterDate });
    }
    let query = await taskModel
      .find({
        $and: filter,
      })
      .populate("createdBy")
      .populate("users");
    results = query;
  }

  res.json({
    message: "Done",
    results,
  });
});

const getTaskById = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  let results = await taskModel
    .findById(id)
    .populate("users")
    .populate("createdBy");

  if (!results) {
    return res.status(404).json({ message: "Task not found!" });
  }

  res.json({
    message: "Done",
    results,
  });
});
const updateTaskPhoto = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  let documents = "";
  if (req.files.documents) {
    req.body.documents =
      req.files.documents &&
      req.files.documents.map(
        (file) =>
          `https://tchatpro.com/tasks/${file.filename.split(" ").join("-")}`
      );
    const directoryPath = path.join(documents, "uploads/tasks");

    fsExtra.readdir(directoryPath, (err, files) => {
      if (err) {
        return console.error("Unable to scan directory: " + err);
      }

      files.forEach((file) => {
        const oldPath = path.join(directoryPath, file);
        const newPath = path.join(directoryPath, file.replace(/\s+/g, "-"));

        fsExtra.rename(oldPath, newPath, (err) => {
          if (err) {
            console.error("Error renaming file: ", err);
          }
        });
      });
    });

    if (req.body.documents !== "") {
      documents = req.body.documents;
    }
  }
  let updatedTask = await taskModel.findByIdAndUpdate(
    id,
    { $push: { documents: documents } },
    { new: true }
  );

  if (!updatedTask) {
    return res.status(404).json({ message: "Couldn't update!  not found!" });
  }
  let user = await userModel.findById(req.query.id);
  let newTaskLog = await taskLogModel.findOneAndUpdate(
    { taskId: id },
    {
      $push: {
        updates: [
          {
            createdBy: req.query.id,
            changes: [`${user.name} added documents `],
          },
        ],
      },
    },
    { new: true }
  );
  res.status(200).json({ message: "Task updated successfully!", documents });
});

const updateTask = catchAsync(async (req, res, next) => {
  let { id } = req.params;

  let updatedTask = await taskModel.findByIdAndUpdate(
    id,
    { isShared: true, taskType: "shared", $push: { users: req.body.users } },
    { new: true }
  );

  if (!updatedTask) {
    return res.status(404).json({ message: "Couldn't update!  not found!" });
  }
  let user = await userModel.findById(req.query.id);
  let newTaskLog = await taskLogModel.findOneAndUpdate(
    { taskId: id },
    {
      $push: {
        updates: [
          {
            changes: [`${user.name} added users`],
          },
        ],
      },
    },
    { new: true }
  );
  res.status(200).json({ message: "Task updated successfully!", updatedTask });
});
const updateTask4 = catchAsync(async (req, res, next) => {
  let { id } = req.params;

  let updatedTask = await taskModel.findByIdAndUpdate(
    id,
    { $push: { resources: req.body.resources } },
    { new: true }
  );

  if (!updatedTask) {
    return res.status(404).json({ message: "Couldn't update!  not found!" });
  }
  let user = await userModel.findById(req.query.id);
  let newTaskLog = await taskLogModel.findOneAndUpdate(
    { taskId: id },
    {
      $push: {
        updates: [
          {
            changes: [`${user.name} added resources`],
          },
        ],
      },
    },
    { new: true }
  );
  res.status(200).json({ message: "Task updated successfully!", updatedTask });
});
const updateTask3 = catchAsync(async (req, res, next) => {
  let { id } = req.params;

  let updatedTask = await taskModel.findOneAndUpdate(
    {_id:id},
    { $push: { group: req.body.group } },
    { new: true }
  );

  if (!updatedTask) {
    return res.status(404).json({ message: "Couldn't update!  not found!" });
  }

  res.status(200).json({ message: "Task updated successfully!", updatedTask });
});
const updateTask2 = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  if (req.body.users) {
    if (req.body.users.length >= 1) {
      req.body.isShared = true;
      req.body.taskType = "shared";
    }
  }

  let updatedTask = await taskModel.findByIdAndUpdate(id, req.body, {
    new: true,
  });

  if (!updatedTask) {
    return res.status(404).json({ message: "Couldn't update!  not found!" });
  }
  let user = await userModel.findById(req.query.id);
  let changes = [];
  if (req.body.title) {
    changes.push(`${user.name} updated title`);
  }
  if (req.body.sDate) {
    changes.push(`${user.name} updated Start Date`);
  }
  if (req.body.eDate) {
    changes.push(`${user.name} updated End Date`);
  }
  if (req.body.sTime) {
    changes.push(`${user.name} updated Start Time`);
  }
  if (req.body.eTime) {
    changes.push(`${user.name} updated End Time`);
  }
  if (req.body.desc) {
    changes.push(`${user.name} updated Description`);
  }
  if (req.body.resources) {
    changes.push(`${user.name} updated Resources`);
  }
  let newTaskLog = await taskLogModel.findOneAndUpdate(
    { taskId: id },
    {
      $push: {
        updates: [
          {
            changes: changes,
          },
        ],
      },
    },
    { new: true }
  );
  res.status(200).json({ message: "Task updated successfully!", updatedTask });
});
const deleteTask = catchAsync(async (req, res, next) => {
  let { id } = req.params;

  let deletedTask = await taskModel.deleteOne({ _id: id });

  if (!deletedTask) {
    return res.status(404).json({ message: "Couldn't delete!  not found!" });
  }

  res.status(200).json({ message: "Task deleted successfully!" });
});

// Admin
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
const getAllTasksByAdminByDay = catchAsync(async (req, res, next) => {
  var sDayOnly = new Date(req.params.date);
  var eDayOnly = new Date(req.params.date);
  eDayOnly.setUTCHours(23, 59, 59, 0);
  let ApiFeat = new ApiFeature(
    taskModel
      .find({ createdAt: { $gte: sDayOnly, $lte: eDayOnly } })
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
const getAllTasksByAdminByWeek = catchAsync(async (req, res, next) => {
  var sDayOnly = new Date(req.query.sDate);
  var eDayOnly = new Date(req.query.eDate);
  eDayOnly.setUTCHours(23, 59, 59, 0);

  let taskCounts = await taskModel.aggregate([
    {
      $match: {
        createdAt: { $gte: sDayOnly, $lte: eDayOnly },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  const allDates = [];
  let currentDate = new Date(sDayOnly);
  while (currentDate <= eDayOnly) {
    allDates.push(currentDate.toISOString().slice(0, 10));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const results = allDates.map((date) => {
    const found = taskCounts.find((tc) => tc._id === date);
    return { count: found ? found.count : 0 };
  });

  res.json({
    message: "Done",
    results,
    countAll: await taskModel.countDocuments(),
    countDone: await taskModel.countDocuments({ taskStatus: "Done" }),
    countCancel: await taskModel.countDocuments({ taskStatus: "Cancelled" }),
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
///////////////////////////////////////\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

// User
const getDoneTasksByUser = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(
    taskModel
      .find({
        $and: [
          { $or: [{ createdBy: req.params.id }, { users: req.params.id }] },
          { taskStatus: "Done" },
        ],
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
  });
});
const getCancelTasksByUser = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(
    taskModel
      .find({
        $and: [
          { $or: [{ createdBy: req.params.id }, { users: req.params.id }] },
          { taskStatus: "Cancelled" },
        ],
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
  });
});
const getAllTasksByUserByWeek = catchAsync(async (req, res, next) => {
  try {
    const sDayOnly = new Date(req.query.sDate);
    const eDayOnly = new Date(req.query.eDate);
    eDayOnly.setUTCHours(23, 59, 59, 999); // End of the day

    const dates = [];
    let currentDate = new Date(sDayOnly);
    while (currentDate <= eDayOnly) {
      dates.push(currentDate.toISOString().split("T")[0]); // Store the date part only
      currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
    }

    const tasks = await taskModel.find({
      $and: [
        { $or: [{ createdBy: req.params.id }, { users: req.params.id }] },
        { createdAt: { $gte: sDayOnly, $lte: eDayOnly } },
      ],
    });

    const taskCountMap = {};
    tasks.forEach((task) => {
      const taskDate = task.createdAt.toISOString().split("T")[0];
      taskCountMap[taskDate] = (taskCountMap[taskDate] || 0) + 1;
    });
    const results = dates.map((date) => ({
      count: taskCountMap[date] || 0,
    }));

    res.json({
      message: "Done",
      results,
      count: await taskModel.countDocuments({
        $and: [
          { $or: [{ createdBy: req.params.id }, { users: req.params.id }] },
          { parentTask: null },
        ],
      }),
      countDone: await taskModel.countDocuments({
        $and: [
          { $or: [{ createdBy: req.params.id }, { users: req.params.id }] },
          { taskStatus: "Done" },
          { parentTask: null },
        ],
      }),
      countCancel: await taskModel.countDocuments({
        $and: [
          { $or: [{ createdBy: req.params.id }, { users: req.params.id }] },
          { taskStatus: "Cancelled" },
          { parentTask: null },
        ],
      }),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
});

const getAllTasksByUserByDay = catchAsync(async (req, res, next) => {
  var sDayOnly = new Date(req.params.date);
  var eDayOnly = new Date(req.params.date);
  eDayOnly.setUTCHours(23, 59, 59, 0);

  let ApiFeat = new ApiFeature(
    taskModel
      .find({
        $and: [
          { $or: [{ createdBy: req.params.id }, { users: req.params.id }] },
          { createdAt: { $gte: sDayOnly, $lte: eDayOnly } },
        ],
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
const getAnalyseTasksByUser = catchAsync(async (req, res, next) => {
  res.json({
    message: "Done",
    countCancel: await taskModel.countDocuments({
      $and: [
        { $or: [{ createdBy: req.params.id }, { users: req.params.id }] },
        { taskStatus: "Cancelled" },
        { parentTask: null },
      ],
    }),
    countDone: await taskModel.countDocuments({
      $and: [
        { $or: [{ createdBy: req.params.id }, { users: req.params.id }] },
        { taskStatus: "Done" },
        { parentTask: null },
      ],
    }),
    countInProgress: await taskModel.countDocuments({
      $and: [
        { $or: [{ createdBy: req.params.id }, { users: req.params.id }] },
        { taskStatus: "InProgress" },
        { parentTask: null },
      ],
    }),
  });
});

const deleteUserTask = catchAsync(async (req, res, next) => {
  let { id, userId } = req.params;

  let deleteUserTask = await taskModel.findOneAndUpdate(
    { _id: id },
    { $pull: { users: userId } },
    { new: true }
  );
  if (!deleteUserTask) {
    return res.status(404).json({ message: "tasks not found!" });
  }
  if (deleteUserTask.users.length == 0) {
    deleteUserTask = await taskModel.findOneAndUpdate(
      { _id: id },
      { isShared: false, taskType: "normal" },
      { new: true }
    );
  }

  res
    .status(200)
    .json({ message: "user deleted successfully!", deleteUserTask });
});
const deleteresourcesTask = catchAsync(async (req, res, next) => {
  let { id, resourcesId } = req.params;
  console.log(id, resourcesId);

  let deleteUserTask = await taskModel.findOneAndUpdate(
    { _id: id },
    { $pull: { resources: { _id: resourcesId } } },
    { new: true }
  );
  // console.log(deleteUserTask.resources[0]._id);

  if (!deleteUserTask) {
    return res.status(404).json({ message: "tasks not found!" });
  }
  res
    .status(200)
    .json({ message: "resources deleted successfully!", deleteUserTask });
});
const deleteDocsTask = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  console.log(req.body.id);

  let deleteUserTask = await taskModel.findOneAndUpdate(
    { _id: id },
    { $pull: { documents: req.body.id } },
    { new: true }
  );
  // const photoPath = req.query.id.replace("https://tchatpro.com/tasks/", "");
  // const fullPath = path.resolve("uploads/tasks", photoPath);
  // // Check if the file exists
  // fsExtra.access(fullPath, fsExtra.constants.F_OK, (err) => {
  //     if (err) {
  //         console.error('File does not exist or cannot be accessed');
  //         return;
  //     }
  //     // Delete the file
  //     fsExtra.unlink(fullPath, (err) => {
  //         if (err) {
  //             console.error('Error deleting the file:', err);
  //         } else {
  //             console.log('File deleted successfully');
  //         }
  //     });
  // });
  removeFile("tasks", req.body.id);

  if (!deleteUserTask) {
    return res.status(404).json({ message: "tasks not found!" });
  }
  res
    .status(200)
    .json({ message: "Docs deleted successfully!", deleteUserTask });
});

export {
  createTask,
  getAllTaskByAdmin,
  getTaskById,
  updateTask,
  deleteTask,
  getAllTaskByUser,
  updateTaskPhoto,
  getAllTaskByUserShared,
  getAllTaskByUserNormal,
  getAllSubTaskByUser,
  updateTask2,
  getAllPeopleTask,
  getAllDocsTask,
  getAllResTask,
  getAllTasksByAdmin,
  getDoneTasksByAdmin,
  getCancelTasksByAdmin,
  getInProgressTasksByAdmin,
  getAnalyseTasksByUser,
  deleteUserTask,
  updateTask3,
  updateTask4,
  getAllTasksByAdminByDay,
  getAllTasksByUserByDay,
  deleteresourcesTask,
  deleteDocsTask,
  getAllTasksByAdminByWeek,
  getAllTasksByUserByWeek,
  getCancelTasksByUser,
  getDoneTasksByUser,
};
