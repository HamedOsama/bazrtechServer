const mongoose = require('mongoose')
const timestamps = require('mongoose-timestamp')
const OfferModel = mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  imageUrl: {
    type: String,
    required: true,
    trim: true,
  },
  code: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  discountAmount : {
    type : Number,
    required : true,
  }
})
OfferModel.plugin(timestamps)
const Offer = mongoose.model('offers', OfferModel)
module.exports = Offer