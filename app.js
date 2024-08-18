// app.get('/', (req, res) => {
//     res.status(200).json({ message: 'Hello World', app: "natours" });
// });

// app.post('/', (req, res) => {
//     res.send('You can post to this endpoint');
// });

const path = require('path');
const express = require('express');
const fs = require("fs");
const morgan = require('morgan');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const compression = require('compression');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();

app.enable('trust proxy');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//SERVING STATIC FILES
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));

//GLOBAL MIDDLEWARES

//CORS policy
app.use(cors());
app.options('*', cors());

//SECURITY HTTP HEADERS
const defaultSrcUrls = ['https://js.stripe.com/'];

const scriptSrcUrls = [
  'https://unpkg.com/',
  'https://tile.openstreetmap.org',
  'https://cdnjs.cloudflare.com/ajax/libs/axios/1.0.0-alpha.1/axios.min.js',
  'https://js.stripe.com/v3/',
];

const styleSrcUrls = [
  'https://unpkg.com/',
  'https://tile.openstreetmap.org',
  'https://fonts.googleapis.com/',
];

const connectSrcUrls = [
  'https://*.stripe.com',
  'https://unpkg.com',
  'https://tile.openstreetmap.org',
  'https://*.cloudflare.com',
  'http://localhost:8000/api/v1/users/login',
  'http://localhost/api/v1/bookings/checkout-session/',
];

const fontSrcUrls = ['fonts.googleapis.com', 'fonts.gstatic.com'];

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", ...defaultSrcUrls],
      scriptSrc: ["'self'", ...scriptSrcUrls],
      connectSrc: ["'self'", ...connectSrcUrls],
      fontSrc: ["'self'", ...fontSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      imgSrc: ["'self'", 'blob:', 'data:', 'https:'],
      workerSrc: ["'self'", 'blob:'],
    },
  })
);

//DEVELOPMENT LOGGING
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//LIMIT REQUESTS
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});

app.use('/api', limiter);

//BODY PARSER
app.use(express.json({
  limit: '10kb'
  //restricting the request data to be 10kb of size
}));//MiddleWare
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

//Data Sanitization against NoSQL query injection
app.use(mongoSanitize());//removes doller signs and . operators from the query and query object

//Data Sanitization against XSS
app.use(xss());

//prevent parameter pollution
app.use(hpp({
  whitelist: [
    'duration',
    'ratingsQuantity',
    'ratingsAverage',
    'maxGroupSize',
    'difficulty',
    'price'
  ]
}));

app.use(compression());

//our own middleware
// app.use((req, res, next) => {
//     console.log("Hello from the middleware 🫡");
//     next();
// });

//TEST MIDDLEWARE
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});




// //Request Handlers
// const getAllTours = (req, res) => {
//     console.log(req.requestTime);
//     res.status(200).json({
//         status: 'success',
//         requestedAt: req.requestTime,
//         results: tours.length,
//         data: {
//             tours
//         }
//     });
// }


// const getTour = (req, res) => {
//     console.log(req.params);
//     const id = req.params.id * 1;

//     if (id > tours.length) {
//         return res.status(404).json({
//             status: 'fail',
//             message: "Invalid id"
//         });
//     }
//     const tour = tours.find(el => el.id === id);
//     res.status(200).json({
//         //JSend Format
//         status: 'success',
//         data: {
//             tour
//         }
//     });
// }


// const addNewTour = (req, res) => {
//     // console.log(req.body);
//     //creating new id
//     const newId = tours[tours.length - 1].id + 1;
//     //merging id and req body
//     const newTour = Object.assign({ id: newId }, req.body);
//     //adding to the array
//     tours.push(newTour);
//     //writing the array to the file using the async version
//     fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
//         //responding by viewing the added tour
//         res.status(201).json({
//             status: "success", data: {
//                 tour: newTour
//             }
//         });
//     });
// }


// const changeTour = (req, res) => {
//     if (req.params.id * 1 > tours.length) {
//         return res.status(404).json({
//             status: 'fail',
//             message: "Invalid id"
//         });
//     }
//     res.status(200).json({
//         status: 'success',
//         data: {
//             tour: '<Updated tour here...>'
//         }
//     });
// }


// const deleteTour = (req, res) => {
//     if (req.params.id * 1 > tours.length) {
//         return res.status(404).json({
//             status: 'fail',
//             message: "Invalid id"
//         });
//     }
//     res.status(204).json({
//         status: 'success',
//         data: null
//     });
// }

// const getAllUsers = function (req, res) {
//     return res.status(500).json({
//         status: 'error',
//         message: 'This route is not yet defined'
//     });
// }

// const createUser = function (req, res) {
//     res.status(500).json({
//         status: 'error',
//         message: 'This route is not yet defined'
//     });
// }

// const updateUser = function (req, res) {
//     res.status(500).json({
//         status: 'error',
//         message: 'This route is not yet defined'
//     });
// }

// const deleteUser = function (req, res) {
//     res.status(500).json({
//         status: 'error',
//         message: 'This route is not yet defined'
//     });
// }

// const getUser = function (req, res) {
//     res.status(500).json({
//         status: 'error',
//         message: 'This route is not yet defined'
//     });
// }

// //////////////////////////////////////////////////

// // //GET Request all tours
// // app.get('/api/v1/tours', getAllTours);

// // //GET Request 1 tour
// // app.get('/api/v1/tours/:id', getTour);

// // //POST Request
// // app.post('/api/v1/tours', addNewTour);

// // //PATCH Request
// // app.patch('/api/v1/tours/:id', changeTour);

// // //Delete Request
// // app.delete('/api/v1/tours/:id', deleteTour);

// //Refactoring the http requests
// //Routes
// const tourRouter = express.Router();
// const userRouter=express.Router();

//API ROUTES
app.use('/', viewRouter);

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  // res.status(404).json({
  //     status: 'fail',
  //     message: `Cant find ${req.originalUrl} on this server!!!`
  // });

  //Creating a error object//

  // const err = new Error(`Cant find ${req.originalUrl} on this server!!!`);
  // err.status='fail';
  // err.statusCode=404;

  next(new AppError(`Cant find ${req.originalUrl} on this server!!!`, 404));
});

app.use(globalErrorHandler);

// tourRouter.route('/')
// .get(getAllTours)
// .post(addNewTour);

// tourRouter
// .route('/:id')
// .patch(changeTour)
// .get(getTour)
// .delete(deleteTour);



// userRouter
// .route('/')
// .get(getAllUsers)
// .post(createUser);

// userRouter
// .route('/:id')
// .get(getUser)
// .patch(updateUser)
// .delete(deleteUser);

module.exports = app;



