import express from "express";
import * as affController from "./affiliation.controller.js";

const affRouter = express.Router();

affRouter.get("/", affController.getAllAffs);
affRouter.post("/", affController.createAff);
affRouter.put("/:id", affController.editAff);
affRouter.delete("/:id", affController.deleteAff);

export default affRouter;
