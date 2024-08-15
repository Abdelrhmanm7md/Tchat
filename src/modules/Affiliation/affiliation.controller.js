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
//   let codeUser = null
//   let code = null
//   if (req.query.code) {
//     codeUser = await affiliationModel.findOne({ code: req.query.code });
//     let total = await affiliationModel.findByIdAndUpdate({_id:codeUser._id},{
//       $inc:{amount:codeUser.reward}
//     })
//     let referredBy = await affiliationModel.findByIdAndUpdate({ _id: savedAff._id },{referredBy:codeUser.user},{new: true,});
//     code = codeUser.code
//   }
//   res.status(201).json({
//     message: "Affiliation created successfully!",
//     savedAff,
//     code
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
    affiliationModel.findOne({user:req.params.id}).populate("referredBy").sort({ $natural: -1 }),
    req.query
  )
    .sort()
    .search();
    let Usedcode = null
  let results = await ApiFeat.mongooseQuery;
  if (!ApiFeat || !results) {
    return res.status(404).json({
      message: "No Affiliation was found!",
    });
  }
  if(results.referredBy){
let code =  await affiliationModel.findOne({ user: results.referredBy._id });
Usedcode = code.code
}

  res.json({
    message: "done",
    results,
    Usedcode,
    "refs": await affiliationModel.find({ referredBy: req.params.id })

  });
});

export {  editAff, deleteAff, getAllAffs, editAffReferrals };
