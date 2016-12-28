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
const session = require("express-session");
const passport = require("passport");
const bodyParser = require("body-parser");
const routes_1 = require("./routes");
var SequelizeStore = require('connect-session-sequelize')(session.Store);
var cookieParser = require('cookie-parser');
class ApiServer {
    constructor(port) {
        this.start = () => __awaiter(this, void 0, void 0, function* () {
            var sessionStore = new SequelizeStore({
                db: this._database
            });
            this._express.use(bodyParser.json());
            this._express.use(cookieParser());
            this._express.use(session(require(__dirname + '/config/session.js')(sessionStore)));
            this._express.use(passport.initialize());
            this._express.use(passport.session());
            passport.use('local-signup', require(__dirname + '/strategies/local-signup.js')(this._database.User));
            passport.use('local-login', require(__dirname + '/strategies/local-login.js')(this._database.User));
            passport.serializeUser(require(__dirname + '/strategies/serializeUser.js'));
            passport.deserializeUser(require(__dirname + '/strategies/deserializeUser.js')(this._database.User));
            this._express.use((req, _, next) => {
                req.sequelize = this._database;
                next();
            });
            this._express.use('/', routes_1.router);
            this._express.listen(this._port, () => {
                console.log('Listening port ' + this._port);
            });
            this._database.start();
        });
        this.stop = () => __awaiter(this, void 0, void 0, function* () {
        });
        this._port = port;
        //crea l'istanza del db
        this._database = new SequelizeModule.SequelizeDatabase((process.env.NODE_ENV === 'production') ? {
            username: process.env.POSTGRES_USER || 'api',
            password: process.env.POSTGRES_PASSWORD || '',
            database: process.env.POSTGRES_DB || 'api',
            host: '127.0.0.1',
            dialect: 'postgres',
            logging: debug('sequelize:db')
        } : {
            dialect: 'sqlite',
            storage: './db.postgres',
            logging: debug('postgres:db')
        });
        this._express = express();
    }
}
exports.ApiServer = ApiServer;
//# sourceMappingURL=app.js.map