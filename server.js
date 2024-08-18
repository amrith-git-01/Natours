const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const app = require('./app');


const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

const connectDB = async function () {
    try {
        await mongoose.connect(DB).then(console.log("DB connection successful!"));
    } catch (err) {
        console.log(err.message);
    }
}

connectDB();

// const tourSchema = new mongoose.Schema({
//     name: {
//         type: String,
//         required: [true, 'A tour must have a name'],
//         unique: true
//     },
//     rating: {
//         type: Number,
//         default: 4.5
//     },
//     price: {
//         type: Number,
//         required: [true, 'A tour must have a price']
//     }
// });

// const Tour = mongoose.model('Tour', tourSchema);

// const testTour = new Tour({
//     name: 'The gay Fcuker',
//     rating: 4.6,
//     price: 467
// });

// testTour.save().then(doc => {
//     console.log(doc);
// }).catch(err => {
//     console.log(err);
// });

const port = process.env.PORT;
const server = app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});



// UNHANDLED REJECTION
// closing the server and handling the app crash
process.on('unHandledRejection', err => {
    // console.log(err.name, err.message);
    console.log('UNHANDLED REJECTION!!! SHUTTING DOWN...');
    server.close(() => {
        process.exit(1);
    });
});

// UNCAUGHT EXCEPTION
process.on('uncaughtException', err => {
    // console.log(err.name, err.message);
    console.log('UNCAUGHT EXCEPTION!!! SHUTTING DOWN...');
    // console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});
// console.log(x);
