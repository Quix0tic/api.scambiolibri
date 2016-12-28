// Executed at every request to insert user object inside req variable
module.exports = function(User) {
    var deserialize = function(id, done) {
        User.findById(id).then(function(foundUser) {
            return done(null, foundUser);
        }, function(err) {
            return done(err);
        });
    };
    return deserialize;
};
