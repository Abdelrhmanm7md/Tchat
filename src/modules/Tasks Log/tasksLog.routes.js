import express from "express";
const taskLogRouter = express.Router();

import * as taskLogController from "./tasksLog.controller.js";
import { fileSizeLimitErrorHandler, uploadMixFile } from "../../utils/middleWare/fileUploads.js";

taskLogRouter.get("/", taskLogController.getAllTaskByAdmin);
taskLogRouter.get("/user/:id", taskLogController.getAllTaskByUser);
taskLogRouter.post(
  "/",
  taskLogController.createTask
);
taskLogRouter.put("/update/users/:id", taskLogController.updateTask);
taskLogRouter.put("/:id", taskLogController.updateTask2);
taskLogRouter.put("/group/:id", taskLogController.updateTask3);

taskLogRouter.put(
  "/images/:id",
  uploadMixFile("tasks", [
    { name: "resources", },
    { name: "documments",  },
  ]),fileSizeLimitErrorHandler, 
  taskLogController.updateTaskPhoto
);
taskLogRouter.delete("/:id", taskLogController.deleteTask);
taskLogRouter.delete("/:id/user/:userId", taskLogController.deleteUserTask);


export default taskLogRouter;
