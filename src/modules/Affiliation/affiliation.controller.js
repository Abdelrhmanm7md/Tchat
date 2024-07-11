import { affiliationModel } from "../../../database/models/affiliation.model.js";
import ApiFeature from "../../utils/apiFeature.js";
import catchAsync from "../../utils/middleWare/catchAsyncError.js";


const createAff = catchAsync(async (req, res, next) => {
  
  const { title, content, tags ,author} = req.body;
  
  const newAff = new affiliationModel({ title, content,tags, author });
  const savedAff = await newAff.save();
  res.status(201).json({
    message: "Affiliation created successfully!",
    savedAff
  });
});

const editAff = catchAsync(async (req, res, next) => {
  const {id} = req.params;

  const updatedAff = await affiliationModel.findByIdAndUpdate(
    id,
    req.body,
    { new: true }
  );

  if (!updatedAff) {
    return res.status(404).json({ message: "Aff not found!" });
  }

  res.status(200).json({
    message: "Affiliation updated successfully!",
    updatedAff
  });
});

const deleteAff = catchAsync(async (req, res, next) => {
  const {id} = req.params;

  const deletedAff = await affiliationModel.findByIdAndDelete(id);

  if (!deletedAff) {
    return res.status(404).json({ message: "Aff not found!" });
  }

  res.status(200).json({ message: "Affiliation deleted successfully!" });
});

const getAllAffs = catchAsync(async (req, res, next) => {
  let ApiFeat = new ApiFeature(affiliationModel.find(), req.query)
    .pagination()
    .sort()
    .search()

  let results = await ApiFeat.mongooseQuery;
  res.json({ message: "done", page: ApiFeat.page, results });
  if (!ApiFeat) {
    return res.status(404).json({
      message: "No Affiliation was found!",
    });
  }
});

export { createAff, editAff, deleteAff,getAllAffs };
