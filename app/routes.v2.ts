import * as express from 'express'
import * as debug from 'debug'
import { MyRequest } from './app'
var checkLoggedIn = require(__dirname + '/../middleware/check-logged-in.js');
import { UserInstance, AnnouncementInstance, AnnouncementModel } from './models'
import { SequelizeStatic } from 'sequelize'
import * as request from 'request'
import * as passport from 'passport'

const checkParams = (params: string[]) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
    for (let param of params) {
        if (!req.body[param]) res.status(400).json({ error: true, message: `param ${param} is missing` })
    }
    return next()
}

export var router = express.Router();

router.get("/announcements/:city", function (req: MyRequest, res, next: express.NextFunction) {
    req.sequelize.db.query("SELECT announcements.*, temp.name FROM announcements INNER JOIN (SELECT name, phone FROM users WHERE LOWER(city)=?) AS temp ON announcements.phone = temp.phone ORDER BY \"updatedAt\" DESC",
        { replacements: [req.params.city.toLowerCase()], type: "SELECT" }).then(results => res.json(results))
})

router.route("/announcements")

    //////////////////////////
    //  GET /announcements  //
    //////////////////////////

    .get(checkLoggedIn, function (req: MyRequest, res, next: express.NextFunction) {
        req.sequelize.db.query("SELECT announcements.*, temp.name FROM announcements INNER JOIN (SELECT name, phone FROM users WHERE LOWER(city)=?) AS temp ON announcements.phone = temp.phone ORDER BY \"updatedAt\" DESC",
            { replacements: [req.user.get().city.toLowerCase()], type: "SELECT" })
            .then(data => res.json(data))
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
            phone: req.user.get().phone
        })
            .then(function (data) {
                res.status(200).json({
                    error: false,
                    announcement: data
                })
                notification(req.user.get().city, data.isbn, data.title)
            }, e => next(e))
    })



function notification(city: String, isbn: string, title: string) {
    request.post("https://fcm.googleapis.com/fcm/send", {
        json: true,
        body: {
            to: "/topics/" + city.toLowerCase() + "_" + isbn,
            data: {
                title: "Libri disponibili",
                body: 'È disponibile il libro "' + title + '"',
                isbn: isbn
            }
        },
        headers: { 'Content-Type': 'application/json', 'Authorization': 'key='.concat(process.env.FCM_KEY) }
    })
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
        req.sequelize.Announcement.findByPrimary(req.params.uuid, { include: [req.sequelize.User] }).then(function (data) {
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
                        res.status(200).send()
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
                        res.status(200).json({ error: false })
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

    passport.authenticate('local-login', function (err: any, user: UserInstance, authInfo: any) {
        if (err) {
            res.status(400).json({ error: true, message: err });
        } // Error inside login strategy
        if (!user) {
            return res.status(401).json({ error: true, message: authInfo.message })
        } // User not signed up
        req.login(user, function (err) {
            if (err) {
                return next(err);
            }
            return res.status(200).json({
                name: user.get().name,
                city: user.get().city,
                updatedAt: user.get().updatedAt!,
                createdAt: user.get().createdAt!
            });
        })
    })(req, res, next);
})

router.post("/signup", checkParams(["name", "phone", "password", "city"]), function (req: MyRequest, res, next: express.NextFunction) {

    //////////////////////
    //  POST /signup    //
    //////////////////////

    passport.authenticate('local-signup', function (err: any, user: UserInstance, status: number) {
        if (err) {
            res.status(400).json({ error: true, message: err });
        } // Error inside login strategy
        if (!user) {
            return res.status(status).json({ error: true, message: 'Utente già registrato' })
        } // User not signed up
        req.login(user, function (err) {
            if (err) {
                return next(err);
            }
            return res.status(200).json({
                name: user.get().name,
                city: user.get().city,
                updatedAt: user.get().updatedAt!,
                createdAt: user.get().createdAt!

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