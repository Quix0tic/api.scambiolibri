import * as express from 'express'
import * as debug from 'debug'
import { MyRequest } from './app'

export var uiRouter = express.Router()

uiRouter.get("/", function (req: MyRequest, res, next: express.NextFunction) {
    if (!req.user) {
        res.redirect("/login")
    }
})

uiRouter.get("/login", function (req, res, next: express.NextFunction) {
    res.render('index', {
        user: req.user,
        error: req.flash('login-error'),
    })
})
