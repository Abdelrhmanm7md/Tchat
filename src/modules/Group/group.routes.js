import express from "express";
import * as GroupController from "./group.controller.js";

const groupRouter = express.Router();

groupRouter.get("/", GroupController.getAllGroupsByAdmin);
groupRouter.get("/user/:id", GroupController.getAllGroupsByUser);
groupRouter.get("/task/:id", GroupController.getAllTasksByGroup);
groupRouter.post("/", GroupController.createGroup);
groupRouter.put("/:id", GroupController.editGroup);
groupRouter.delete("/:id", GroupController.deleteGroup);
groupRouter.delete("/:id/task/:groupId", GroupController.deleteTaskGroup);

export default groupRouter;
