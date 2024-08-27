import { messageModel } from "../../../database/models/message.model.js";
import { sio } from "../../../server.js";
import ApiFeature from "../../utils/apiFeature.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";
import path from "path";
import fsExtra from "fs-extra";
import { taskModel } from "../../../database/models/tasks.model.js";

const createmessage = catchAsync(async (req, res, next) => {
  let { id } = req.params;
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
  let content = req.body.content;
  let sender = req.body.sender;
  let senderName = req.body.senderName;
  let documents = [];
  if (req.body.documents) {
    documents = req.body.documents;
  }
  const newmessage = new messageModel(req.body);
  const savedmessage = await newmessage.save();


let savedList = await taskModel.findById(id);
savedList.messages.push(newmessage._id);
savedList.save();
  sio.emit(
    `message_${id}`,
    { createdAt },
    { content },
    { sender },
    { senderName },
    { documents }
  );
  
  res.status(201).json({
    message: "message created successfully!",
    savedmessage,
  });
});
const addPhotos = catchAsync(async (req, res, next) => {
  let documents = "";
  req.body.documents =
    req.files.documents &&
    req.files.documents.map(
      (file) =>
        `https://tchatpro.com/image/${file.filename.split(" ").join("-")}`
    );

  const directoryPathh = path.join(documents, "uploads/image");

  fsExtra.readdir(directoryPathh, (err, files) => {
    if (err) {
      return console.error("Unable to scan directory: " + err);
    }

    files.forEach((file) => {
      const oldPath = path.join(directoryPathh, file);
      const newPath = path.join(directoryPathh, file.replace(/\s+/g, "-"));

      fsExtra.rename(oldPath, newPath, (err) => {
        if (err) {
          console.error("Error renaming file: ", err);
        }
      });
    });
  });

  if (req.body.documents !== "") {
    documents = req.body.documents;
  }

  res.status(200).json({
    message: "Photos created successfully!",
    documents,
  });
});

const getAllmessageByTask = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(
    taskModel.find({ _id: req.params.id }).populate("messages"),
    req.query
  )
  .sort({ $natural: -1 })  
  // .pagination()

  let results = await ApiFeat.mongooseQuery;
  results = JSON.stringify(results);
  results = JSON.parse(results);
  if (!ApiFeat || !results) {
    return res.status(404).json({
      message: "No message was found!",
    });
  }
  results = results[0].messages
  res.json({
    message: "Done",
    // page: ApiFeat.page,
    // count: await messageModel.countDocuments({ id: req.params.id }),
    results,
  });
});

export { createmessage, addPhotos, getAllmessageByTask };
