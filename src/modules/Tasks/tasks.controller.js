import { taskModel } from "../../../database/models/tasks.model.js";
import ApiFeature from "../../utils/apiFeature.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";

const createTask = catchAsync(async (req, res, next) => {
  if (req.body.users) {
    if (req.body.users.length > 1) {
      req.body.isShared = true;
      req.body.taskType = "shared";
    }
  }
  let newTask = new taskModel(req.body);
  let addedTask = await newTask.save();

  res.status(201).json({
    message: " Task has been created successfully!",
    addedTask,
  });
});

const getAllTaskByAdmin = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(taskModel.find().populate("users"), req.query)
    .pagination()
    .sort()
    .search();

  let results = await ApiFeat.mongooseQuery;
  results = JSON.stringify(results);
  results = JSON.parse(results);

  let { filterType, filterValue } = req.query;

  if (filterType && filterValue) {
    results = results.filter(function (item) {
      if (filterType == "title") {
        return item.title.toLowerCase().includes(filterValue);
      }
      if (filterType == "users") {
        return item.users[0].name.toLowerCase().includes(filterValue);
      }
      if (filterType == "taskType") {
        return item.taskType.toLowerCase().includes(filterValue);
      }
      if (filterType == "date") {
        return item.sDate == filterValue;
      }
      if (filterType == "date") {
        return item.eDate == filterValue;
      }
    });
  }

  res.json({
    message: "done",
    page: ApiFeat.page,
    count: await taskModel.countDocuments(),
    results,
  });
  if (!ApiFeat) {
    return res.status(404).json({
      message: "No Task was found!",
    });
  }
});
const getAllTaskByUser = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(
    taskModel.find({ users: req.params.id }).populate("users"),
    req.query
  )
    .pagination()
    .sort()
    .search();

  let results = await ApiFeat.mongooseQuery;
  results = JSON.stringify(results);
  results = JSON.parse(results);

  let { filterType, filterValue } = req.query;

  if (filterType && filterValue) {
    results = results.filter(function (item) {
      if (filterType == "title") {
        return item.title.toLowerCase().includes(filterValue);
      }
      if (filterType == "users") {
        return item.users[0].name.toLowerCase().includes(filterValue);
      }
      if (filterType == "taskType") {
        return item.taskType.toLowerCase().includes(filterValue);
      }
      if (filterType == "date") {
        return item.sDate == filterValue;
      }
      if (filterType == "date") {
        return item.eDate == filterValue;
      }
    });
  }

  res.json({
    message: "done",
    page: ApiFeat.page,
    count: await taskModel.countDocuments({ users: req.params.id }),
    results,
  });
  if (!ApiFeat) {
    return res.status(404).json({
      message: "No Task was found!",
    });
  }
});
const getAllTaskByUserShared = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(
    taskModel
      .find({
        $and: [
          { users: req.params.id },
          { taskType: "shared" },
          { isShared: true },
        ],
      })
      .populate("users"),
    req.query
  )
    .pagination()
    .sort()
    .search();

  let results = await ApiFeat.mongooseQuery;
  results = JSON.stringify(results);
  results = JSON.parse(results);
  let { filterType, filterValue } = req.query;

  if (filterType && filterValue) {
    results = results.filter(function (item) {
      if (filterType == "title") {
        return item.title.toLowerCase().includes(filterValue);
      }
      if (filterType == "users") {
        return item.users[0].name.toLowerCase().includes(filterValue);
      }
      if (filterType == "taskType") {
        return item.taskType.toLowerCase().includes(filterValue);
      }
      if (filterType == "date") {
        return item.sDate == filterValue;
      }
      if (filterType == "date") {
        return item.eDate == filterValue;
      }
    });
  }

  res.json({
    message: "done",
    page: ApiFeat.page,
    count: await taskModel.countDocuments({
      $and: [
        { users: req.params.id },
        { taskType: "shared" },
        { isShared: true },
      ],
    }),
    results,
  });
  if (!ApiFeat) {
    return res.status(404).json({
      message: "No Task was found!",
    });
  }
});
const getAllTaskByUserNormal = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(
    taskModel
      .find({
        $and: [
          { users: req.params.id },
          { taskType: "normal" },
          { isShared: false },
        ],
      })
      .populate("users"),
    req.query
  )
    .pagination()
    .sort()
    .search();

  let results = await ApiFeat.mongooseQuery;
  results = JSON.stringify(results);
  results = JSON.parse(results);
  let { filterType, filterValue } = req.query;

  if (filterType && filterValue) {
    results = results.filter(function (item) {
      if (filterType == "title") {
        return item.title.toLowerCase().includes(filterValue);
      }
      if (filterType == "users") {
        return item.users[0].name.toLowerCase().includes(filterValue);
      }
      if (filterType == "taskType") {
        return item.taskType.toLowerCase().includes(filterValue);
      }
      if (filterType == "date") {
        return item.sDate == filterValue;
      }
      if (filterType == "date") {
        return item.eDate == filterValue;
      }
    });
  }

  res.json({
    message: "done",
    page: ApiFeat.page,
    count: await taskModel.countDocuments({
      $and: [
        { users: req.params.id },
        { taskType: "shared" },
        { isShared: true },
      ],
    }),
    results,
  });
  if (!ApiFeat) {
    return res.status(404).json({
      message: "No Task was found!",
    });
  }
});

const getTaskById = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  let Task = await taskModel.findById(id);

  if (!Task) {
    return res.status(404).json({ message: "Task not found!" });
  }

  res.status(200).json({ Task });
});
const updateTaskPhoto = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  let resources = "";
  let documments = "";
  if (req.body.documments || req.body.resources) {
    req.body.documments = req.files.documments && req.files.documments.map(
(file) => `https://tchatpro.com/tasks/${file.filename.split(" ").join("")}`
    );
    req.body.resources =  req.files.resources && req.files.resources.map(
(file) => `https://tchatpro.com/tasks/${file.filename.split(" ").join("")}`
    );

    if (req.body.documments) {
      documments = req.body.documments;
    }
    if (req.body.resources) {
      resources = req.body.resources;
    }
  }
  let updatedTask = await taskModel.findByIdAndUpdate(
    id,
    { $push: { documments: documments, resources: resources } },
    { new: true }
  );

  if (!updatedTask) {
    return res.status(404).json({ message: "Couldn't update!  not found!" });
  }

  res.status(200).json({ message: "Task updated successfully!", updatedTask });
});
const updateTask = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  if (req.body.users) {
    if (req.body.users.length > 1) {
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

  res.status(200).json({ message: "Task updated successfully!", updatedTask });
});
const deleteTask = catchAsync(async (req, res, next) => {
  let { id } = req.params;

  let deletedTask = await taskModel.findByIdAndDelete({ _id: id });

  if (!deletedTask) {
    return res.status(404).json({ message: "Couldn't delete!  not found!" });
  }

  res.status(200).json({ message: "Task deleted successfully!" });
});

const addPhotos = catchAsync(async (req, res, next) => {
  let resources = "";
  let documments = "";
  req.body.documments =
    req.files.documments &&
    req.files.documments.map(
      (file) => `https://tchatpro.com/tasks/${file.filename.split(" ").join("")}`
    );
    req.body.resources =
    req.files.resources &&
    req.files.resources.map(
      (file) => file.originalname.split(" ").join("") );
  req.body.resources =
    req.files.resources &&
    req.files.resources.map(
      (file) => `https://tchatpro.com/tasks/${file.filename.split(" ").join("")}`
    );

  // console.log(req.body.documments);
  // console.log(req.body.resources);

  if (req.body.documments) {
    documments = req.body.documments;
  }
  if (req.body.resources) {
    resources = req.body.resources;
  }

  res.status(200).json({
    message: "Photo created successfully!",
    documments,
    resources,
  });
});

export {
  createTask,
  getAllTaskByAdmin,
  getTaskById,
  updateTask,
  deleteTask,
  getAllTaskByUser,
  addPhotos,
  updateTaskPhoto,
  getAllTaskByUserShared,
  getAllTaskByUserNormal,
};
