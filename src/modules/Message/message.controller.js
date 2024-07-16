import { messageModel } from "../../../database/models/message.model.js";
import { sio } from "../../../server.js";
import ApiFeature from "../../utils/apiFeature.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";

const createmessage = catchAsync(async (req, res, next) => {
  const newmessage = new messageModel(req.body);
  const savedmessage = await newmessage.save();

  sio.emit(`message_${req.body.sender}_${req.body.taskId}, ${ savedmessage.createdAt },${ req.body.content}`);


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
      (file) => `https://tchatpro.com/image/${file.filename.split(" ").join("")}`
    );

    const directoryPathh = path.join(docs, 'uploads/tasks');
    
    fsExtra.readdir(directoryPathh, (err, files) => {
        if (err) {
            return console.error('Unable to scan directory: ' + err);
        }
    
        files.forEach(file => {
            const oldPath = path.join(directoryPathh, file);
            const newPath = path.join(directoryPathh, file.replace(/\s+/g, ''));
    
            fsExtra.rename(oldPath, newPath, (err) => {
                if (err) {
                    console.error('Error renaming file: ', err);
                } else {
                    console.log(`Renamed: ${file} -> ${file.replace(/\s+/g, '')}`);
                }
            });
        });
    });
    

  if (req.body.docs) {
    docs = req.body.docs;
  }



  res.status(200).json({
    message: "Photos created successfully!",
    docs,
  });
});

const getAllmessage = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(messageModel.find(), req.query)
    .pagination()
    .search()

  let results = await ApiFeat.mongooseQuery;
  results = JSON.stringify(results);
  results = JSON.parse(results);
  res.json({
    message: "done",
    page: ApiFeat.page,
    count: await messageModel.countDocuments(),
    results,
  });
  if (!ApiFeat) {
    return res.status(404).json({
      message: "No message was found!",
    });
  }
});

export {
  createmessage,
  getAllmessage,
  addPhotos,
};

