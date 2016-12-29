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

export interface myError extends Error {
  statusCode?: number
}

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
      username: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || '',
      database: process.env.POSTGRES_DB || 'scambio_libri',
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
    this._express.use(bodyParser.json())

    /*
    var sessionStore = new SequelizeStore({
      db: this._database
    });

    this._express.use(cookieParser());
    this._express.use(session(require(__dirname + '/config/session.js')(sessionStore)));
    this._express.use(passport.initialize());
    this._express.use(passport.session());

    passport.use('local-signup', require(__dirname + '/strategies/local-signup.js')(this._database.User));
    passport.use('local-login', require(__dirname + '/strategies/local-login.js')(this._database.User));
    passport.serializeUser(require(__dirname + '/strategies/serializeUser.js'));
    passport.deserializeUser(require(__dirname + '/strategies/deserializeUser.js')(this._database.User));
*/
    this._express.use((req: MyRequest, res, next) => {
      req.sequelize = this._database
      next()
    })
    this._express.use('/', router)
    // 404 handler
    this._express.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
      return res.status(404).json({
        error: true,
        message: 'route not found'
      })
    })
    this._express.use((err: myError, req: express.Request, res: express.Response, next: express.NextFunction) => {
      res.status(err.statusCode || 500)
      res.json({
        name: err.name,
        message: err.message,
        stack: (this._express.get('env') === 'development') ? err.stack : {}
      })
    })
    this._express.listen(this._port, () => {
      console.info('Listening port ' + this._port)
    })
    this._database.start().then(() => {
      console.info("Connected to database");
    }).catch((e) => {
      console.error("Error while connecting to database: " + e)
      process.exit(1)
    })
  }

  public stop = async () => {
    console.info("Port " + this._port + " is now free");
  }
}
