import AppError from "../utils/appError.js";
import affRouter from "./Affiliation/affiliation.routes.js";
import groupRouter from "./Group/group.routes.js";
import messageRouter from "./Message/message.routes.js";
import notiticationRouter from "./Notification/notification.routes.js";
import subRouter from "./Subscription/sub.routes.js";
import taskLogRouter from "./Tasks Log/tasksLog.routes.js";
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
  app.use("/aff", affRouter);
  app.use("/trans", transRouter);
  app.use("/message", messageRouter);
  app.use("/group", groupRouter);
  app.use("/log", taskLogRouter);
  
  app.use("/", (req, res, next) => {
    res.send("Page Not Found");
    // next(   res
    //   .status(404)
    //     .json({ message: "Not Found" }))
  });

  app.all("*", (req, res, next) => {
    next(new AppError(`Not Found `, 404));
  });

  // app.use((err, req, res, next) => {
  //   if(err){
  //   res
  //     .status(err.statusCode)
  //     .json({ message: err.message, statusCode: err.statusCode });
  // }else{
  //   next();
  // }
  // });
}
