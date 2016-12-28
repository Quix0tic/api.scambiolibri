"use strict";
const express = require("express");
var checkLoggedIn = require(__dirname + '/../middleware/check-logged-in.js');
const checkParams = (params) => (req, res, next) => {
    for (let param of params) {
        if (!req.body[param])
            res.json({ error: true, message: `param ${param} is missing` });
    }
    return next();
};
exports.router = express.Router();
var uuid = require("node-uuid");
exports.router.get("/announcements/:city", function (req, res) {
    var _city = req.params.city;
    //restituisci gli annunci della città
    req.sequelize.Announcement.findAll({
        where: {
            city: _city
        }
    }).then(function (data) {
        res.status(200).json(data);
    });
});
exports.router.route("/announcements")
    .get(function (req, res) {
    //restituisci tutti gli annunci
    req.sequelize.Announcement.findAll().then(function (data) {
        res.status(200)
            .json(data);
    });
})
    .post(checkParams(["title", "isbn", "subject", "edition", "grade", "notes", "price", "phone", "city"]), function (req, res) {
    //inserisci annuncio
    req.sequelize.Announcement.create(req.body)
        .then(function (data) {
        res.status(200).json({
            error: false,
        });
    });
});
exports.router.route("/announcement/:uuid")
    .get(function (req, res) {
    req.sequelize.Announcement.findOne({
        where: {
            uuid: req.params.uuid
        }
    }).then(function (data) {
        res.status(200).json(data);
    });
})
    .put(function (req, res) {
    //Aggiorna annuncio
    req.sequelize.Announcement.find({
        where: {
            uuid: req.params.uuid
        }
    }).then(function (data) {
        if (data) {
            data.update(req.body).then(function (data) {
                res.status(200).json({
                    error: false,
                    announcement: data
                });
            } /*, function (err) {
                    res.status(400).json({
                        error: true,
                        message: "Impossibile modificare"
                    })
                }*/);
        }
        else {
            res.json({
                error: true,
                message: "Nessun annuncio trovato"
            });
        }
    });
})
    .delete(checkLoggedIn, function (req, res) {
    //rimuovi annuncio
});
exports.router.post("/login", function (req, res) {
});
exports.router.post("/signup", function (req, res) {
    //nuovo user
    req.sequelize.User.create(req.body)
        .then(function () {
        res.status(200).json({
            error: false,
        });
    });
});
exports.router.route("/user/:uuid")
    .put(checkLoggedIn, function (req, res) {
    //Aggiorna info user
    req.sequelize.User.find({
        where: {
            uuid: req.params.uuid
        }
    }).then(function (data) {
        if (data) {
            data.update(req.body).then(function () {
                res.json({
                    error: false
                });
            });
        }
    });
});
//# sourceMappingURL=routes.js.map