import * as express from 'express'
import * as debug from 'debug'
import { MyRequest } from './app'

const checkParams = (params: string[]) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
    for (let param of params) {
        if (!req.query[param]) return next(new Error(`param ${param} is missing`))
    }
    return next()
}
const _log = debug('api:router')
export var router = express.Router();

router.route("/announcements/:city")
    .get(async (req: MyRequest, res) => {
        var _city = req.params.city;
        if (_city) {
            //restituisci gli annunci della città
            req.sequelize.Announcement.findAll({
                where: {
                    city: _city
                }
            }).then(function(data){
                res.status(200)
                .json(data)
            })
        } else {
            //restituisci tutti gli annunci
            req.sequelize.Announcement.findAll().then(function(data){
                res.status(200)
                .json(data)
            })
        }
    })
    .post(checkParams([]), function (req: MyRequest, res) {
        //Aggiungi un annuncio
        if(req.body instanceof Array){

        }
    })
router.route("/announcement/:uuid")
    .get(function (req: MyRequest, res) {
        res.json({
            message: "Coglione destro"
        })
    })
    .put(function (req: MyRequest, res) {

    })
    .delete(function (req: MyRequest, res) {

    })