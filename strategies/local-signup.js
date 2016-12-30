// Signup strategy
var LocalStrategy = require('passport-local');
var crypto = require('crypto');
module.exports = function (User) {
    var signUpStrategy = new LocalStrategy({
        usernameField: 'phone',
        passwordField: 'password',
        passReqToCallback: true
    }, function (req, phone, password, done) {
        User.findByPrimary(phone).then(function (foundUser) {
            if (!foundUser) { // User not found
                crypto.randomBytes(32, function (err, generatedSalt) {
                    if (err) {
                        return done(err);
                    }
                    crypto.pbkdf2(password, generatedSalt, 4096, 512, 'sha256', function (err, generatedHash) {
                        User.create({
                            name: req.body.name,
                            phone: phone,
                            passwordHash: generatedHash,
                            passwordHashSalt: generatedSalt,
                            city: req.body.city
                        }).then(function (createdUser) {
                            return done(null, createdUser);
                        }, function (err) {
                            return done(null, false);
                        });
                    });
                });
            } else { // User already registered
                return done(null, false);
            }
        }, function (err) {
            return done(err);
        });
    });
    return signUpStrategy;
};