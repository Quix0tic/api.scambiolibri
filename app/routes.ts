import * as express from 'express'
import * as debug from 'debug'
import { MyRequest } from './app'
var checkLoggedIn = require(__dirname + '/../middleware/check-logged-in.js');

const checkParams = (params: string[]) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
    for (let param of params) {
        if (!req.body[param]) res.json({ error: true, message: `param ${param} is missing` })
    }
    return next()
}

export var router = express.Router();
var uuid = require("node-uuid");

router.get("/announcements/:city", function (req: MyRequest, res, next: express.NextFunction) {
    var _city = req.params.city;
    //restituisci gli annunci della città
    req.sequelize.Announcement.findAll({
        attributes:["uuid","title","isbn","price"],
        where: {
            city: _city
        }
    }).then(function (data) {
        res.status(200).json(data)
    }, e => next(e))
})
router.route("/announcements")
    .get(function (req: MyRequest, res, next: express.NextFunction) {
        //restituisci tutti gli annunci
        req.sequelize.Announcement.findAll({attributes:["uuid","title","isbn","price"]}).then(function (data) {
            res.status(200)
                .json(data)
        }, e => next(e))
    })
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
    .get(function (req: MyRequest, res, next: express.NextFunction) {
        req.sequelize.Announcement.findByPrimary(req.params.uuid).then(function (data) {
            if(data){
                res.status(200).json(data)
            }else{
                res.status(400).json(data)
            }
        }, e => next(e))
    })
    .put(function (req: MyRequest, res, next: express.NextFunction) {
        //Edit announcement
        req.sequelize.Announcement.findByPrimary(req.params.uuid).then(function (data) {
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
    .delete(checkLoggedIn, function (req: MyRequest, res, next: express.NextFunction) {
        //Remove announcement
    })

router.post("/login", function (req: MyRequest, res, next: express.NextFunction) {

})
router.post("/signup", function (req: MyRequest, res, next: express.NextFunction) {
    //nuovo user
    req.sequelize.User.create(req.body)
        .then(function () {
            res.status(200).json({
                error: false,
            })
        }, e => next(e))

})
router.route("/user/:uuid")
    .put(checkLoggedIn, function (req: MyRequest, res, next: express.NextFunction) {
        //Edit user
        req.sequelize.User.findOne({
            where: {
                uuid: req.params.uuid
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
