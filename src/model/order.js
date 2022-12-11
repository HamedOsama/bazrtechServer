const mongoose = require('mongoose')
const timestamps = require('mongoose-timestamp')
const validator = require('validator')
const { User } = require('./user')
const orderSchema = mongoose.Schema({
    buyerId: {
        type: mongoose.Types.ObjectId,
        ref: User,
        required: true
    },
    buyerPhone: {
        type: String,
        required: true
    },
    orderItems: [
        {
            price: {
                type: Number,
                required: true
            },
            link: {
                type: String,
                required: true,
                trim : true
            },
            category: {
                type: String,
                required: true,
                trim : true
            },
            subCategory: {
                type: String,
                required: true,
                trim : true
            },
            color: {
                type: String,
                required: true,
                trim : true
            },
            weight: {
                type: Number,
                required: true,
            },
            size: {
                type: String,
                required: true,
                trim : true
            },
            quantity: {
                type: Number,
                required: true
            }
        }
    ]
    ,
    country: {
        type: String,
        trim: true,
        required: true
    },
    city: {
        type: String,
        trim: true,
        required: true
    },
    state: {
        type: String,
        trim: true,
        required: true
    },
    street: {
        type: String,
        trim: true,
        required: true
    },
    buildingNumber: {
        type: String,
        trim: true,
        required: true
    },
    apartmentNumber: {
        type: String,
        trim: true,
        required: true
    },
    comment: {
        type: String,
        trim: true,
        default: ''
    },
    productsPrice: {
        type: Number,
        required: true
    },
    shippingPrice: {
        type: Number,
        required: true
    },
    totalPrice: {
        type: Number,
        default: 0,
        required: true
    },
    orderState: {
        type: Number,
        default: 0
    },
})
orderSchema.plugin(timestamps)
const Order = mongoose.model('orders', orderSchema)
module.exports = Order