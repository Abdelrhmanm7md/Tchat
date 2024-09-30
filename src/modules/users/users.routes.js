import express from "express";

const usersRouter = express.Router();

import * as usersController from "./users.controller.js";
import {
  fileFilterHandlerForProfile,
  fileSizeLimitErrorHandler,
  uploadMixFile,
} from "../../utils/middleWare/fileUploads.js";
import {  protectRoutes } from "../auth/auth.controller.js";

usersRouter.get("/", usersController.getAllUsersByAdmin);
usersRouter.get("/:id", usersController.getUserById);
usersRouter.get("/sub/:id", usersController.getSubscriptionPeriod);
usersRouter.put("/:id", usersController.updateUser);
usersRouter.post("/email/:id", usersController.postMessage);
usersRouter.delete("/:id", usersController.deleteUser);
usersRouter.post("/contact", usersController.getContacts);


usersRouter.post(
  "/profile",
    protectRoutes,
  uploadMixFile("profilePic", [{ name: "profilePic" }],),
  fileFilterHandlerForProfile,
  fileSizeLimitErrorHandler,
  usersController.addPhotos
);
export default usersRouter;
