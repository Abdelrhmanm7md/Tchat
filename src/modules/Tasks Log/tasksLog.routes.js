import express from "express";
const taskLogRouter = express.Router();

import * as taskLogController from "./tasksLog.controller.js";

taskLogRouter.get("/", taskLogController.getAllTaskLogByAdmin);
taskLogRouter.get("/task/:id", taskLogController.getAllTaskLogByTask);



export default taskLogRouter;
