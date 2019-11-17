const mongoose = require("mongoose");
const cacheManager = require("cache-manager");
const mongooseStore = require("cache-manager-mongoose");

//mongoose.connect("mongodb://127.0.0.1/test");
//sessionStore = new MongoStore({ mongooseConnection: mongoose.connection })

const cache = cacheManager.caching({
    store: mongooseStore,
    mongoose: mongoose
});

module.exports = { cache, cacheManager };