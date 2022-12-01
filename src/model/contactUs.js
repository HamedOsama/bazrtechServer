const mongoose = require('mongoose')
const validator = require('validator')
const timestamps = require('mongoose-timestamp')
const contactUs = mongoose.Schema({
  title : {
    type: String,
    required: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error('Email is invalid')
      }
    }
  },
  phone: {
    type: String,
    validate(value) {
      if (!validator.isMobilePhone(value, ['ar-EG'])) {
        throw new Error('Phone number is invalid')
      }
    }
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  state: {
    type: Number,
    default: 0
  },
})
contactUs.plugin(timestamps)
const ContactUs = mongoose.model('contactus', contactUs)
module.exports = ContactUs