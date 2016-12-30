module.exports = function(user, done) {
    return done(null, user.phone);
};
