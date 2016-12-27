import * as express from 'express'
import * as debug from 'debug'
import { MyRequest } from './app'

const checkParams = (params: string[]) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
    for (let param of params) {
        if (!req.body[param]) return next(new Error(`param ${param} is missing`))
    }
    return next()
}

export var router = express.Router();
var uuid = require("node-uuid");

router.get("/announcements/:city", async (req: MyRequest, res) => {
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
    .get(async (req: MyRequest, res) => {
        //restituisci tutti gli annunci
        req.sequelize.Announcement.findAll().then(function (data) {
            res.status(200)
                .json(data)
        })
    })
    .post(checkParams(["title", "isbn", "subject", "edition", "grade", "notes", "price", "phone", "city"]),
    async (req: MyRequest, res) => {
        //inserisci annuncio
        req.sequelize.Announcement.create({
            title: req.body.title,
            isbn: req.body.isbn,
            subject: req.body.subject,
            edition: req.body.edition,
            grade: req.body.grade,
            notes: req.body.notes,
            price: req.body.price,
            phone: req.body.phone,
            city: req.body.city
        }).then(function () {
            res.json({
                error: false,
            })
        })

    })
router.route("/announcement/:uuid")
    .get(async (req: MyRequest, res) => {
        req.sequelize.Announcement.findOne({
            where: {
                uuid: req.params.uuid
            }
        }).then(async (data) => {
            res.status(200).json(data)
        })
    })
    .put(async (req: MyRequest, res) => {
        //modifica annuncio

        req.sequelize.Announcement.find({
            where: {
                uuid: req.params.uuid
            }
        }).done(function (data) {
            if (data) {
                data.update(req.body).then(function(){
                    res.json({
                        error: false
                    })
                })
            }
        })
    })
    .delete(async (req: MyRequest, res) => {
        //rimuovi annuncio
    })
