import express from "express";
import * as subController from "./sub.controller.js";

const subRouter = express.Router();

subRouter.get("/", subController.getAllSubs);
subRouter.post("/", subController.createSub);
subRouter.put("/:id", subController.editSub);
subRouter.delete("/:id", subController.deleteSub);

export default subRouter;
