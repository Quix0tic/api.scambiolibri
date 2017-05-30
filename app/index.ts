'use strict'
import { ApiServer } from './app'

const cosmicBoxServer = new ApiServer(process.env.PORT || 8181)

cosmicBoxServer.start().catch(error => {
  console.error(error)
})