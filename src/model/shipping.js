const mongoose = require('mongoose')
const timestamps = require('mongoose-timestamp')
const ShippingSchema = mongoose.Schema({
  country : {
    type: String,
    required: true,
    trim: true,
  },
  currency: {
    type: String,
    required: true,
    trim: true,
  },
  clothes:{
    one : {
      type : Number,
      required : true,
      default : 30
    },
    two : {
      type : Number,
      required : true,
      default : 45
    },
    three : {
      type : Number,
      required : true,
      default : 55
    },
    four : {
      type : Number,
      required : true,
      default : 70
    },
    five : {
      type : Number,
      required : true,
      default : 15
    },
    six : {
      type : Number,
      required : true,
      default : 12.5
    },

  },
  accessories:{
    type : Number,
    default : 25
  },
  shoes:{
    type : Number,
    default : 25
  },
  bags:{
    type : Number,
    default : 25
  },
  electronics:{
    type : Number,
    default : 300
  },
  homeApplicants:{
    type : Number,
    default : 125
  },
  furniture:{
    type : Number,
    default : 1000
  },
  makeUp:{
    half : {
      type : Number,
      required : true,
      default : 35
    },
    one : {
      type : Number,
      required : true,
      default : 45
    },
    two : {
      type : Number,
      required : true,
      default : 80
    },
    three : {
      type : Number,
      required : true,
      default : 110
    },
    four : {
      type : Number,
      required : true,
      default : 120
    },
    five : {
      type : Number,
      required : true,
      default : 140
    },
    six : {
      type : Number,
      required : true,
      default : 30
    },
  },
  foodSupplements:{
    half : {
      type : Number,
      required : true,
      default : 35
    },
    one : {
      type : Number,
      required : true,
      default : 45
    },
    two : {
      type : Number,
      required : true,
      default : 80
    },
    three : {
      type : Number,
      required : true,
      default : 110
    },
    four : {
      type : Number,
      required : true,
      default : 120
    },
    five : {
      type : Number,
      required : true,
      default : 140
    },
    six : {
      type : Number,
      required : true,
      default : 30
    },
  },
  iron:{
    one : {
      type : Number,
      required : true,
      default : 40
    },
    two : {
      type : Number,
      required : true,
      default : 75
    },
    three : {
      type : Number,
      required : true,
      default : 100
    },
    four : {
      type : Number,
      required : true,
      default : 30
    },
    five : {
      type : Number,
      required : true,
      default : 20
    },
    six : {
      type : Number,
      required : true,
      default : 15
    },

  },
  carParts:{
    one : {
      type : Number,
      required : true,
      default : 10
    },
    two : {
      type : Number,
      required : true,
      default : 15
    },
    three : {
      type : Number,
      required : true,
      default : 15
    },
  },
  other:{
    one : {
      type : Number,
      required : true,
      default : 35
    },
    two : {
      type : Number,
      required : true,
      default : 65
    },
    three : {
      type : Number,
      required : true,
      default : 75
    },
    four : {
      type : Number,
      required : true,
      default : 90
    },
    five : {
      type : Number,
      required : true,
      default : 15
    },
    six : {
      type : Number,
      required : true,
      default : 13
    },
  },
})
ShippingSchema.plugin(timestamps)
const Shipping = mongoose.model('Shipping', ShippingSchema)
module.exports = Shipping