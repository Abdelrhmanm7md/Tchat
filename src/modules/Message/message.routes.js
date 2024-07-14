import express from "express";
import * as messageController from "./message.controller.js";

const messageRouter = express.Router();

messageRouter.post("/", messageController.createmessage);
messageRouter.get("/", messageController.getAllmessage);
messageRouter.post(
  "/image",
  uploadSingleFile("image", "image"),
  messageController.addPhoto
);


export default messageRouter;
