const mongoose = require('mongoose')
const timestamps = require('mongoose-timestamp')
const bcryptjs = require('bcryptjs')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    balance : {
        type : Number,
        default : 0
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        validate(value) {
            if (!validator.isMobilePhone(value, ['ar-EG'])) {
                throw new Error('Phone number is invalid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        validate(value) {
            // let strongPass = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])")
            if (value.length < 8)
                throw new Error("password length must be at least 8")
            // if (!strongPass.test(value))
                // throw new Error("password must contain at least one capital/small letter & special characters and number")
        }
    },
    country:{
        type : String,
        required : true,
        trim : true ,
    },
    city:{
        type : String,
        default : '',
        trim : true ,
    },
    state:{
        type : String,
        default : '',
        trim : true ,
    },
    street:{
        type : String,
        default : '',
        trim : true ,
    },
    buildingNumber : {
        type : String,
        default : '',
        trim : true ,
    },
    apartmentNumber:{
        type : String,
        default : '',
        trim : true ,
    },
    status: {
        type: String,
        default: 'active',
        enum: ['active', 'not-active'],
    },
    tokens: [{
        type: String,
        required: true
    }],
    resetLink: {
        type: String,
        default: ''
    }
})
userSchema.plugin(timestamps)
userSchema.virtual('products', {
    ref: 'products',
    localField: '_id',
    foreignField: 'seller'
})
userSchema.virtual('buyerOrders', {
    ref: 'orders',
    localField: '_id',
    foreignField: 'buyerId'
})
userSchema.virtual('sellerOrders', {
    ref: 'orders',
    localField: '_id',
    foreignField: 'sellerId'
})
// userSchema.virtual('buyerWithdrawals', {
//     ref: 'withdrawals',
//     localField: '_id',
//     foreignField: 'buyerId'
// })
userSchema.pre('save', async function () {
    const user = this
    if (user.isModified('password'))
        user.password = await bcryptjs.hash(user.password, 8)
})

userSchema.statics.Login = async function (mail, pass) {
    const user = await User.findOne({ email: mail })
    if (!user)
        throw new Error('Email is not valid!');
    const isMatch = await bcryptjs.compare(pass, user.password)
    if (!isMatch)
        throw new Error('Password is wrong!')
    if (user.status !== 'active')
        throw new Error('not authorized you are blocked')

    return user
}
userSchema.methods.generateToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id }, 'EazyMoney')
    user.tokens = user.tokens.concat(token)
    await user.save()
    return token
}
userSchema.methods.validatePassword = async function (password) {
    const user = this
    const isMatch = await bcryptjs.compare(password, user.password)
    return isMatch;
}
userSchema.methods.toJSON = function () {
    const user = this
    const userObj = user.toObject()
    delete userObj.password;
    // delete userObj.tokens;
    return userObj

}
const User = mongoose.model('users', userSchema)
module.exports = { User };