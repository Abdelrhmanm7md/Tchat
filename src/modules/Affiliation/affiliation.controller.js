import { affiliationModel } from "../../../database/models/affiliation.model.js";
import ApiFeature from "../../utils/apiFeature.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";
import generateUniqueId from "generate-unique-id";

const createAff = catchAsync(async (req, res, next) => {
  req.body.code = generateUniqueId({
    length: 10,
    useLetters: true,
  });
  const newAff = new affiliationModel(req.body);
  const savedAff = await newAff.save();
  res.status(201).json({
    message: "Affiliation created successfully!",
    savedAff,
  });
});

const editAff = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updatedAff = await affiliationModel.findByIdAndUpdate(id, req.body, {
    new: true,
  });

  if (!updatedAff) {
    return res.status(404).json({ message: "Aff not found!" });
  }

  res.status(200).json({
    message: "Affiliation updated successfully!",
    updatedAff,
  });
});
const editAffReferrals = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const updatedAff = await affiliationModel.findByIdAndUpdate(
    id,
    { $push: { referrals: req.body.referrals } },
    { new: true }
  );

  if (!updatedAff) {
    return res.status(404).json({ message: "Aff not found!" });
  }

  res.status(200).json({
    message: "Affiliation updated successfully!",
    updatedAff,
  });
});

const deleteAff = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const deletedAff = await affiliationModel.findByIdAndDelete(id);

  if (!deletedAff) {
    return res.status(404).json({ message: "Aff not found!" });
  }

  res.status(200).json({ message: "Affiliation deleted successfully!" });
});

const getAllAffs = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(
    affiliationModel.find().populate("referrals"),
    req.query
  )
    .pagination()
    .sort()
    .search();

  let results = await ApiFeat.mongooseQuery;
  let num = 0;
  for (let j = 0; j < results.length; j++) {
    num = results[j].referrals.length;
    results[j].num = num;
  }
  res.json({
    message: "done",
    page: ApiFeat.page,
    count: await affiliationModel.countDocuments(),
    results,
  });
  if (!ApiFeat) {
    return res.status(404).json({
      message: "No Affiliation was found!",
    });
  }
});

export { createAff, editAff, deleteAff, getAllAffs, editAffReferrals };
