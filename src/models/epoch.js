// src/models/epoch.js
const mongoose = require('mongoose');

const EpochSchema = new mongoose.Schema({
  image: String,
  name: String,
  href: String,
  tracks: Array,
  published: Boolean,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
  
},{ timestamps: true });

const Epoch = mongoose.model('Epoch', EpochSchema);

module.exports = Epoch;