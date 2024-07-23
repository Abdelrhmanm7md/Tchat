import express from "express";
const taskRouter = express.Router();

import * as taskController from "./tasks.controller.js";
import { fileSizeLimitErrorHandler, uploadMixFile } from "../../utils/middleWare/fileUploads.js";

taskRouter.get("/", taskController.getAllTaskByAdmin);
taskRouter.get("/user/:id", taskController.getAllTaskByUser);
taskRouter.get("/user/shared/:id", taskController.getAllTaskByUserShared);
taskRouter.get("/user/norm/:id", taskController.getAllTaskByUserNormal);
taskRouter.get("/:id", taskController.getTaskById);
taskRouter.get("/sub/:id", taskController.getAllSubTaskByUser);
taskRouter.get("/people/:id", taskController.getAllPeopleTask);
taskRouter.get("/docs/:id", taskController.getAllDocsTask);
taskRouter.post(
  "/",
  taskController.createTask
);
taskRouter.put("/update/users/:id", taskController.updateTask);
taskRouter.put("/:id", taskController.updateTask2);
taskRouter.delete("/:id", taskController.deleteTask);

taskRouter.put(
  "/images/:id",
  uploadMixFile("tasks", [
    { name: "resources", maxCount: 8 },
    { name: "documments", maxCount: 8 },
  ]),fileSizeLimitErrorHandler, 
  taskController.updateTaskPhoto
);

export default taskRouter;
