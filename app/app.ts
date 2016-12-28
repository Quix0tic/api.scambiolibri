'use strict'

import * as express from 'express'
import * as SequelizeModule from './models'
import * as debug from 'debug'
import * as session from 'express-session'
import * as passport from 'passport'
import * as bodyParser from 'body-parser'
import { router } from './routes'
var SequelizeStore = require('connect-session-sequelize')(session.Store);
var cookieParser = require('cookie-parser');

export interface MyRequest extends express.Request {
  sequelize: SequelizeModule.SequelizeDatabase
}

export class ApiServer {
  private _express: express.Application
  private _database: SequelizeModule.SequelizeDatabase
  private _listening: boolean
  private _port: number

  public constructor(port: number) {
    this._port = port

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
      })

    this._express = express()
  }

  public start = async () => {
    var sessionStore = new SequelizeStore({
      db: this._database
    });

    this._express.use(bodyParser.json())
    this._express.use(cookieParser());
    this._express.use(session(require(__dirname + '/config/session.js')(sessionStore)));
    this._express.use(passport.initialize());
    this._express.use(passport.session());

    passport.use('local-signup', require(__dirname + '/strategies/local-signup.js')(this._database.User));
    passport.use('local-login', require(__dirname + '/strategies/local-login.js')(this._database.User));
    passport.serializeUser(require(__dirname + '/strategies/serializeUser.js'));
    passport.deserializeUser(require(__dirname + '/strategies/deserializeUser.js')(this._database.User));

    this._express.use((req: MyRequest, _, next) => {
      req.sequelize = this._database
      next()
    })
    this._express.use('/', router)
    this._express.listen(this._port, () => {
      console.log('Listening port ' + this._port)
    })
    this._database.start()
  }

  public stop = async () => {
  }
}
