import { taskModel } from "../../../database/models/tasks.model.js";
import ApiFeature from "../../utils/apiFeature.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";
import fsExtra from "fs-extra";
import path from "path";

const createTask = catchAsync(async (req, res, next) => {
  if (req.body.users) {
    if (req.body.users.length >= 1) {
      req.body.isShared = true;
      req.body.taskType = "shared";
    }
  }
  req.body.users = [];  
  let newTask = new taskModel(req.body);
  let addedTask = await newTask.save();

  res.status(201).json({
    message: " Task has been created successfully!",
    addedTask,
  });
});

const getAllTaskByAdmin = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(taskModel.find().populate("users").populate("createdBy").sort({ $natural: -1 }), req.query).pagination()

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
        return item.taskStatus.toLowerCase().includes(filterValue.toLowerCase());
      }
      if (filterType == "isCompleted") {
        return item.isCompleted.toString().includes(filterValue.toLowerCase())
      }
      if (filterType == "date") {        
        return item.eDate.includes(filterValue)
      }
      if (filterType == "taskType") {
        return item.taskType.toLowerCase().includes(filterValue.toLowerCase());
      }
      if (filterType == "users") {
        if(item.users[0]){
          return item.users[0].name.toLowerCase().includes(filterValue.toLowerCase());
        }      }
    });
  }
  if (filterType == "sort") {
    let filter = await taskModel.find()      
    results = filter  
  }
  res.json({
    message: "done",
    page: ApiFeat.page,
    count: await taskModel.countDocuments(),
    results,
  });

});
const getAllTaskByUser = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(
    taskModel.find({ $or: [{ createdBy: req.params.id }, { users: req.params.id }] }).populate("users").populate("createdBy"),
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
    if(filterType=='taskStatus'){
      let filter = await taskModel.find({
        $and: [
          { taskStatus: filterValue.toLowerCase() },
          { eDate: filterDate },
        ]
      })
      results = filter  
    }
    if(filterType=='priority'){
      let filter = await taskModel.find({
        $and: [
          { priority: filterValue.toLowerCase() },
          { eDate: filterDate },
        ]
      })
      results = filter  
    }
  }
if (filterType && filterValue) {
  results = results.filter(function (item) {
    if (filterType == "taskStatus") {
      return item.taskStatus.toLowerCase().includes(filterValue.toLowerCase());
    }
    if (filterType == "date") {        
      return item.eDate.includes(filterValue)
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
    message: "done",
    results,
  });
});

const getAllSubTaskByUser = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(
    taskModel.find({ parentTask: req.params.id }).populate("users").populate("createdBy"),
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
    message: "done",
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
    message: "done",
    results : results.users,
  });
});
const getAllDocsTask = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(
    taskModel.findById(req.params.id),
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
      let documments = []
      if(results.documments){
        documments = results.documments
      }
    
  res.json({
    message: "done",
    documments,
  });
});
const getAllResTask = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(
    taskModel.findById(req.params.id),
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
      let resources = []
      if(results.resources){
        resources = results.resources
      }
    
  res.json({
    message: "done",
    resources
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
      .populate("createdBy").populate("users").populate("users.createdBy"),
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
  ]
  if ((filterType && filterValue) || filterDate) {
  if(filterType=='taskStatus'){
    filter.push({ taskStatus: filterValue }) 
  }
  if(filterType=='priority'){
    filter.push({ priority: filterValue }) 
  }
  if (filterType == "date") {        
    filter.push({ eDate: filterValue }) 
  }
  if(filterDate){
    filter.push({ eDate: filterDate })
  }
  let query = await taskModel.find({
    $and: filter

  })
  
  results = query 
}
  res.json({
    message: "done",
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
      .populate("createdBy").populate("users"),
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
  ]
  let { filterType, filterValue, filterDate } = req.query;
  
  if ((filterType && filterValue) || filterDate) {
    if(filterType=='taskStatus'){
      filter.push({ taskStatus: filterValue }) 
    }
    if(filterType=='priority'){
      filter.push({ priority: filterValue }) 
    }
    if (filterType == "date") {        
      filter.push({ eDate: filterValue }) 
    }
    if(filterDate)  {
      filter.push({ eDate: filterDate })
    }
    let query = await taskModel.find({
    $and: filter
    })
    results = query 
  }

  res.json({
    message: "done",
    results,
  });
});

const getTaskById = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  let results = await taskModel.findById(id).populate("users").populate("createdBy");

  if (!results) {
    return res.status(404).json({ message: "Task not found!" });
  }

  res.json({
    message: "done",
    results,
  });});
const updateTaskPhoto = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  let resources = "";
  let documments = "";
  if (req.files.documments || req.files.resources) {
    req.body.documments =
      req.files.documments &&
      req.files.documments.map(
        (file) =>
          `https://tchatpro.com/tasks/${file.filename.split(" ").join("")}`
      );

    req.body.resources =
      req.files.resources &&
      req.files.resources.map(
        (file) =>
          `https://tchatpro.com/tasks/${file.filename.split(" ").join("")}`
      );

    const directoryPath = path.join(resources, "uploads/tasks");

    fsExtra.readdir(directoryPath, (err, files) => {
      if (err) {
        return console.error("Unable to scan directory: " + err);
      }

      files.forEach((file) => {
        const oldPath = path.join(directoryPath, file);
        const newPath = path.join(directoryPath, file.replace(/\s+/g, ""));

        fsExtra.rename(oldPath, newPath, (err) => {
          if (err) {
            console.error("Error renaming file: ", err);
          }
        });
      });
    });
    const directoryPathh = path.join(documments, "uploads/tasks");

    fsExtra.readdir(directoryPathh, (err, files) => {
      if (err) {
        return console.error("Unable to scan directory: " + err);
      }

      files.forEach((file) => {
        const oldPath = path.join(directoryPathh, file);
        const newPath = path.join(directoryPathh, file.replace(/\s+/g, ""));

        fsExtra.rename(oldPath, newPath, (err) => {
          if (err) {
            console.error("Error renaming file: ", err);
          }
        });
      });
    });

    if (req.body.documments !== "") {
      documments = req.body.documments;
    }
    if (req.body.resources !== "") {
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

  res.status(200).json({ message: "Task updated successfully!",  documments, resources });
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

  res.status(200).json({ message: "Task updated successfully!", updatedTask });
});
const updateTask3 = catchAsync(async (req, res, next) => {
  let { id } = req.params;

  let updatedTask = await taskModel.findByIdAndUpdate(
    id,
    {  $push: { group: req.body.group } },
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


// Admin
const getAllTasksByAdmin  = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(taskModel.find({}), req.query)
    .sort()
    .search();
  let results = await ApiFeat.mongooseQuery;
  if (!ApiFeat || !results) {
    return res.status(404).json({
      message: "No Task was found!",
    });
  }
  res.json({
    message: "done",
    count: await taskModel.countDocuments(),
    });

});
const getCancelTasksByAdmin  = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(taskModel.find({taskStatus:"Cancelled"}), req.query)
    .sort()
    .search();
  let results = await ApiFeat.mongooseQuery;
  if (!ApiFeat || !results) {
    return res.status(404).json({
      message: "No Task was found!",
    });
  }
  res.json({
    message: "done",
    count: await taskModel.countDocuments({taskStatus:"Cancelled"}),
    });

});
const getDoneTasksByAdmin  = catchAsync(async (req, res, next) => {
  // console.log(req.params.id,"dddd");
  
  let ApiFeat = new ApiFeature(taskModel.find({taskStatus:"Done"}).populate("users").populate("createdBy"), req.query)
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
    message: "done",
    results,
    count: await taskModel.countDocuments({taskStatus:"Done"}),
    });

});
const getInProgressTasksByAdmin  = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(taskModel.find({taskStatus:"InProgress"}), req.query)
    .sort()
    .search();
  let results = await ApiFeat.mongooseQuery;
  if (!ApiFeat || !results) {
    return res.status(404).json({
      message: "No Task was found!",
    });
  }
  res.json({
    message: "done",
    count: await taskModel.countDocuments({taskStatus:"InProgress"}),
    });

  });
    ///////////////////////////////////////\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
    
// User

    const getAllTasksByUser  = catchAsync(async (req, res, next) => {
      let ApiFeat = new ApiFeature(taskModel.find(
            { $or: [{ createdBy: req.params.id }, { users: req.params.id }]  },
        ), req.query)
        .sort()
        .search();
      let results = await ApiFeat.mongooseQuery;
      if (!ApiFeat || !results) {
        return res.status(404).json({
          message: "No Task was found!",
        });
      }
      res.json({
        message: "done",
        count: await taskModel.countDocuments({
          $and: [
            { $or: [{ createdBy: req.params.id }, { users: req.params.id }] }
            ,{parentTask:null}
          ],
        })
        });
    
    });
    const getCancelTasksByUser  = catchAsync(async (req, res, next) => {
      let ApiFeat = new ApiFeature(taskModel
        .find({
          $and: [
            { $or: [{ createdBy: req.params.id }, { users: req.params.id }] },
            {taskStatus:"Cancelled"},{parentTask:null}
          ],
        }), req.query)
        .sort()
        .search();
      let results = await ApiFeat.mongooseQuery;
      if (!ApiFeat || !results) {
        return res.status(404).json({
          message: "No Task was found!",
        });
      }
      res.json({
        message: "done",
        count: await taskModel.countDocuments({
          $and: [
            { $or: [{ createdBy: req.params.id }, { users: req.params.id }] },
            {taskStatus:"Cancelled"},{parentTask:null}
          ],
        }),
        });
    
    });
    const getDoneTasksByUser  = catchAsync(async (req, res, next) => {
      let ApiFeat = new ApiFeature(taskModel
        .find({
          $and: [
            { $or: [{ createdBy: req.params.id }, { users: req.params.id }] },
            {taskStatus:"Done"},{parentTask:null}
          ],
        }).populate("users").populate("createdBy"), req.query)
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
        message: "done",
        results,
        count: await taskModel.countDocuments({
          $and: [
            { $or: [{ createdBy: req.params.id }, { users: req.params.id }] },
            {taskStatus:"Done"},{parentTask:null}
          ],
        }),
        });
    
    });
    const getInProgressTasksByUser = catchAsync(async (req, res, next) => {
      let ApiFeat = new ApiFeature(taskModel
        .find({
          $and: [
            { $or: [{ createdBy: req.params.id }, { users: req.params.id }] },
            {taskStatus:"InProgress"},{parentTask:null}
          ],
        }), req.query)
        .sort()
        .search();
      let results = await ApiFeat.mongooseQuery;
      if (!ApiFeat || !results) {
        return res.status(404).json({
          message: "No Task was found!",
        });
      }
      res.json({
        message: "done",
        count: await taskModel.countDocuments({
          $and: [
            { $or: [{ createdBy: req.params.id }, { users: req.params.id }] },
            {taskStatus:"InProgress"},{parentTask:null}
          ],
        }),
        });
    });

    const deleteUserTask = catchAsync(async (req, res, next) => {
      let { id,userId } = req.params;
    
      let deleteUserTask = await taskModel.findOneAndUpdate(
        { _id: id },
        { $pull: { users:  userId  } },
        { new: true }  );  
      if (!deleteUserTask) {
        return res.status(404).json({ message: "tasks not found!" });
      }
      if(deleteUserTask.users.length == 0){
        deleteUserTask = await taskModel.findOneAndUpdate(
          { _id: id },
          { isShared: false, taskType: "normal"},
          { new: true }  );
      }
      
      res.status(200).json({ message: "user deleted successfully!", deleteUserTask });
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
  getAllTasksByUser,
  getCancelTasksByUser,
  getInProgressTasksByUser,
  getDoneTasksByUser,
  deleteUserTask,
  updateTask3,
};
