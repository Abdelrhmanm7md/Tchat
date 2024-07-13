import express from "express";
const taskRouter = express.Router();

import * as taskController from "./tasks.controller.js";
import { uploadMixFile } from "../../utils/middleWare/fileUploads.js";

taskRouter.get("/", taskController.getAllTaskByAdmin);
taskRouter.get("/user/:id", taskController.getAllTaskByUser);
taskRouter.get("/user/shared/:id", taskController.getAllTaskByUserShared);
taskRouter.get("/user/norm/:id", taskController.getAllTaskByUserNormal);
taskRouter.get("/:id", taskController.getTaskById);
taskRouter.post(
  "/",
  taskController.createTask
);
taskRouter.put("/:id", taskController.updateTask);
taskRouter.delete("/:id", taskController.deleteTask);

taskRouter.post(
  "/images",
  uploadMixFile("tasks", [
    { name: "resources", maxCount: 8 },
    { name: "documments", maxCount: 8 },
  ]),
  taskController.addPhotos
);
taskRouter.put(
  "/images",
  uploadMixFile("tasks", [
    { name: "resources", maxCount: 8 },
    { name: "documments", maxCount: 8 },
  ]),
  taskController.updateTaskPhoto
);

export default taskRouter;
