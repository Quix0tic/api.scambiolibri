'use strict'

import * as debugN from 'debug'
import {ApiServer} from './app'

let debug = debugN('api:index')

const cosmicBoxServer = new ApiServer(process.env.PORT || 8181)

cosmicBoxServer.start().catch(error => {
  throw error
})