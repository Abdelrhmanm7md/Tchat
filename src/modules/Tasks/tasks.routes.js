import express from "express";
const taskRouter = express.Router();

import * as taskController from "./tasks.controller.js";
import {
  fileSizeLimitErrorHandler,
  subscriptionType,
  uploadMixFile,
} from "../../utils/middleWare/fileUploads.js";
import { protectRoutes } from "../auth/auth.controller.js";

taskRouter.get("/", taskController.getAllTaskByAdmin);
taskRouter.get("/user/:id", taskController.getAllTaskByUser);
taskRouter.get("/user/shared/:id", taskController.getAllTaskByUserShared);
taskRouter.get("/user/norm/:id", taskController.getAllTaskByUserNormal);
taskRouter.get("/:id", taskController.getTaskById);
taskRouter.get("/sub/:id", taskController.getAllSubTaskByUser);
taskRouter.get("/people/:id", taskController.getAllPeopleTask);
taskRouter.get("/docs/:id", taskController.getAllDocsTask);
taskRouter.get("/res/:id", taskController.getAllResTask);
taskRouter.get("/analytics/", taskController.getAllTasksByAdmin);
taskRouter.get("/analytics/done/", taskController.getDoneTasksByAdmin);
taskRouter.get("/analytics/cancel/", taskController.getCancelTasksByAdmin);
taskRouter.get("/analytics/done/:id", taskController.getDoneTasksByUser);
taskRouter.get("/analytics/cancel/:id", taskController.getCancelTasksByUser);
taskRouter.get("/analytics/inprogress/",taskController.getInProgressTasksByAdmin);
taskRouter.get("/analytics/count/:id", taskController.getAnalyseTasksByUser);
taskRouter.get("/analytics/day/:id/:date",taskController.getAllTasksByUserByDay);
taskRouter.get("/analytics/day/:date", taskController.getAllTasksByAdminByDay);
taskRouter.get("/analytics/week/", taskController.getAllTasksByAdminByWeek);
taskRouter.get("/analytics/week/:id", taskController.getAllTasksByUserByWeek);

taskRouter.post("/", taskController.createTask);

taskRouter.put("/update/users/:id", taskController.updateTask);
taskRouter.put("/:id", taskController.updateTask2);
taskRouter.put("/resources/:id", taskController.updateTask4);
taskRouter.put(
  "/docs/:id",
  protectRoutes,
  subscriptionType
  ,
  uploadMixFile("tasks", [{ name: "documents" }]),
  fileSizeLimitErrorHandler,
  taskController.updateTaskPhoto
);

taskRouter.delete("/:id", taskController.deleteTask);
taskRouter.delete("/:id/user/:userId", taskController.deleteUserTask);
taskRouter.delete("/:id/resources/:resourcesId",taskController.deleteresourcesTask);
taskRouter.delete("/:id/docs",taskController.deleteDocsTask);

export default taskRouter;
