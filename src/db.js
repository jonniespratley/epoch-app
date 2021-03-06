// Require the mongoose library
const mongoose = require('mongoose');

module.exports = {
  connect: DB_HOST => {
    // Use the Mongo driver's updated URL string parser
    mongoose.set('useNewUrlParser', true);
    // Use `findOneAndUpdate()` in place of findAndModify()
    mongoose.set('useFindAndModify', false);
    // Use `createIndex()` in place of `ensureIndex()`
    mongoose.set('useCreateIndex', true);
    
    // Connect to the DB
    return mongoose.connect(DB_HOST).then(() => {
      console.log('Connected to', DB_HOST);
      return this;
    }).catch(err => {
      console.error(err);
      console.log(
        'MongoDB connection error. Please make sure MongoDB is running.'
      );
      //process.exit();
    });
  },

  close: () => {
    mongoose.connection.close();
  }
};