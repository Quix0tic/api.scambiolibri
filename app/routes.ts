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
