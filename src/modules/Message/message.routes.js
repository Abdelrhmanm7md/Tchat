import express from "express";
import * as messageController from "./message.controller.js";
import { uploadMixFile } from "../../utils/middleWare/fileUploads.js";

const messageRouter = express.Router();

messageRouter.post("/", messageController.createmessage);
messageRouter.get("/", messageController.getAllmessage);
messageRouter.get("/:id", messageController.getAllmessageByTask);

messageRouter.post(
  "/images",
  uploadMixFile("image", [
    { name: "docs", maxCount: 8 },
  ]),
  messageController.addPhotos
);

export default messageRouter;
