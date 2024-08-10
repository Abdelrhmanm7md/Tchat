import express from "express";
import * as GroupController from "./group.controller.js";

const groupRouter = express.Router();

groupRouter.get("/", GroupController.getAllGroups);
groupRouter.get("/user/:id", GroupController.getAllGroupsByUser);
groupRouter.post("/", GroupController.createGroup);
groupRouter.put("/:id", GroupController.editGroup);
groupRouter.delete("/:id", GroupController.deleteGroup);

export default groupRouter;
