import { affiliationModel } from "../../../database/models/affiliation.model.js";
import ApiFeature from "../../utils/apiFeature.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";
import generateUniqueId from "generate-unique-id";

// const createAff = catchAsync(async (req, res, next) => {
//   req.body.code = generateUniqueId({
//     length: 10,
//     useLetters: true,
//   });
//   const newAff = new affiliationModel(req.body);
//   const savedAff = await newAff.save();
//   res.status(201).json({
//     message: "Affiliation created successfully!",
//     savedAff,
//   });
// });

const editAff = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updatedAff = await affiliationModel.findByIdAndUpdate(id,
  req.body,
  {new: true,}
);

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
    affiliationModel.findOne({user:req.params.id}).populate("referredBy"),
    req.query
  )
    .sort()
    .search();

  let results = await ApiFeat.mongooseQuery;
  if (!ApiFeat || !results) {
    return res.status(404).json({
      message: "No Affiliation was found!",
    });
  }
  if(results.referredBy){
let code =  await affiliationModel.findOne({ user: results.referredBy._id });
results.code = code.code
}
  res.json({
    message: "done",
    results,
  });
});

export {  editAff, deleteAff, getAllAffs, editAffReferrals };
