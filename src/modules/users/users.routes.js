import express from "express";
const usersRouter = express.Router();

import * as usersController from "./users.controller.js";
import { uploadMixFile, uploadSingleFile } from "../../utils/middleWare/fileUploads.js";

usersRouter.get("/", usersController.getAllUsersByAdmin);
usersRouter.get("/:id", usersController.getUserById);
usersRouter.put("/:id", usersController.updateUser);
usersRouter.delete("/:id", usersController.deleteUser);
// usersRouter.post(
//   "/image",
//   uploadSingleFile("profilePic", "profilePic"),
//   usersController.addPhoto
// );
usersRouter.post(
  "/image",
  uploadMixFile("profilePic", [
    { name: "profilePic", maxCount: 1},
  ]),
  usersController.addPhotos
);
export default usersRouter;
