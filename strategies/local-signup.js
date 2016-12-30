// Signup strategy
var LocalStrategy = require('passport-local');
var crypto = require('crypto');
module.exports = function(User) {
    var signUpStrategy = new LocalStrategy({
        usernameField : 'phone',
        passwordField : 'password',
        passReqToCallback: true
    }, function(req, phone, password, done) {
        User.findOne({
            where: {
                phone: phone
            }
        }).then(function(foundUser) {
            /*if (!foundUser) { // User not found
                
            } else { // User already registered
                req.flash('signup-error', 'Sorry. This username is already taken by someone else.');
                return done(null, false);
            }*/
        }, function(err) {
            crypto.randomBytes(32, function(err, generatedSalt) {
                    if (err) {
                        return done(err);
                    }
                    crypto.pbkdf2(password, generatedSalt, 4096, 512, 'sha256', function(err, generatedHash) {
                        User.create({
                            phone: phone,
                            name: req.body.name,
                            passwordHash: generatedHash,
                            passwordHashSalt: generatedSalt,
                            city: req.body.city
                        }).then(function(createdUser) {
                            return done(null, createdUser);
                        }, function(err) {
                            //req.flash('signup-error', err);
                            return done(null, false);
                        });
                    });
                });
            //return done(err);
        });
    });
    return signUpStrategy;
};
