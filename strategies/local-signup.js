// Signup strategy
var LocalStrategy = require('passport-local');
var crypto = require('crypto');
module.exports = function(User) {
    var signUpStrategy = new LocalStrategy({
        passReqToCallback: true
    }, function(req, username, password, done) {
        User.findOne({
            where: {
                username: username
            }
        }).then(function(foundUser) {
            if (!foundUser) { // User not found
                crypto.randomBytes(32, function(err, generatedSalt) {
                    if (err) {
                        return done(err);
                    }
                    crypto.pbkdf2(password, generatedSalt, 4096, 512, 'sha256', function(err, generatedHash) {
                        User.create({
                            username: username,
                            firstName: req.body.first_name,
                            lastName: req.body.last_name,
                            email: req.body.email,
                            passwordHash: generatedHash,
                            passwordHashSalt: generatedSalt
                        }).then(function(createdUser) {
                            return done(null, createdUser);
                        }, function(err) {
                            req.flash('signup-error', err);
                            return done(null, false);
                        });
                    });
                });
            } else { // User already registered
                req.flash('signup-error', 'Sorry. This username is already taken by someone else.');
                return done(null, false);
            }
        }, function(err) {
            return done(err);
        });
    });
    return signUpStrategy;
};
