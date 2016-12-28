module.exports = function(req, res, next) {
    if (!req.user) {
        return res.json({
            error:true,
            message:"Login non effettuato"
        });
    }
    return next();
};
