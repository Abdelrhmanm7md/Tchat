import express from "express";
import * as transController from "./trans.controller.js";

const transRouter = express.Router();

transRouter.post("/", transController.createtrans);
transRouter.get("/", transController.getAlltrans);

export default transRouter;
