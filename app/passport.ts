import * as passport from 'passport'
import { UserModel } from './models'
var crypto = require('crypto');
import { Strategy as LocalStrategy } from 'passport-local'

export function configure(passport: passport.Passport, User: UserModel) {
  passport.serializeUser((user: any, done) => done(null, user.id))
  passport.deserializeUser((id: any, done) => {
    User.findById(id).then(foundUser => {
      if (!foundUser) { return done(new Error('user not found'), false) }
      return done(null, foundUser)
    })
  })

  //////////////////////
  //  SIGNUP STRATEGY //
  //////////////////////

  passport.use("local-signup", new LocalStrategy({
    usernameField: 'phone',
    passwordField: 'password',
    passReqToCallback: true
  }, function (req: any, phone: string, password: string, done: any) {
    User.findByPrimary(phone).then(function (foundUser) {
      if (!foundUser) { // User not found
        crypto.randomBytes(32, function (err: any, generatedSalt: any) {
          if (err) {
            return done(err);
          }
          crypto.pbkdf2(password, generatedSalt, 4096, 512, 'sha256', function (err: any, generatedHash: any) {
            User.create({
              name: req.body.name,
              phone: phone,
              passwordHash: generatedHash,
              passwordHashSalt: generatedSalt,
              city: req.body.city
            }).then(function (createdUser) {
              return done(null, createdUser);
            }, function (err) {
              console.info("ERROR signing-up")
              return done(null, false);
            });
          });
        });
      } else { // User already registered
        console.info("User already registered")
        return done(null, false);
      }
    }, function (err) {
      console.info("ERROR while searching")
      return done(err);
    });
  }))

  //////////////////////
  //  LOGIN STRATEGY  //
  //////////////////////

  passport.use('local-login', new LocalStrategy({
    usernameField: 'phone',
    passwordField: 'password',
    passReqToCallback: true
  }, function (req: any, phone: string, password: string, done: any) {
    User.findByPrimary(phone).then(function (foundUser: any) {
      if (foundUser) { // User is found
        crypto.pbkdf2(password, foundUser.passwordHashSalt, 4096, 512, 'sha256', function (err: any, generatedHash: any) {
          if (err) {
            return done(err);
          } // Error in generating hash
          if (generatedHash.toString('hex') == foundUser.passwordHash.toString('hex')) {
            return done(null, foundUser);
          } else {
            return done(null, false);
          }
        });
      } else { // User is not found
        console.info("User not found")
        return done(null, false);
      }
    }, function (err) {
      console.info("ERROR while searching")
      return done(err);
    })
  }))
}
