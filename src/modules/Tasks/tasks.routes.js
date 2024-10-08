import express from "express";
const taskRouter = express.Router();

import * as taskController from "./tasks.controller.js";
import * as taskAdminController from "./tasksAdmin.controller.js";
import {
  fileFilterHandler,
  fileSizeLimitErrorHandler,
  uploadMixFile,
} from "../../utils/middleWare/fileUploads.js";
import { protectRoutes } from "../auth/auth.controller.js";

taskRouter.get("/", taskAdminController.getAllTaskByAdmin);
taskRouter.get("/analytics/", taskAdminController.getAllTasksByAdmin);
taskRouter.get("/analytics/done/", taskAdminController.getDoneTasksByAdmin);
taskRouter.get("/analytics/cancel/", taskAdminController.getCancelTasksByAdmin);
taskRouter.get("/analytics/inprogress/",taskAdminController.getInProgressTasksByAdmin);
taskRouter.get("/analytics/day/:priority", taskAdminController.getAllTasksByAdminByDay);
taskRouter.get("/analytics/week/", taskAdminController.getAllTasksByAdminByWeek);

taskRouter.get("/user/:id", taskController.getAllTaskByUser);
taskRouter.get("/user/shared/:id", taskController.getAllTaskByUserShared);
taskRouter.get("/user/norm/:id", taskController.getAllTaskByUserNormal);
taskRouter.get("/:id", taskController.getTaskById);
taskRouter.get("/users/:id", taskController.getAllMembersTask);
taskRouter.get("/sub/:id", taskController.getAllSubTaskByUser);
taskRouter.get("/people/:id", taskController.getAllPeopleTask);
taskRouter.get("/docs/:id", taskController.getAllDocsTask);
taskRouter.get("/res/:id", taskController.getAllResTask);
taskRouter.get("/analytics/done/:id", taskController.getDoneTasksByUser);
taskRouter.get("/analytics/cancel/:id", taskController.getCancelTasksByUser);
taskRouter.get("/analytics/count/:id", taskController.getAnalyseTasksByUser);
taskRouter.get("/analytics/day/:id/:priority",taskController.getAllTasksByUserByDay);
taskRouter.get("/analytics/week/:id", taskController.getAllTasksByUserByWeek);
// taskRouter.get("/ttttt", taskController.updateTask22222);

taskRouter.post("/", taskController.createTask);

taskRouter.put("/:id", taskController.updateTask2);
taskRouter.put("/update/:id", taskController.updateTaskPush);
taskRouter.put(
  "/docs/:id",
  protectRoutes,
  uploadMixFile("tasks", [{ name: "documents" }]),
  fileSizeLimitErrorHandler,
  fileFilterHandler,
  taskController.updateTaskPhoto
);

taskRouter.delete("/:id", taskController.deleteTask);
taskRouter.delete("/:id/user/:userId", taskController.updateTaskOnDelete);
taskRouter.delete("/:id/admin/:adminId", taskController.updateTaskOnDelete);
taskRouter.delete("/:id/resources/:resourcesId",taskController.updateTaskOnDelete);
taskRouter.delete("/:id/docs",taskController.deleteDocsTask);

export default taskRouter;
