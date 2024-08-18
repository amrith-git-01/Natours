const multer = require('multer');
const sharp = require('sharp');
const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    }
    else {
        cb(new AppError('Not an image! Please upload only images.', 400), false);
    }
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

exports.uploadTourImages = upload.fields([{
    name: 'imageCover',
    maxCount: 1
}, {
    name: 'images',
    maxCount: 3
}
]);

//upload.single('image')
//upload.array('images', 5)

exports.resizeTourImages = catchAsync(async (req, res, next) => {

    if (!req.files.imageCover || !req.files.images) return next();

    //imageCover
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpg`;
    await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)//2:3 ratio
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${req.body.imageCover}`);

    //images
    req.body.images = [];
    console.log(req.files);
    await Promise.all(req.files.images.map(async (file, index) => {
        const filename = `tour-${req.params.id}-${Date.now()}-${index + 1}.jpg`;
        await sharp(file.buffer)
            .resize(2000, 1333)//2:3 ratio
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toFile(`public/img/tours/${filename}`);

        req.body.images.push(filename);
    }));
    console.log(req.body);

    next();
});

// const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`));

// exports.checkID = (req, res, next, val) => {
//     if (req.params.id * 1 > tours.length) {
//         console.log(`tour id is: ${val}`);

//         return res.status(404).json({
//             status: 'fail',
//             message: "Invalid id"
//         });
//     }
//     next();
// }

// exports.checkBody = (req, res, next) => {
//     if (!req.body.name || !req.body.price) {
//         return res.status(400).json({
//             status: 'fail',
//             message: 'Missing name or price'
//         });
//     }
//     next();
// }

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
}

//FACTORY FUNCTION METHOD
exports.getAllTours = factory.getAll(Tour);

//NORMAL METHOD
// exports.getAllTours = catchAsync(async (req, res) => {
//     const requestTime = new Date().toISOString();
//     const features = new APIFeatures(Tour.find(), req.query).filter().sort().limitFields().paginate();
//     const tours = await features.query;
//     res.status(200).json({
//         status: 'success',
//         requestedAt: requestTime,
//         results: tours.length,
//         data: {
//             tours
//         }
//     });

//     // try {
//     //     console.log(req.query);
//     //     //BUILD QUERY
//     //     //FILTERING
//     //     // const queryObject = { ...req.query };
//     //     // const excludeFields = ['page', 'sort', 'limits', 'feilds'];
//     //     // excludeFields.forEach(el => delete queryObject[el]);

//     //     // //ADVANCED FILTERING

//     //     // let queryStr = JSON.stringify(queryObject);
//     //     // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
//     //     // console.log(JSON.parse(queryStr));


//     //     const requestTime = new Date().toISOString(); // define requestTime

//     //     //normal way
//     //     // let query = Tour.find(JSON.parse(queryStr));

//     //     //aggregate way
//     //     // const tours = await Tour.find().where('duration').equals(4).where('difficulty').equals('easy');

//     //     //{difficulty:'easy', duration: {$gte:5}}

//     //     //SORTING
//     //     //SINGLE PARAMETER
//     //     // if(req.query.sort){
//     //     //     query = query.sort(req.query.sort);
//     //     //     //sort('price ratingsAverage')
//     //     // }

//     //     //DOUBLE PARAMETER
//     //     // if (req.query.sort) {
//     //     //     const sortBy = req.query.sort.split(',').join(' ');
//     //     //     query = query.sort(sortBy);
//     //     //     //sort('price ratingsAverage')
//     //     // } else {
//     //     //     query = query.sort('-createdAt');
//     //     // }

//     //     //FIELD LIMITING
//     //     // if (req.query.fields) {
//     //     //     const fields = req.query.fields.split(',').join(' ');
//     //     //     console.log(fields);
//     //     //     query = Tour.find().select(fields);
//     //     // } else {
//     //     //     query = query.select('-__v');
//     //     // }

//     //     //PAGINATION
//     //     // const page = req.query.page * 1 || 1;
//     //     // const limit = req.query.limit * 1 || 100;
//     //     // const skip = (page - 1) * limit;
//     //     // //page=2&limit=10, 1-10, page 1, 11-20, page 2,...
//     //     // query=Tour.find().skip(skip).limit(limit);
//     //     // if(req.query.page){
//     //     //     const numTours=await Tour.countDocuments();
//     //     //     if(skip>=numTours) throw new Error('This page does not exists');

//     //     // }

//     //     //EXECUTE QUERY
//     //     const features = new APIFeatures(Tour.find(), req.query).filter().sort().limitFields().paginate();
//     //     const tours = await features.query;
//     //     // query.sort().select()skip().limit()

//     //     // SEND RESPONSE
//     //     res.status(200).json({
//     //         status: 'success',
//     //         requestedAt: requestTime,
//     //         results: tours.length,
//     //         data: {
//     //             tours
//     //         }
//     //     });

//     // } catch (err) {
//     //     res.status(404).json({
//     //         status: 'fail',
//     //         message: err.message // send only the error message
//     //     });
//     // }
// });

//FACTORY FUNCTION METHOD
exports.getTour = factory.getOne(Tour, { path: 'reviews' });


//NORMAL METHOD
// exports.getTour = catchAsync(async (req, res, next) => {
//     // console.log(req.params);
//     // const id = req.params.id * 1;
//     const tour = await Tour.findById(req.params.id).populate('reviews');
//     // Tour.findOne({_id: req.params.id})
//     // const tour = tours.find(el => el.id === id);
//     if (!tour) {
//         return next(new AppError('No tour found with that ID', 404));
//     }
//     res.status(200).json({
//         //JSend Format
//         status: 'success',
//         data: {
//             tour
//         }
//     });
//     // try {
//     //     const tour = await Tour.findById(req.params.id);
//     //     // Tour.findOne({_id: req.params.id})
//     //     // const tour = tours.find(el => el.id === id);
//     //     res.status(200).json({
//     //         //JSend Format
//     //         status: 'success',
//     //         data: {
//     //             tour
//     //         }
//     //     });
//     // } catch (err) {
//     //     res.status(404).json({
//     //         //JSend Format
//     //         status: 'fail',
//     //         message: err
//     //     });
//     // }

// });

//FACTORY FUNCTION METHOD
exports.addNewTour = factory.createOne(Tour);

//NORMAL WAY
// exports.addNewTour = catchAsync(async (req, res, next) => {

//     const newTour = await Tour.create(req.body);
//     res.status(201).json({
//         status: "success",
//         data: {
//             tour: newTour
//         }
//     });


//     // try {

//     //     const newTour = await Tour.create(req.body);

//     //     res.status(201).json({
//     //         status: "success",
//     //         data: {
//     //             tour: newTour
//     //         }
//     //     });
//     // } catch (err) {
//     //     res.status(400).json({
//     //         status: "error",
//     //         message: err.message
//     //     });
//     // }

//     // // console.log(req.body);
//     // //creating new id
//     // const newId = tours[tours.length - 1].id + 1;
//     // //merging id and req body
//     // const newTour = Object.assign({ id: newId }, req.body);
//     // //adding to the array
//     // tours.push(newTour);
//     // //writing the array to the file using the async version
//     // fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
//     //     //responding by viewing the added tour
//     //     res.status(201).json({
//     //         status: "success", data: {
//     //             tour: newTour
//     //         }
//     //     });
//     // });
// });

//factory function
exports.changeTour = factory.updateOne(Tour);

// exports.changeTour = catchAsync(async (req, res, next) => {
//     const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//         new: true,
//         runValidators: true
//     });
//     if (!tour) {
//         return next(new AppError('No tour found with that ID', 404));
//     }
//     res.status(200).json({
//         status: 'success',
//         data: {
//             tour
//         }
//     });
//     // try {
//     //     const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     //         new: true,
//     //         runValidators: true
//     //     });
//     //     res.status(200).json({
//     //         status: 'success',
//     //         data: {
//     //             tour
//     //         }
//     //     });
//     // } catch (err) {
//     //     res.status(404).json({
//     //         //JSend Format
//     //         status: 'fail',
//     //         message: err
//     //     });
//     // }

// });

exports.deleteTour = factory.deleteOne(Tour);
// exports.deleteTour = catchAsync(async (req, res) => {
//     const tour = await Tour.findByIdAndDelete(req.params.id);

//     res.status(204).json({
//         status: 'success',
//         data: null
//     });
//     if (!tour) {
//         return next(new AppError('No tour found with that ID', 404));
//     }
//     // try {
//     //     await Tour.findByIdAndDelete(req.params.id);

//     //     res.status(204).json({
//     //         status: 'success',
//     //         data: null
//     //     });

//     // } catch (err) {
//     //     res.status(404).json({
//     //         //JSend Format
//     //         status: 'fail',
//     //         message: err
//     //     });
//     // }
// });

exports.getTourStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } }
        },
        {
            $group: {
                // _id: '$ratingsAverage',
                _id: { $toUpper: '$difficulty' },
                numRatings: { $sum: '$ratingsQuantity' },
                numTours: { $sum: 1 },
                avgRating: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' }
            }
        },
        {
            $sort: { avgPrice: 1 }
        },
        // {
        //     $match:{_id:{$ne:'EASY'}}
        // }
    ]);
    res.status(200).json({
        status: 'success',
        data: {
            stats
        }
    });
    // try {
    //     const stats = await Tour.aggregate([
    //         {
    //             $match: { ratingsAverage: { $gte: 4.5 } }
    //         },
    //         {
    //             $group: {
    //                 // _id: '$ratingsAverage',
    //                 _id: { $toUpper: '$difficulty' },
    //                 numRatings: { $sum: '$ratingsQuantity' },
    //                 numTours: { $sum: 1 },
    //                 avgRating: { $avg: '$ratingsAverage' },
    //                 avgPrice: { $avg: '$price' },
    //                 minPrice: { $min: '$price' },
    //                 maxPrice: { $max: '$price' }
    //             }
    //         },
    //         {
    //             $sort: { avgPrice: 1 }
    //         },
    //         // {
    //         //     $match:{_id:{$ne:'EASY'}}
    //         // }
    //     ]);
    //     res.status(200).json({
    //         status: 'success',
    //         data: {
    //             stats
    //         }
    //     });
    // } catch (err) {
    //     res.status(404).json({
    //         //JSend Format
    //         status: 'fail',
    //         message: err
    //     });
    // }
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1;

    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates'
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numTourStarts: { $sum: 1 },
                tours: { $push: '$name' }
            }
        },
        {
            $addFields: {
                month: '$_id'
            }
        },
        {
            $project: {
                _id: 0//not show in result

            }
        },
        {
            $sort: {
                numTourStarts: -1
            }
        },
        {
            $limit: 6
        }
    ]);
    res.status(200).json({
        status: 'success',
        data: {
            plan
        }
    });
    // try {
    //     const year = req.params.year * 1;

    //     const plan = await Tour.aggregate([
    //         {
    //             $unwind: '$startDates'
    //         },
    //         {
    //             $match: {
    //                 startDates: {
    //                     $gte: new Date(`${year}-01-01`),
    //                     $lte: new Date(`${year}-12-31`)
    //                 }
    //             }
    //         },
    //         {
    //             $group: {
    //                 _id: { $month: '$startDates' },
    //                 numTourStarts: { $sum: 1 },
    //                 tours: { $push: '$name' }
    //             }
    //         },
    //         {
    //             $addFields: {
    //                 month: '$_id'
    //             }
    //         },
    //         {
    //             $project: {
    //                 _id: 0//not show in result

    //             }
    //         },
    //         {
    //             $sort: {
    //                 numTourStarts: -1
    //             }
    //         },
    //         {
    //             $limit: 6
    //         }
    //     ]);
    //     res.status(200).json({
    //         status: 'success',
    //         data: {
    //             plan
    //         }
    //     });
    // } catch (err) {
    //     res.status(404).json({
    //         //JSend Format
    //         status: 'fail',
    //         message: err
    //     });
    // }
});

exports.getToursWithin = catchAsync(async (req, res, next) => {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1; //radius in radians

    if (!lat || !lng) {
        next(new AppError('Please provide latitude and longitude in the format lat,lng.', 400));
    }
    // console.log(distance, lat, lng, unit);
    const tours = await Tour.find({ startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } } });

    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            data: tours
        }
    });
});

exports.getDistances = catchAsync(async (req, res, next) => {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');
    if (!lat || !lng) {
        next(new AppError('Please provide latitude and longitude in the format lat,lng.', 400));
    }

    const distances = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [lng * 1, lat * 1]
                },
                distanceField: 'distance',
                distanceMultiplier: unit === 'mi' ? 0.000621371 : 0.001
            }
        },
        {
            $project: {
                name: 1,
                distance: 1
            }
        }
    ]);
    res.status(200).json({
        status: 'success',
        data: {
            data: distances
        }
    });
});