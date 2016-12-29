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

router.get("/announcements/:city", checkLoggedIn, function (req: MyRequest, res) {
    var _city = req.params.city;
    //restituisci gli annunci della città
    req.sequelize.Announcement.findAll({
        where: {
            city: _city
        }
    }).then(function (data) {
        res.status(200).json(data)
    })
})
router.route("/announcements")
    .get(function (req: MyRequest, res) {
        //restituisci tutti gli annunci
        req.sequelize.Announcement.findAll().then(function (data) {
            res.status(200)
                .json(data)
        })
    })
    .post(checkParams(["title", "isbn", "subject", "edition", "grade", "notes", "price", "phone", "city"]),
    function (req: MyRequest, res) {
        //inserisci annuncio
        req.sequelize.Announcement.create(req.body)
            .then(function (data) {
                res.status(200).json({
                    error: false,
                })
            })

    })
router.route("/announcement/:uuid")
    .get(function (req: MyRequest, res, next: express.NextFunction) {
        req.sequelize.Announcement.findByPrimary(req.params.uuid).then(function (data) {
            res.status(200).json(data)
        })
    })
    .put(function (req: MyRequest, res) {
        //Edit announcement
        req.sequelize.Announcement.findByPrimary(req.params.uuid).then(function (data) {
            if (data) {     //Announcio trovato
                data.update(req.body).then(function (data) {
                    res.status(200).json({
                        error: false,
                        announcement: data
                    })
                })
            }
        })
    })
    .delete(checkLoggedIn, function (req: MyRequest, res) {
        //Remove announcement
    })

router.post("/login", function (req: MyRequest, res) {

})
router.post("/signup", function (req: MyRequest, res) {
    //nuovo user
    req.sequelize.User.create(req.body)
        .then(function () {
            res.status(200).json({
                error: false,
            })
        })

})
router.route("/user/:uuid")
    .put(checkLoggedIn, function (req: MyRequest, res) {
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
                })
            }
        })
    })
