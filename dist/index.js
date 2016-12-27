'use strict';
const debugN = require("debug");
const app_1 = require("./app");
let debug = debugN('api:index');
const cosmicBoxServer = new app_1.ApiServer(process.env.PORT || 8181);
cosmicBoxServer.start().catch(error => {
    throw error;
});
//# sourceMappingURL=index.js.map