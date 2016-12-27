'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const express = require("express");
const SequelizeModule = require("./models");
const debug = require("debug");
const bodyParser = require("body-parser");
const routes_1 = require("./routes");
class ApiServer {
    constructor(port) {
        this._configure = () => {
            this._express.use(bodyParser.json());
            this._express.use((req, _, next) => {
                req.sequelize = this._database;
                return next();
            });
        };
        this._routes = () => {
            this._express.use('', routes_1.router);
        };
        this.start = () => __awaiter(this, void 0, void 0, function* () {
            this._configure();
            this._routes();
            this._express.listen(this._port, () => {
                console.log('Listening port ' + this._port);
            });
            yield this._database.start();
        });
        this.stop = () => __awaiter(this, void 0, void 0, function* () {
        });
        this._port = port;
        //crea l'istanza del db
        this._database = new SequelizeModule.SequelizeDatabase((process.env.NODE_ENV === 'production') ? {
            username: process.env.POSTGRES_USER || 'api',
            password: process.env.POSTGRES_PASSWORD || '',
            database: process.env.POSTGRES_DB || 'api',
            host: 'postgres',
            dialect: 'postgres',
            logging: debug('sequelize:db')
        } : {
            dialect: 'postgres',
            storage: './db.postgres',
            logging: debug('postgres:db')
        });
        this._express = express();
    }
}
exports.ApiServer = ApiServer;
//# sourceMappingURL=app.js.map