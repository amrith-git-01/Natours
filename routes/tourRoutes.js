const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./../routes/reviewRoutes');

// const reviewController = require('./../controllers/reviewController');

const router = express.Router();

// router.param('id', tourController.checkID);

///////////////////////////////////////////////
//NESTED ROUTES

//POST /tour/3434fdmfs(tour_id)/review
//the above is to post a review and we get the tour id from the url

//GET /tour/2343423ds(tour_id)/reviews 
//to get all the reviews on the tour_id

//GET /tour/23423weew/review/23423gg(review_id)
//to get a single review on the tour_id
///////////////////////////////////////////////
//NESTED ROUTE
router.use('/:tourId/reviews', reviewRouter);

router
    .route('/top-5-cheap')
    .get(tourController.aliasTopTours, tourController.getAllTours)

router.route('/tour-stats').get(tourController.getTourStats);

router
    .route('/monthly-plan/:year')
    .get(authController.protect, authController.restrictTo('admin', 'lead-guide', 'guide'), tourController.getMonthlyPlan);

router
    .route('/tours-within/:distance/center/:latlng/unit/:unit')
    .get(tourController.getToursWithin);
//alternate: /tours-within?distance=233&center=-48,45&unit=mi

router
    .route('/distances/:latlng/unit/:unit')
    .get(tourController.getDistances);

router
    .route('/')
    .get(tourController.getAllTours)
    .post(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.addNewTour);

router
    .route('/:id')
    .patch(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.uploadTourImages, tourController.resizeTourImages, tourController.changeTour)
    .get(tourController.getTour)
    .delete(authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        tourController.deleteTour);

//NESTED ROUTES
// router
//     .route('/:tourId/reviews')
//     .post(authController.protect,
//         authController.restrictTo('user'),
//         reviewController.addReview
//     );
module.exports = router;