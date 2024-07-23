import { messageModel } from "../../../database/models/message.model.js";
import { sio } from "../../../server.js";
import ApiFeature from "../../utils/apiFeature.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";
import path from "path";
import fsExtra from "fs-extra";

const createmessage = catchAsync(async (req, res, next) => {
  function formatAMPM(date) {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? "0" + minutes : minutes;
    let strTime = hours + ":" + minutes + " " + ampm;
    return strTime;
  }
  let currentTime = new Date();
  let createdAt = formatAMPM(currentTime);
  req.body.date = createdAt;
  let content = req.body.content.toString();
  let sender = req.body.sender;
  let senderName = req.body.senderName;
  const newmessage = new messageModel(req.body);
  const savedmessage = await newmessage.save();

  sio.emit(
    `message_${req.body.taskId}`,
    { createdAt },
    { content },
    { sender },
    { senderName },
  );

  res.status(201).json({
    message: "message created successfully!",
    savedmessage,
  });
});
const addPhotos = catchAsync(async (req, res, next) => {
  let docs = "";
  req.body.docs =
    req.files.docs &&
    req.files.docs.map(
      (file) =>
        `https://tchatpro.com/image/${file.filename.split(" ").join("")}`
    );

  const directoryPathh = path.join(docs, "uploads/image");

  fsExtra.readdir(directoryPathh, (err, files) => {
    if (err) {
      return console.error("Unable to scan directory: " + err);
    }

    files.forEach((file) => {
      const oldPath = path.join(directoryPathh, file);
      const newPath = path.join(directoryPathh, file.replace(/\s+/g, ""));

      fsExtra.rename(oldPath, newPath, (err) => {
        if (err) {
          console.error("Error renaming file: ", err);
        }
      });
    });
  });

  if (req.body.docs !== "") {
    docs = req.body.docs;
  }

  res.status(200).json({
    message: "Photos created successfully!",
    docs,
  });
});

const getAllmessage = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(messageModel.find(), req.query).search();

  let results = await ApiFeat.mongooseQuery;
  results = JSON.stringify(results);
  results = JSON.parse(results);
  res.json({
    message: "done",

    count: await messageModel.countDocuments(),
    results,
  });
  if (!ApiFeat) {
    return res.status(404).json({
      message: "No message was found!",
    });
  }
});
const getAllmessageByTask = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(
    messageModel.find({ taskId: req.params.id }),
    req.query
  );

  let results = await ApiFeat.mongooseQuery;
  results = JSON.stringify(results);
  results = JSON.parse(results);
  res.json({
    message: "done",

    count: await messageModel.countDocuments({ taskId: req.params.id }),
    results,
  });
  if (!ApiFeat) {
    return res.status(404).json({
      message: "No message was found!",
    });
  }
});

export { createmessage, getAllmessage, addPhotos, getAllmessageByTask };
