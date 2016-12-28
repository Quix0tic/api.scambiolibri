// Config file for 'express-session'
module.exports = function(sessionStore) {
    var sessionConfig = {
        secret: 'thisIsReallySecret', // This is the key used to encrypt cookies
        cookie: {
            secure: true,
            maxAge: 1000 * 60 * 60 * 24 * 30
        },
        resave: false, // Don't enable (will break with sequelize)
        saveUninitialized: true, // Need to be enabled to use flashes
        store: sessionStore,
        proxy: true
    }
    return sessionConfig;
}
