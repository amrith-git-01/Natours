module.exports = fn => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
        //next here call the global error handling middleware
    }
}