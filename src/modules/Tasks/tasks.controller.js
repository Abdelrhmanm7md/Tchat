import { taskModel } from "../../../database/models/tasks.model.js";
import { taskLogModel } from "../../../database/models/tasksLog.model.js";
import { userModel } from "../../../database/models/user.model.js";
import ApiFeature from "../../utils/apiFeature.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";
import fsExtra from "fs-extra";
import path from "path";
import { removeFile } from "../../utils/removeFiles.js";
import { query } from "express";

const createTask = catchAsync(async (req, res, next) => {
  req.body.users = [];
  req.body.admins = req.body.createdBy;
  if (req.body.users) {
    if (req.body.users.length >= 1) {
      req.body.isShared = true;
      req.body.taskType = "shared";
    }
  }
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

const getAllTaskByUser = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(
    taskModel
      .find({ $or: [{ createdBy: req.params.id }, { users: req.params.id }] })
      .populate("users")
      .populate("createdBy")
      .select("-messages"),
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
  let { filterType, filterValue, filterDateFrom } = req.query;

  if (filterType && filterValue && filterDateFrom) {
    if (filterType == "taskStatus") {
      let filter = await taskModel.find({
        $and: [
          { taskStatus: filterValue.toLowerCase() },
          { eDate: filterDateFrom },
        ],
      });
      results = filter;
    }
    if (filterType == "priority") {
      let filter = await taskModel.find({
        $and: [
          { priority: filterValue.toLowerCase() },
          { eDate: filterDateFrom },
        ],
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
      .populate("createdBy")
      .select("-messages"),
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
    taskModel.findById(req.params.id).populate("users").select("-messages"),
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
  let ApiFeat = new ApiFeature(
    taskModel.findById(req.params.id).select("-messages"),
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
      .populate("users.createdBy")
      .select("-messages"),
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
  let { filterType, filterValue } = req.query;

  let filter = [
    { $or: [{ createdBy: req.params.id }, { users: req.params.id }] },
    { taskType: "shared" },
    { isShared: true },
    { parentTask: null },
  ];
  if (filterType && filterValue) {
    if (filterType == "taskStatus") {
      filter.push({ taskStatus: filterValue });
    }
    if (filterType == "priority") {
      filter.push({ priority: filterValue });
    }
    if (filterType == "group") {
      filter.push({ group: filterValue });
    }
    if (filterType == "date") {
      let dateRange = filterValue.replace(/[\[\]]/g, "").split(",");
      let sDate = dateRange[0].trim();
      let eDate = dateRange[1].trim();

      filter.push({
        $and: [{ sDate: { $gte: sDate } }, { eDate: { $lte: eDate } }],
      });
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
      .populate("users")
      .select("-messages"),
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
  let { filterType, filterValue } = req.query;

  if (filterType && filterValue) {
    if (filterType == "taskStatus") {
      filter.push({ taskStatus: filterValue });
    }
    if (filterType == "priority") {
      filter.push({ priority: filterValue });
    }
    if (filterType == "group") {
      filter.push({ group: filterValue });
    }
    if (filterType == "date") {
      let dateRange = filterValue.replace(/[\[\]]/g, "").split(",");
      let sDate = dateRange[0].trim();
      let eDate = dateRange[1].trim();
      sDate = new Date(sDate);
      eDate = new Date(eDate);
      eDate.setSeconds(59);
      eDate.setMinutes(59);
      eDate.setHours(23);
      eDate.setMilliseconds(599);
      filter.push({
        createdAt: {
          $gte: sDate,
          $lte: eDate,
        },
      });
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
    .populate("createdBy")
    .select("-messages");

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
  if (req.body.group) {
    changes.push(`${user.name} updated group`);
  }
  if (req.body.taskStatus) {
    changes.push(`${user.name} updated Task Status`);
  }
  if (req.body.priority) {
    changes.push(`${user.name} updated Task Status`);
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
  let subTask = await taskModel.findById(id);
  if (subTask.parentTask) {
    let user = await userModel.findById(req.query.id);
    let newTaskLog = await taskLogModel.findOneAndUpdate(
      { taskId: subTask.parentTask },
      {
        $push: {
          updates: [
            {
              changes: [`${user.name} deleted subtask`],
            },
          ],
        },
      },
      { new: true }
    );
  }
  let deletedTask = await taskModel.deleteOne({ _id: id });

  if (!deletedTask) {
    return res.status(404).json({ message: "Couldn't delete!  not found!" });
  }

  res.status(200).json({ message: "Task deleted successfully!" });
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
  });
});

const getAllTasksByUserByWeek = catchAsync(async (req, res, next) => {
  const now = new Date();
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(now.getDate() - 90);

  const matchResults = await taskModel.find({
    $or: [{ createdBy: req.params.id }, { users: req.params.id }],
    createdAt: { $gte: ninetyDaysAgo, $lte: now },
  });

  const priorityCounts = matchResults.reduce((acc, task) => {
    const priority = task.priority; // Get the priority of the task
    if (!acc[priority]) {
      acc[priority] = 0; // Initialize count for this priority if it doesn't exist
    }
    acc[priority]++; // Increment the count for this priority
    return acc;
  }, {});

  const priorities = ["low", "normal", "high"];
  const results = priorities.map((priority) => ({
    priority,
    count: priorityCounts[priority] || 0,
  }));

  res.json({
    message: "Done",
    results,
    countAll: await taskModel.countDocuments({
      $or: [{ createdBy: req.params.id }, { users: req.params.id }],
      createdAt: { $gte: ninetyDaysAgo, $lte: now },
    }),
    countDone: await taskModel.countDocuments({
      $or: [{ createdBy: req.params.id }, { users: req.params.id }],
      createdAt: { $gte: ninetyDaysAgo, $lte: now },
      taskStatus: "Done",
    }),
    countCancel: await taskModel.countDocuments({
      $or: [{ createdBy: req.params.id }, { users: req.params.id }],
      createdAt: { $gte: ninetyDaysAgo, $lte: now },
      taskStatus: "Cancelled",
    }),
  });
});

const getAllTasksByUserByDay = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(
    taskModel
      .find({
        $and: [
          { $or: [{ createdBy: req.params.id }, { users: req.params.id }] },
          { priority: req.params.priority },
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

const updateTaskPush = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { users, resources, admins } = req.body;

  let updateAction = {};
  let changeLogMessage = "";

  if (users) {
    updateAction.$push = { users: users };
    changeLogMessage = "added users from task";
  } else if (resources) {
    updateAction.$push = { resources: resources };
    changeLogMessage = "added resources";
  } else if (admins) {
    updateAction.$push = { admins: admins };
    changeLogMessage = "added admin";
  } else {
    return res.status(404).json({ message: "Task not found!" });
  }

  let updatedTask = await taskModel.findOneAndUpdate(
    { _id: id },
    updateAction,
    { new: true }
  );

  if (!updatedTask) {
    return res.status(404).json({ message: "Task not found!" });
  }

  const user = await userModel.findById(req.query.id);

  // Log the changes
  await taskLogModel.findOneAndUpdate(
    { taskId: id },
    {
      $push: {
        updates: [
          {
            changes: [`${user.name} ${changeLogMessage}`],
          },
        ],
      },
    },
    { new: true }
  );

  res
    .status(200)
    .json({ message: `${changeLogMessage} successfully!`, updatedTask });
});
const updateTaskOnDelete = catchAsync(async (req, res, next) => {
  const { id, userId, resourcesId, adminId } = req.params;

  let updateAction = {};
  let changeLogMessage = "";

  if (userId) {
    updateAction.$pull = { users: userId };
    changeLogMessage = "deleted users from task";
  } else if (resourcesId) {
    updateAction.$pull = { resources: { _id: resourcesId } };
    changeLogMessage = "deleted resources";
  } else if (adminId) {
    updateAction.$pull = { admins: adminId };
    changeLogMessage = "removed admin";
  }
  // console.log(updateAction, changeLogMessage);

  let updatedTask = await taskModel.findOneAndUpdate(
    { _id: id },
    updateAction,
    { new: true }
  );

  if (!updatedTask) {
    return res.status(404).json({ message: "Task not found!" });
  }

  // If all users are deleted, revert the task to 'normal' type
  if (userId && updatedTask.users.length === 0) {
    updatedTask = await taskModel.findOneAndUpdate(
      { _id: id },
      { isShared: false, taskType: "normal" },
      { new: true }
    );
  }

  // Fetch the user who performed the action
  const user = await userModel.findById(req.query.id);

  // Log the changes
  await taskLogModel.findOneAndUpdate(
    { taskId: id },
    {
      $push: {
        updates: [
          {
            changes: [`${user.name} ${changeLogMessage}`],
          },
        ],
      },
    },
    { new: true }
  );

  res
    .status(200)
    .json({ message: `${changeLogMessage} successfully!`, updatedTask });
});

const deleteDocsTask = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  console.log(req.body.id);

  let deleteUserTask = await taskModel.findOneAndUpdate(
    { _id: id },
    { $pull: { documents: req.body.id } },
    { new: true }
  );
  removeFile("tasks", req.body.id);

  if (!deleteUserTask) {
    return res.status(404).json({ message: "tasks not found!" });
  }
  let user = await userModel.findById(req.query.id);
  let newTaskLog = await taskLogModel.findOneAndUpdate(
    { taskId: id },
    {
      $push: {
        updates: [
          {
            changes: [`${user.name} deleted Doucments`],
          },
        ],
      },
    },
    { new: true }
  );
  res
    .status(200)
    .json({ message: "Docs deleted successfully!", deleteUserTask });
});

export {
  createTask,
  getTaskById,
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
  getAnalyseTasksByUser,
  getAllTasksByUserByDay,
  deleteDocsTask,
  getAllTasksByUserByWeek,
  getCancelTasksByUser,
  getDoneTasksByUser,
  updateTaskOnDelete,
  updateTaskPush,
};
