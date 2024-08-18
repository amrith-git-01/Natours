const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const User = require('./../models/userModel');
const Booking = require('./../models/bookingModel');

exports.getOverview = catchAsync(async (req, res, next) => {
    //get tour data from collection
    const tours = await Tour.find();

    //build our template

    //render tthe template using the data

    res.status(200).render('overview', {
        title: 'All Tours',
        tours
    });
});

exports.getTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
        path: 'reviews',
        fields: 'review rating user'
    });

    if (!tour) {
        return next(new AppError('There is no tour with that name.', 404));
    }

    res.status(200).render('tour', {
        title: `${tour.name} Tour`,
        tour
    });
});

exports.getLoginForm = (req, res) => {
    res.status(200)
        .set(
            'Content-Security-Policy',
            "connect-src 'self' https://cdnjs.cloudflare.com"
        )
        .render('Login', {
            title: 'Log into your account'
        });
};

exports.getAccount = (req, res) => {
    res.status(200).render('account', {
        title: 'Your account'
    });
}

exports.getMyTours = catchAsync(async (req, res, next) => {
    //find all bookings
    const bookings = await Booking.find({user: req.user.id});
    //find tours with the returned ids
    const tourIDs = bookings.map(el => el.tour);
    //fetching the tours that are present in the tourIDs array
    const tours = await Tour.find({_id:{$in: tourIDs}});
    res.status(200).render('overview', {
        title: 'My tours',
        tours
    });
});

exports.updateUserData = catchAsync(async (req, res, next) => {
    // console.log(req.body.id);
    const updatedUser = await User.findByIdAndUpdate(req.body.id, {
        name: req.body.name,
        email: req.body.email
    }, {
        new: true,
        runValidators: true
    }
    );
    res.status(200).render('account', {
        title: 'Your account',
        user: updatedUser
    });
});
