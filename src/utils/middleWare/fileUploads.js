import multer from "multer";
import AppError from "../appError.js";

export const fileSizeLimitErrorHandler = (err, req, res, next) => {  
  if (err) {
    res.status(400).json({ message: err.message });
  } else {
    next();
  }
};
export function fileFilterHandlerForProfile(file, req, cb) {
  const filetypes = /jpeg|jpg|png/;
  const mimetype = filetypes.test(file.files.profilePic[0].mimetype);
  // console.log(file.files.profilePic[0].mimetype,"mmmmm");
  // console.log(mimetype,"mmmmm");
  
  if (mimetype) {
    return cb(null, true);
  } else {
    return cb(
      new AppError("Please, Upload a Valid Image JPEG or PNG or JPG", 400),
      false
    );
  }
}
export function fileFilterHandler(file, req, cb) {
  const filetypes = /jpeg|jpg|png|svg|pdf|docx|xlxs|pptx|doc|xls|xlsx|ppt|pptx/;
  const files = file.files.documents;

  // Check if all files are valid
  const allFilesValid = files.every((file) => filetypes.test(file.mimetype));

  if (allFilesValid) {
    return cb(null, true);
  } else {
    return cb(
      new AppError("Please, Upload Valid Files (JPEG, PNG, JPG, PDF, etc.)", 400),
      false
    );
  }
}
// export const subscriptionType = catchAsync(async (req, res, next) => {
//   let size;
  
//   if (req.user.subscriptionType == "normal") {
//     size = 5000000;
//   } else if (req.user.subscriptionType == "premium") {
//     size = 50000000;
//   }else{
//     size = 100000000;
//   }

//   // Attach the size to the request object
//   req.fileSizeLimit = size;
  
//   next();
// });

let options = (folderName, size) => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, `./uploads/${folderName}`);
    },

    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, `${uniqueSuffix}-${file.originalname}`);
    },
  });

  function fileFilter(req, file, cb) {
    cb(null, true);
  }
  console.log(size,"sssss");

  return multer({
    storage,
    limits: {
      fileSize: size,
    },
    fileFilter,
  });
};

export const uploadMixFile = (folderName, arrayFields) => (req, res, next) => {
  const size = req.fileSizeLimit;
  // console.log(req.user.subscriptionType,"Ddddd");
  const upload = options(folderName, size).fields(arrayFields);
  upload(req, res, function (err) {
    if (err) {
      return next(err);
    }
    next();
  });
};

