import * as passport from 'passport'
import { UserModel, UserInstance } from './models'
import * as crypto from 'crypto'
import { Strategy as LocalStrategy, VerifyFunctionWithRequest, IVerifyOptions } from 'passport-local'

export function configure(passport: passport.Passport, User: UserModel) {
  passport.serializeUser((user: UserInstance, done) => done(null, user.get().phone))
  passport.deserializeUser((phone: any, done) => {
    User.findByPrimary(phone).then(foundUser => {
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
              return done(err);
            });
          });
        });
      } else { // User already registered
        console.info("User already registered")
        return done(null, false, 403);
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
  }, function (req: any, phone: string, password: string, done: (error: any, user?: any, options?: IVerifyOptions) => void) {
    User.findByPrimary(phone).then(function (foundUser: any) {
      if (foundUser) { // User is found
        crypto.pbkdf2(password, foundUser.passwordHashSalt, 4096, 512, 'sha256', function (err: any, generatedHash: any) {
          if (err) {
            return done(err);
          } // Error in generating hash
          if (generatedHash.toString('hex') == foundUser.passwordHash.toString('hex')) {
            return done(null, foundUser);
          } else {
            console.info("Password errata")
            return done(null, false, {message:"Password errata"});
          }
        });
      } else { // User is not found
        console.info("User not found")
        return done(null, false, {message:"Utente non registrato"});
      }
    }, function (err) {
      console.info("ERROR while searching")
      return done(err);
    })
  }))
}
