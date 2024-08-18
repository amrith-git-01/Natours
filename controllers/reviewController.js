const Review = require('./../models/reviewModel');
// const catchAsync = require('./../utils/catchAsync');
// const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

//FACTORY FUNCTION METHOD
exports.getAllReviews = factory.getAll(Review);

//NORMAL METHOD
// exports.getAllReviews = catchAsync(async (req, res, next) => {
//     let filter = {};
//     if (req.params.tourId) filter = { tour: req.params.tourId }


//     const reviews = await Review.find(filter);
//     results: reviews.length,
//         res.status(200).json({
//             status: 'success',
//             data: {
//                 reviews
//             }
//         });
// });

exports.setTourAndUserIDs = (req, res, next) => {
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user.id;
    next();
}

//FACTORY FUNCTION METHOD
exports.addReview = factory.createOne(Review);

//NORMAL METHOD
// exports.addReview = catchAsync(async (req, res, next) => {

//     //NESTED ROUTES
//     const newReview = await Review.create(req.body);
//     res.status(201).json({
//         status: 'success',
//         data: {
//             review: newReview
//         }
//     });
// }); 

exports.deleteReview = factory.deleteOne(Review);

exports.updateReview = factory.updateOne(Review);

exports.getReview = factory.getOne(Review);

