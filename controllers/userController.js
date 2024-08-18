const User = require('./../models/userModel');
// const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp');

//IMAGE STORED IN THE FILE SYSTEM OF OUR OWN
// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'public/img/users')
//     },
//     filename: (req, file, cb) => {
//         //user-347804(user-id)-53646564(current_time_stamp).jpg(extension)
//         const ext = file.mimetype.split('/')[1];
//         cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//     }
// });

//IMAGE STORED IN BUFFER
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    }
    else {
        cb(new AppError('Not an image! Please upload only images', 400), false);
    }
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
    if (!req.file) return next();

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/users/${req.file.filename}`);

    next();
});

const filterObj = (obj, ...allowedFields) => {
    const newObj = {}
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
}

exports.getAllUsers = factory.getAll(User);

// exports.getAllUsers = catchAsync(async function (req, res) {
//     const users = await User.find();
//     res.status(200).json({
//         status: 'success',
//         results: users.length,
//         data: {
//             users
//         }
//     });
// });

exports.createUser = function (req, res) {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined! Please use the /signup instead!'
    });
}

//Do not update password with this!!!
exports.updateUser = factory.updateOne(User);

//using factory function
exports.deleteUser = factory.deleteOne(User);

//normal way of deleting
// exports.deleteUser = function (req, res) {
//     res.status(500).json({
//         status: 'error',
//         message: 'This route is not yet defined'
//     });
// }

exports.updateMe = catchAsync(async (req, res, next) => {
    console.log(req.file)//multer 
    console.log(req.body)

    //create error if user posts password data
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError('This route is not for password updates. Please use /updateMyPassword', 400));
    }
    //update user document
    //we filter the body to only have name and email because to prevent users changing other fields like roles etc,.

    //we add the photo if we have a request with a image file
    const filteredBody = filterObj(req.body, 'name', 'email');
    if (req.file) filteredBody.photo = req.file.filename;
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    });
});

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
}

exports.deteteMe = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
        status: 'success',
        data: null
    });
});

//FACTORY FUNCTION METHOD
exports.getUser = factory.getOne(User);

// exports.getUser = function (req, res) {
//     res.status(500).json({
//         status: 'error',
//         message: 'This route is not yet defined'
//     });
// }