"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const express = require("express");
const checkParams = (params) => (req, res, next) => {
    for (let param of params) {
        if (!req.query[param])
            return next(new Error(`param ${param} is missing`));
    }
    return next();
};
exports.router = express.Router();
exports.router.route("/announcements/:city")
    .get((req, res) => __awaiter(this, void 0, void 0, function* () {
    var _city = req.params.city;
    if (_city) {
        //restituisci gli annunci della città
        req.sequelize.Announcement.findAll({
            where: {
                city: _city
            }
        }).then(function (data) {
            res.status(200)
                .json(data);
        });
    }
    else {
        //restituisci tutti gli annunci
        req.sequelize.Announcement.findAll().then(function (data) {
            res.status(200)
                .json(data);
        });
    }
}))
    .post(checkParams([]), function (req, res) {
    //Aggiungi un annuncio
    if (req.body instanceof Array) {
    }
});
exports.router.route("/announcement/:uuid")
    .get(function (req, res) {
    res.json({
        message: "Coglione destro"
    });
})
    .put(function (req, res) {
})
    .delete(function (req, res) {
});
//# sourceMappingURL=routes.js.map