const mongoose = require('mongoose');
/**
 * Connect to MongoDB.
 */
module.exports = (opts) => {

  mongoose.set('useFindAndModify', false);
  mongoose.set('useCreateIndex', true);
  mongoose.set('useNewUrlParser', true);
  mongoose.connect(opts || process.env.MONGODB_URI);
  mongoose.connection.on('error', (err) => {
    console.error(err);
    console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
    process.exit();
  });
  
  return mongoose;
}