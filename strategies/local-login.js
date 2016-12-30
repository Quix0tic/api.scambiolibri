// Login strategy
var LocalStrategy = require('passport-local');
var crypto = require('crypto');
module.exports = function(User) {
    var loginStrategy = new LocalStrategy({
        usernameField : 'phone',
        passwordField : 'password',
        passReqToCallback: true
    }, function(req, phone, password, done) {
        User.findOne({
            where: {
                phone: phone
            }
        }).then(function(foundUser) {
            if (foundUser) { // User is found
                crypto.pbkdf2(password, foundUser.passwordHashSalt, 4096, 512, 'sha256', function(err, generatedHash) {
                    if (err) {
                        return done(err);
                    } // Error in generating hash
                    if (generatedHash.toString('hex') == foundUser.passwordHash.toString('hex')) {
                        return done(null, foundUser);
                    } else {
                        req.flash('login-error', 'Oops! Wrong password.');
                        return done(null, false);
                    }
                });
            } else { // User is not found
                req.flash('login-error', 'Oops! This username isn\' registered.');
                return done(null, false);
            }
        }, function(err) {
            return done(err);
        })
    });
    return loginStrategy;
};
