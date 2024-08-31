import express from "express";

const usersRouter = express.Router();
const app = express();

import * as usersController from "./users.controller.js";
import {
  fileFilterHandler,
  fileSizeLimitErrorHandler,
  subscriptionType,
  uploadMixFile,
} from "../../utils/middleWare/fileUploads.js";
import {  protectRoutes } from "../auth/auth.controller.js";

usersRouter.get("/", usersController.getAllUsersByAdmin);
usersRouter.get("/:id", usersController.getUserById);
usersRouter.put("/:id", usersController.updateUser);
usersRouter.post("/email/:id", usersController.postMessage);
usersRouter.delete("/:id", usersController.deleteUser);
usersRouter.post("/contact", usersController.getContacts);


usersRouter.post(
  "/profile",
    // protectRoutes,
    // subscriptionType,
  uploadMixFile("profilePic", [{ name: "profilePic" }],),
  fileFilterHandler,
  fileSizeLimitErrorHandler,
  usersController.addPhotos
);
export default usersRouter;
