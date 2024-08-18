const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

const router = express.Router({ mergeParams: true });

//POST /tour/3434fdmfs(tour_id)/review
//POST reviews
//BOTH THE ABOVE ROUTES END IN THE SAME BELOW ROUTE

router.use(authController.protect);

router
    .route('/')
    .get(reviewController.getAllReviews)
    .post(authController.restrictTo('user'),
        reviewController.setTourAndUserIDs,
        reviewController.addReview
    );

router
    .route('/:id')
    .get(reviewController.getReview)
    .delete(authController.restrictTo('user', 'admin'), reviewController.deleteReview)
    .patch(authController.restrictTo('user', 'admin'), reviewController.updateReview);

module.exports = router;