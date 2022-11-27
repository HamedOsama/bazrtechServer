const mongoose = require('mongoose')
const validator = require('validator')
const timestamps = require('mongoose-timestamp')
const WebsiteModel = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  imageUrl: {
    type: String,
    required: true,
    trim: true,
  },
  link: {
    type: String,
    required: true,
    trim: true,
  },
})
WebsiteModel.plugin(timestamps)
const Website = mongoose.model('websites', WebsiteModel)
module.exports = Website