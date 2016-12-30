import * as express from 'express'
import * as debug from 'debug'
import { MyRequest } from './app'
var checkLoggedIn = require(__dirname + '/../middleware/check-logged-in.js');
import { UserInstance, AnnouncementInstance } from './models'

const checkParams = (params: string[]) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
    for (let param of params) {
        if (!req.body[param]) res.json({ error: true, message: `param ${param} is missing` })
    }
    return next()
}

export var router = express.Router();
var uuid = require("node-uuid");
var passport = require('passport');


router.get("/announcements/:city", function (req: MyRequest, res, next: express.NextFunction) {
    var _city = req.params.city;

    //////////////////////////////////
    //  GET /announcements/:city    //
    //////////////////////////////////

    req.sequelize.Announcement.findAll({
        attributes: ["uuid", "title", "isbn", "price"],
        where: {
            city: _city
        }
    }).then(function (data) {
        res.status(200).json(data)
    }, e => next(e))
})
router.route("/announcements")

    //////////////////////////
    //  GET /announcements  //
    //////////////////////////

    .get(function (req: MyRequest, res, next: express.NextFunction) {
        //restituisci tutti gli annunci
        req.sequelize.Announcement.findAll({ attributes: ["uuid", "title", "isbn", "price", "city"] }).then(function (data) {
            res.status(200)
                .json(data)
        }, e => next(e))
    })

    //////////////////////////
    //  POST /announcements //
    //////////////////////////

    .post(checkParams(["title", "isbn", "subject", "edition", "grade", "notes", "price", "phone", "city"]),
    function (req: MyRequest, res, next: express.NextFunction) {
        //inserisci annuncio
        req.sequelize.Announcement.create(req.body)
            .then(function (data) {
                res.status(200).json({
                    error: false,
                })
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
                res.status(400).json(data)
            }
        }, e => next(e))
    })

    //////////////////////////////      //
    //  PUT /announcement/:uuid //      //  NEED LOGIN
    //////////////////////////////      //

    .put(function (req: MyRequest, res, next: express.NextFunction) {
        //Edit announcement
        req.sequelize.Announcement.findByPrimary(req.params.uuid, {
            where: {}
        }).then(function (data) {
            if (data) {     //Announcio trovato
                data.update(req.body).then(function (data) {
                    res.status(200).json({
                        error: false,
                        announcement: data
                    })
                }, e => next(e))
            }
        }, e => next(e))
    })

    //////////////////////////////////      //
    //  DELETE /announcement/:uuid  //      //  NEED LOGIN
    //////////////////////////////////      //

    .delete(checkLoggedIn, function (req: MyRequest, res, next: express.NextFunction) {
        //Remove announcement
        req.sequelize.Announcement.destroy({ where: { uuid: req.params.uuid } }).then(function (announcementsRemoved) {
            res.status(200).json({ error: false })
        }, e => next(e))
    })


router.post("/login", function (req: MyRequest, res, next: express.NextFunction) {

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
            return res.status(200).cookie('api.key', user).json({ error: false, message: "Login riuscito" });
        })
    })(req, res, next);
})

router.post("/signup", function (req: MyRequest, res, next: express.NextFunction) {

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
            return res.status(200).cookie('api.key', user).json({ error: false, message: 'Registrazione avvenuta' }) // User successfully signed up
        });
    })(req, res, next);
})
router.route("/user/:phone")

    //////////////////////////
    //  PUT /user/:phone    //
    //////////////////////////

    .put(checkLoggedIn, function (req: MyRequest, res, next: express.NextFunction) {
        //Edit user
        req.sequelize.User.findOne({
            where: {
                attributes: ["uuid", "name", "phone", "city"],
                phone: req.params.phone
            }
        }).then(function (data) {
            if (data) {
                data.update(req.body).then(function () {
                    res.json({
                        error: false
                    })
                }, e => next(e))
            }
        }, e => next(e))
    })

    //////////////////////////
    //  GET /user/:phone    //
    //////////////////////////

    .get(function (req: MyRequest, res, next: express.NextFunction) {
        //Edit user
        req.sequelize.User.findOne({
            attributes: ["uuid", "name", "phone", "city"],
            where: {
                phone: req.params.phone
            }
        }).then(function (data) {
            if (data) {
                data.update(req.body).then(function () {
                    res.json({
                        error: false
                    })
                }, e => next(e))
            }
        }, e => next(e))
    })


router.get("/users", function (req: MyRequest, res, next: express.NextFunction) {

    //////////////////////////
    //  PUT /user/:phone    //
    //////////////////////////

    req.sequelize.User.findAll({ attributes: ["name", "phone"] }).then(function (data) {
        res.status(200).json(data)
    }, e => next(e))
})