import express from "express";
const taskLogRouter = express.Router();

import * as taskLogController from "./tasksLog.controller.js";

taskLogRouter.get("/", taskLogController.getAllTaskLogByAdmin);
taskLogRouter.get("/task/:id", taskLogController.getAllTaskLogByTask);
taskLogRouter.delete("/:id", taskLogController.deleteTask);
taskLogRouter.delete("/:id/user/:userId", taskLogController.deleteUserTask);


export default taskLogRouter;
