import { taskModel } from "../../../database/models/tasks.model.js";
import ApiFeature from "../../utils/apiFeature.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";


const createTask = catchAsync(async (req, res, next) => {
  let newTask = new taskModel(req.body);
  let addedTask = await newTask.save();
  console.log(req.body);

  res.status(201).json({
    message: " Task has been created successfully!",
    addedTask
  });
});


const getAllTaskByAdmin = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(taskModel.find(), req.query)
    .pagination()
    .filter()
    .sort()
    .search()
    .fields();

  let results = await ApiFeat.mongooseQuery;
  res.json({ message: "done", page: ApiFeat.page,count: await taskModel.countDocuments(),
  results });
  if (!ApiFeat) {
    return res.status(404).json({
      message: "No Task was found!",
    });
  }

});
const getAllTaskByUser = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(taskModel.find({ users: [req.params.id] }), req.query)
    .pagination()
    .filter()
    .sort()
    .search()

  let results = await ApiFeat.mongooseQuery;
  res.json({ message: "done", page: ApiFeat.page,count: await taskModel.countDocuments({ users: [req.params.id] }),
  results });
  if (!ApiFeat) {
    return res.status(404).json({
      message: "No Task was found!",
    });
  }

});
const getAllTaskByUserShared = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(taskModel.find(  { $and: [{ users: [req.params.id] }, { taskType: 'shared' }] }), req.query)
    .pagination()
    .filter()
    .sort()
    .search()

  let results = await ApiFeat.mongooseQuery;
  res.json({ message: "done", page: ApiFeat.page,count: await taskModel.countDocuments(  { $and: [{ users: [req.params.id] }, { taskType: 'shared' }] }),
  results });
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
if (req.body.documments || req.body.resources) {
  let resources = "";
  let documments = "";
  req.body.documments = req.files.documments.map((file) => `${process.env.BASE_URL}tasks/${file.filename}`);
  req.body.resources = req.files.resources.map((file) => `${process.env.BASE_URL}tasks/${file.filename}`);

console.log(req.body.documments);
console.log(req.body.resources);

  if (req.body.documments) {
    documments = req.body.documments;
  }
  if (req.body.resources) {
    resources = req.body.resources;
  }
}
  let updatedTask = await taskModel.findByIdAndUpdate(
    id,
    { $push: { documments: documments, resources: resources, } },
    { new: true }
  );

  if (!updatedTask) {
    return res
      .status(404)
      .json({ message: "Couldn't update!  not found!" });
  }

  res.status(200).json({ message: "Task updated successfully!",updatedTask });
});
const updateTask = catchAsync(async (req, res, next) => {
  let { id } = req.params;

  let updatedTask = await taskModel.findByIdAndUpdate(
    id,
    req.body,
    { new: true }
  );

  if (!updatedTask) {
    return res
      .status(404)
      .json({ message: "Couldn't update!  not found!" });
  }

  res.status(200).json({ message: "Task updated successfully!",updatedTask });
});
const deleteTask = catchAsync(async (req, res, next) => {
  let { id } = req.params;

  let deletedTask = await taskModel.findByIdAndDelete({_id:id});

  if (!deletedTask) {
    return res
      .status(404)
      .json({ message: "Couldn't delete!  not found!" });
  }

  res.status(200).json({ message: "Task deleted successfully!" });
});

const addPhotos = catchAsync(async (req, res, next) => {
  let resources = "";
  let documments = "";
  req.body.documments = req.files.documments.map((file) => `${process.env.BASE_URL}tasks/${file.filename}`);
  req.body.resources = req.files.resources.map((file) => `${process.env.BASE_URL}tasks/${file.filename}`);

console.log(req.body.documments);
console.log(req.body.resources);

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

// const searchTask = catchAsync(async (req, res, next) => {
//   let { TaskTitle } = req.params;
//   console.log(req.query.p);
//   const page = req.query.p - 1 || 0;
//   const numOfTaskPerPage = req.query.n || 5;
//   let Task = await taskModel
//     .find({ jobTitle: { $regex: `${TaskTitle}`, $options: "i" } })
//     .skip(page * numOfTaskPerPage)
//     .limit(numOfTaskPerPage);
//   if (!Task) {
//     return res.status(404).json({
//       message: "No Task was found!",
//       s,
//     });
//   }

//   res.status(200).json({ Task });
// });



export { createTask, getAllTaskByAdmin, getTaskById, updateTask, deleteTask ,getAllTaskByUser,addPhotos,updateTaskPhoto,getAllTaskByUserShared };
