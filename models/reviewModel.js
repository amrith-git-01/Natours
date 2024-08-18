const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'Review can not be empty']
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a tour']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user']
    }
},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }

    }
);

reviewSchema.pre(/^find/, function (next) {
    // this.populate({
    //     path: 'tour',
    //     select: 'name'
    // }).populate({
    //     path: 'user',
    //     select: 'name photo'
    // });

    this.populate({
        path: 'user',
        select: 'name photo'
    });

    next();
});

reviewSchema.statics.calcAverageRatings = async function (tourId) {
    const stats = await this.aggregate([
        {
            $match: { tour: tourId }
        },
        {
            $group: {
                _id: '$tour',
                nRatings: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);
    // console.log(stats);
    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].nRatings,
            ratingsAverage: stats[0].avgRating
        });
    } else {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5
        });
    }
}

//to make the user and tour unique for a review, so the user dont post duplicate reviews
reviewSchema.index({ tour: 1, user: 1 }, {
    unique: true
});

//calling the static method
reviewSchema.post('save', function () {
    //this points to current review doc being saved
    this.constructor.calcAverageRatings(this.tour);
});

//to update the nRatings and avgRating after updating a review
reviewSchema.pre(/^findOneAnd/, async function (next) {
    this.r = await this.model.findOne(this.getFilter());
    // console.log(this.r);
    next();
});

reviewSchema.post(/^findOneAnd/, async function () {
    if (this.r) {
        await this.r.constructor.calcAverageRatings(this.r.tour);
    }
});



const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;

///////////////////////////////////////////////
//NESTED ROUTES

//POST /tour/3434fdmfs(tour_id)/review
//the above is to post a review and we get the tour id from the url

//GET /tour/2343423ds(tour_id)/reviews
//to get all the reviews on the tour_id

//GET /tour/23423weew/review/23423gg(review_id)
//to get a single review on the tour_id
///////////////////////////////////////////////