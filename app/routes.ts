import * as express from 'express'
import * as debug from 'debug'
import { MyRequest } from './app'
var checkLoggedIn = require(__dirname + '/../middleware/check-logged-in.js');

const checkParams = (params: string[]) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
    for (let param of params) {
        if (!req.body[param]) return next(new Error(`param ${param} is missing`))
    }
    return next()
}

export var router = express.Router();
var uuid = require("node-uuid");

router.get("/announcements/:city", function (req: MyRequest, res) {
    var _city = req.params.city;
    //restituisci gli annunci della città
    req.sequelize.Announcement.findAll({
        where: {
            city: _city
        }
    }).then(async (data) => {
        res.status(200)
            .json(data)
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
    async (req: MyRequest, res) => {
        //inserisci annuncio
        req.sequelize.Announcement.create(req.body)
            .then(function () {
                res.json({
                    error: false,
                })
            })

    })
router.route("/announcement/:uuid")
    .get(function (req: MyRequest, res) {
        req.sequelize.Announcement.findOne({
            where: {
                uuid: req.params.uuid
            }
        }).then(async (data) => {
            res.status(200).json(data)
        })
    })
    .put(function (req: MyRequest, res) {
        //Aggiorna annuncio
        req.sequelize.Announcement.find({
            where: {
                uuid: req.params.uuid
            }
        }).then(function (data) {
            if (data) {     //Announcio trovato
                data.update(req.body).then(function (data) {
                    res.json({
                        error: false,
                        announcement: data
                    })
                })
            }else{          //Annuncio non trovato 
                res.json({
                        error: true,
                        message: "Nessun annuncio trovato"
                    })
            }
        })
    })
    .delete(checkLoggedIn, function (req: MyRequest, res) {
        //rimuovi annuncio
    })

router.post("/login", function (req: MyRequest, res) {

})
router.post("/signup", function (req: MyRequest, res) {
    //nuovo user
})
router.route("/user/:uuid")
    .put(checkLoggedIn, function (req: MyRequest, res) {
        //Aggiorna info user
        req.sequelize.User.find({
            where: {
                uuid: req.params.uuid
            }
        }).done(function (data) {
            if (data) {
                data.update(req.body).then(function () {
                    res.json({
                        error: false
                    })
                })
            }
        })
    })
