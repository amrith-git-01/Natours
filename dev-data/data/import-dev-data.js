const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const Tour = require('./../../models/tourModel');
const User = require('./../../models/userModel');
const Review = require('./../../models/reviewModel');
dotenv.config({ path: './../../config.env' });



const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

const connectDB = async function () {
    try {
        await mongoose.connect(DB).then(console.log("DB connection successful!"));
    } catch (err) {
        console.log(err.message);
    }
}

connectDB();

//READING JSON FILE
const tours = JSON.parse(fs.readFileSync('tours.json', 'utf-8'));
const users = JSON.parse(fs.readFileSync('users.json', 'utf-8'));
const reviews = JSON.parse(fs.readFileSync('reviews.json', 'utf-8'));

//IMPORT DATA INTO DATABASE
const importData = async () => {
    try {
        await Tour.create(tours);
        await User.create(users, {validateBeforeSave: false});
        await Review.create(reviews);
        console.log('Data successfully loaded');
    } catch (err) {
        console.log(err);
    }
    process.exit();
}

//DELETE ALL DATA FROM DB
const deleteData = async () => {
    try {
        await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log('Data successfully deleted');
    } catch (err) {
        console.log(err);
    }
    process.exit();
}

if (process.argv[2] === '--import') {
    importData();
} else if (process.argv[2] === '--delete') {
    deleteData();
}

//LISTS ALL THE ONGOING PROCESSES
// console.log(process.argv);