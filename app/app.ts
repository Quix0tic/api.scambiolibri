'use strict'

import * as express from 'express'
import * as SequelizeModule from './models'
import * as debug from 'debug'
import * as session from 'express-session'
import * as passport from 'passport'
import * as bodyParser from 'body-parser'
import { router } from './routes'


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
      host: 'postgres',
      dialect: 'postgres',
      logging: debug('sequelize:db')
    } : {
        dialect: 'postgres',
        storage: './db.postgres',
        logging: debug('postgres:db')
      })

    this._express = express()
  }

  public start = async () => {
    this._express.use(bodyParser.json())
    this._express.use((req: MyRequest, _, next) => {
      req.sequelize = this._database
      return next()
    })
    this._express.use('', router)
    this._express.listen(this._port, () => {
      console.log('Listening port ' + this._port)
    })
    await this._database.start()
  }

  public stop = async () => {
  }
}
