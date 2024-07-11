import express from "express";
const usersRouter = express.Router();

import * as usersController from "./users.controller.js";
import { uploadSingleFile } from "../../utils/middleWare/fileUploads.js";

usersRouter.get("/", usersController.getAllUsersByAdmin);
usersRouter.get("/:id", usersController.getUserById);
usersRouter.put("/:id", usersController.updateUser);
usersRouter.delete("/:id", usersController.deleteUser);
usersRouter.post(
  "/image",
  uploadSingleFile("profilePic", "profilePic"),
  usersController.addPhoto
);

export default usersRouter;
