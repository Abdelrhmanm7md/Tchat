import { transModel } from "../../../database/models/transaction.model.js";
import ApiFeature from "../../utils/apiFeature.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";

const createtrans = catchAsync(async (req, res, next) => {
  const newtrans = new transModel(req.body);
  const savedtrans = await newtrans.save();

  res.status(201).json({
    message: "trans created successfully!",
    savedtrans,
  });
});

const getAlltrans = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(transModel.find(), req.query)
    .pagination()
    .search()

  let results = await ApiFeat.mongooseQuery;
  results = JSON.stringify(results);
  results = JSON.parse(results);
  res.json({
    message: "done",
    page: ApiFeat.page,
    count: await transModel.countDocuments(),
    results,
  });
  if (!ApiFeat) {
    return res.status(404).json({
      message: "No trans was found!",
    });
  }
});

export {
  createtrans,
  getAlltrans,
};
