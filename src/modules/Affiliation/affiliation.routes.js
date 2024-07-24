import express from "express";
import * as affController from "./affiliation.controller.js";

const affRouter = express.Router();

affRouter.get("/:id", affController.getAllAffs);
affRouter.post("/", affController.createAff);
affRouter.put("/:id", affController.editAff);
affRouter.put("/ref/:id", affController.editAffReferrals);
affRouter.delete("/:id", affController.deleteAff);

export default affRouter;
