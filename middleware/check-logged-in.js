module.exports = function(req, res, next) {
    if (!req.user) {
        return res.status(403).json({
            error:true,
            message:"Login non effettuato"
        });
    }
    return next();
};
