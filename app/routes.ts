import * as express from 'express'
import * as debug from 'debug'
import { MyRequest } from './app'
var checkLoggedIn = require(__dirname + '/../middleware/check-logged-in.js');
import { UserInstance, AnnouncementInstance, AnnouncementModel } from './models'
import { SequelizeStatic } from 'sequelize'

import * as admin from "firebase-admin";

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: "iquadri-7a38c",
    clientEmail: "firebase-adminsdk-ugnr0@iquadri-7a38c.iam.gserviceaccount.com",
    privateKey: process.env.FCM_KEY as string
  }),
  databaseURL: "https://<DATABASE_NAME>.firebaseio.com"
});

const checkParams = (params: string[]) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
    for (let param of params) {
        if (!req.body[param]) res.json({ error: true, message: `param ${param} is missing` })
    }
    return next()
}

export var router = express.Router();
var passport = require('passport');

router.get("/announcements/:city", function (req: MyRequest, res, next: express.NextFunction) {
    req.sequelize.db.query("SELECT uuid,title,isbn,subject,edition,grade,notes,price,phone,city,\"createdAt\",\"updatedAt\" FROM announcements WHERE LOWER(city)=LOWER(?)", { model: req.sequelize.Announcement, replacements: [req.params.city] }).then(data => res.json(data))
})

router.route("/announcements")

    //////////////////////////
    //  GET /announcements  //
    //////////////////////////

    .get(checkLoggedIn, function (req: MyRequest, res, next: express.NextFunction) {
        req.sequelize.Announcement.findAll({
            where: { city: req.user.get().city },
            order: [['createdAt', 'DESC']]
        }).then(function (data) {
            res.status(200)
                .json(data)
        }, e => next(e))
    })

    //////////////////////////      //
    //  POST /announcements //      //  NEED LOGIN
    //////////////////////////      //
    .post(checkLoggedIn, checkParams(["title", "isbn", "subject", "edition", "grade", "notes", "price"]),
    function (req: MyRequest, res, next: express.NextFunction) {
        //inserisci annuncio
        req.sequelize.Announcement.create({
            title: req.body.title,
            isbn: req.body.isbn,
            subject: req.body.subject,
            edition: req.body.edition,
            grade: req.body.grade,
            notes: req.body.notes,
            price: req.body.price,
            phone: req.user.get().phone,
            city: req.user.get().city
        })
            .then(function (data) {
                res.status(200).json({
                    error: false,
                    announcement: data
                })
                notification(data.city, data.isbn, data.title)
            }, e => next(e))
    })



function notification(city: String, isbn: string, title: string) {
    admin.messaging().sendToTopic(city.toLowerCase().concat("_", isbn), { notification: { title: "Libri disponibili", body: 'È disponibile il libro "' + title + '"' } })
        .then(v => console.log("Notification sent"))
        .catch(e => console.log("Notification not sent: " + e))

}

router.get("/user/announcements", checkLoggedIn, function (req: MyRequest, res, next: express.NextFunction) {

    //////////////////////////////      //
    //  GET /user/announcements //      //  NEED LOGIN
    //////////////////////////////      //

    req.sequelize.Announcement.findAll({
        where: { phone: req.user.get().phone },
        order: [['createdAt', 'DESC']]
    })
        .then(function (data) {
            res.status(200).json(data)
        }, e => next(e))
})

router.route("/announcement/:uuid")

    //////////////////////////////
    //  GET /announcement/:uuid //
    //////////////////////////////

    .get(function (req: MyRequest, res, next: express.NextFunction) {
        req.sequelize.Announcement.findByPrimary(req.params.uuid).then(function (data) {
            if (data) {
                res.status(200).json(data)
            } else {
                res.status(400).json({ error: true, message: 'Nessun annuncio trovato' })
            }
        }, e => next(e))
    })

    //////////////////////////////      //
    //  PUT /announcement/:uuid //      //  NEED LOGIN
    //////////////////////////////      //

    .put(checkLoggedIn, function (req: MyRequest, res, next: express.NextFunction) {
        //Edit announcement
        req.sequelize.Announcement.findByPrimary(req.params.uuid).then(function (data) {
            if (data) {     //Announcio trovato
                if (data.get().phone == req.user.get().phone) { //L'utente sta modificando un suo annuncio
                    data.update(req.body).then(function (data) {
                        res.status(200).json({
                            error: false
                        })
                    }, e => next(e))
                } else {
                    res.status(403).json({ error: true, message: 'Non puoi modificare annunci altrui!' })
                }
            } else {
                res.status(400).json({ error: true, message: 'Nessun annuncio trovato' })
            }
        }, e => next(e))
    })

    //////////////////////////////////      //
    //  DELETE /announcement/:uuid  //      //  NEED LOGIN
    //////////////////////////////////      //

    .delete(checkLoggedIn, function (req: MyRequest, res, next: express.NextFunction) {
        //Remove announcement
        req.sequelize.Announcement.findByPrimary(req.params.uuid).then(function (data) {
            if (data) {
                if (data.get().phone == req.user.get().phone) {//L'utente sta eliminando un suo annuncio
                    data.destroy().then(function () {
                        res.status(200).json({
                            error: false
                        })
                    }, e => next(e))
                } else {
                    res.status(403).json({ error: true, message: 'Non puoi modificare annunci altrui!' })
                }
            } else {
                res.status(400).json({ error: true, message: 'Nessun annuncio trovato' })
            }
        }, e => next(e))
    })


router.post("/login", checkParams(["phone", "password"]), function (req: MyRequest, res, next: express.NextFunction) {

    //////////////////
    //  POST /login //
    //////////////////

    passport.authenticate('local-login', function (err: any, user: UserInstance) {
        if (err) {
            res.status(400).json({ error: true, message: err });
        } // Error inside login strategy
        if (!user) {
            return res.status(401).json({ error: true, message: 'Login fallito' })
        } // User not signed up
        req.login(user, function (err) {
            if (err) {
                return next(err);
            }
            return res.status(200).json({
                error: false, message: "Login riuscito", user: {
                    name: user.get().name,
                    city: user.get().city,
                    updatedAt: user.get().updatedAt!,
                    createdAt: user.get().createdAt!
                }
            });
        })
    })(req, res, next);
})

router.post("/signup", checkParams(["name", "phone", "password", "city"]), function (req: MyRequest, res, next: express.NextFunction) {

    //////////////////////
    //  POST /signup    //
    //////////////////////

    passport.authenticate('local-signup', function (err: any, user: UserInstance) {
        if (err) {
            res.status(400).json({ error: true, message: err });
        } // Error inside login strategy
        if (!user) {
            return res.status(401).json({ error: true, message: 'Registrazione fallita' })
        } // User not signed up
        req.login(user, function (err) {
            if (err) {
                return next(err);
            }
            return res.status(200).json({
                error: false, user: {
                    name: user.get().name,
                    city: user.get().city,
                    updatedAt: user.get().updatedAt!,
                    createdAt: user.get().createdAt!
                }
            }) // User successfully signed up
        });
    })(req, res, next);
})

///////////////////      //
//  PUT /user    //      //  NEED LOGIN
///////////////////      //

router.put("/user", checkLoggedIn, function (req: MyRequest, res, next: express.NextFunction) {
    //Edit user
    req.sequelize.User.findByPrimary(req.user.get().phone).then(function (data) {
        if (data) {
            data.update(req.body).then(function () {
                res.json({
                    error: false
                })
            }, e => next(e))
        } else {
            res.status(400).json({ error: true, message: 'Nessun user trovato' })
        }
    }, e => next(e))
})

//////////////////////////
//  GET /user/:phone    //
//////////////////////////

router.get("/user/:phone", function (req: MyRequest, res, next: express.NextFunction) {
    //Edit user
    req.sequelize.User.findOne({
        attributes: ["uuid", "name", "phone", "city", "updatedAt", "createdAt"],
        where: {
            phone: req.params.phone
        }
    }).then(function (data) {
        if (data) {
            res.status(200).json(data)
        } else {
            res.status(400).json({})
        }
    }, e => next(e))
})