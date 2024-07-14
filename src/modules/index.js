import { messageModel } from "../../database/models/message.model.js";
import AppError from "../utils/appError.js";
import affRouter from "./Affiliation/affiliation.routes.js";
import notiticationRouter from "./Notification/notification.routes.js";
import subRouter from "./Subscription/sub.routes.js";
import taskRouter from "./Tasks/tasks.routes.js";
import transRouter from "./Transaction/trans.routes.js";
import authRouter from "./auth/auth.routes.js";
import usersRouter from "./users/users.routes.js";

export function init(app) {
  app.use("/users", usersRouter);
  app.use("/auth", authRouter);
  app.use("/task", taskRouter);
  app.use("/notification", notiticationRouter);
  app.use("/sub", subRouter);
  app.use("/message", messageModel);
  app.use("/aff", affRouter);
  app.use("/trans", transRouter);

  app.use("/", (req, res, next) => {
    res.send("hello world");
  });

  app.all("*", (req, res, next) => {
    next(new AppError(`Not Found `, 404));
  });

  // app.use((err, req, res, next) => {
  //   res
  //     .status(err.statusCode)
  //     .json({ message: err.message, statusCode: err.statusCode });
  // });
}
