// const asyncHandler = require('express-async-handler');
// const ApiError = require('../utils/ApiError');
// const ApiFeatures = require('../utils/ApiFeatures');

// // @desc Code for Delete
// exports.deleteOne = (Model) =>
//   asyncHandler(async (req, res, next) => {
//     const { id } = req.params;
//     // @Notice: we can use findOneAndDelete 👇🏻
//     const document = await Model.findByIdAndDelete(id);

//     if (!document) {
//       // res.status(404).json({ msg: `No product for this id ${id}`});
//       return next(new ApiError(`No document for this id ${id}`, 404));
//     }
//     // Trigger "remove" event when delete document
//     // ce ligne de code pour enregistrer la modification de avgRatings
//     document.remove();

//     res.status(204).send();
//   })

// // @desc Code for Update
// exports.updateOne = (Model) => asyncHandler(async (req, res, next) => {

//   const document = await Model.findByIdAndUpdate(
//     req.params.id,
//     req.body, // @desc revoie les changement les elements à modifier 
//     { new: true } // send changes
//   );

//   if (!document) {
//     // res.status(404).json({ msg: `No brand for this id ${id}` })
//     return next(new ApiError(`No document for this id ${req.params.id}`, 404));
//   }
//   // Trigger "save" event when update document
//   // ce ligne de code pour enregistrer la modification de avgRatings
//   document.save();
  
//   res.status(200).json({ data: document });
// });

// // @desc Code for Create
// exports.createOne = (Model) =>
//   asyncHandler(async (req, res) => {
//     const newDoc = await Model.create(req.body)
//     res.status(201).json({ data: newDoc })
//   })

// // @desc Code for GetData By Id
// exports.getOne = (Model, populationOpt) =>
//   asyncHandler(async (req, res, next) => {
//     const { id } = req.params;
//     // 1) Build query
//     let query = Model.findById(id);
//     if (populationOpt) {
//       query = query.populate(populationOpt);
//     }

//     // 2) Execute query
//     const document = await query;
//     if (!document) {
//       // res.status(404).json({msg: `No category for this id ${id}`});
//       return next(new ApiError(`No document for this id ${id}`, 404));
//     }
//     res.status(200).json({ data: document });
//   });


// // @desc Code for getAll Data

// // exports.getAll = (Model, modelName = '') => asyncHandler(async (req, res) => {

// //   // Build query
// //   // this row return number of products
// //   let filter = {};
// //   // ce if pour les subcategorie
// //   if (req.filterObj) {
// //     filter = req.filterObj;
// //   }
// //   const documentsCounts = await Model.countDocuments();
// //   const apiFeatures = new ApiFeatures(Model.find(filter), req.query)// 👈🏻on doit supprimer find()
// //     .filter()
// //     .sort()
// //     .limitFields()
// //     .search(modelName)
// //     .paginate(documentsCounts);

// //   // Execute query
// //   const { mongooseQuery, paginationResult } = apiFeatures;
// //   const documents = await mongooseQuery;

// //   res.status(200).json({ results: documents.length, paginationResult, data: documents });
// // });
// exports.getAll = (Model, modelName = '') =>
//   asyncHandler(async (req, res) => {
//     let filter = {};
//     if (req.filterObj) {
//       filter = req.filterObj;
//     }
//     // Build query
//     const documentsCounts = await Model.countDocuments();
//     const apiFeatures = new ApiFeatures(Model.find(filter), req.query)
//       .paginate(documentsCounts)
//       .filter()
//       .search(modelName)
//       .limitFields()
//       .sort();

//     // Execute query
//     const { mongooseQuery, paginationResult } = apiFeatures;
//     const documents = await mongooseQuery;

//     res
//       .status(200)
//       .json({ results: documents.length, paginationResult, data: documents });
//   });

// const asyncHandler = require('express-async-handler');
const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/ApiError');
const ApiFeatures = require('../utils/ApiFeatures');

// const ApiError = require('../utils/apiError');
// const ApiFeatures = require('../utils/apiFeatures');

exports.deleteOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const document = await Model.findByIdAndDelete(id);

    if (!document) {
      return next(new ApiError(`No document for this id ${id}`, 404));
    }

    // Trigger "remove" event when update document
    document.remove();
    res.status(204).send();
  });

exports.updateOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!document) {
      return next(
        new ApiError(`No document for this id ${req.params.id}`, 404)
      );
    }
    // Trigger "save" event when update document
    document.save();
    res.status(200).json({ data: document });
  });

exports.createOne = (Model) =>
  asyncHandler(async (req, res) => {
    const newDoc = await Model.create(req.body);
    res.status(201).json({ data: newDoc });
  });

exports.getOne = (Model, populationOpt) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    // 1) Build query
    let query = Model.findById(id);
    if (populationOpt) {
      query = query.populate(populationOpt);
    }

    // 2) Execute query
    const document = await query;

    if (!document) {
      return next(new ApiError(`No document for this id ${id}`, 404));
    }
    res.status(200).json({ data: document });
  });

exports.getAll = (Model, modelName = '') =>
  asyncHandler(async (req, res) => {
    let filter = {};
    if (req.filterObj) {
      filter = req.filterObj;
    }
    // Build query
    const documentsCounts = await Model.countDocuments();
    const apiFeatures = new ApiFeatures(Model.find(filter), req.query)
      .paginate(documentsCounts)
      .filter()
      .search(modelName)
      .limitFields()
      .sort();

    // Execute query
    const { mongooseQuery, paginationResult } = apiFeatures;
    const documents = await mongooseQuery;

    res
      .status(200)
      .json({ results: documents.length, paginationResult, data: documents });
  });