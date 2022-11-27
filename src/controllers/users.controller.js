const config = require('../../config');
const sendgrid = require('@sendgrid/mail')
const multer = require('multer');
const jwt = require('jsonwebtoken')
const bcryptjs = require('bcryptjs')
const { User } = require('../model/user');
const auth = require('../middleware/auh');
const { json } = require('express');
const ServerError = require('../interface/Error');
// const e = require('express');
const ApiFeatures = require('../utils/ApiFeatures');
const Withdrawal = require('../model/withdrawal');
const Order = require('../model/order');
const Product = require('../model/product');
const { sendgridApiKey, sendgridEmail } = config

const signup = async (req, res, next) => {
  try {
    const user = new User(req.body);
    const token = await user.generateToken();
    await user.save();
    res.status(201).json({
      ok: true,
      code: 201,
      message: 'succeeded',
      data: user,
      token
    });
  } catch (e) {
    e.statusCode = 400
    next(e)
  }
};
const login = async (req, res, next) => {
  try {
    const user = await User.Login(req.body.email, req.body.password);
    const token = await user.generateToken();
    res.json({
      ok: true,
      code: 200,
      message: 'succeeded',
      body: user,
      token,
    });
  } catch (e) {
    e.statusCode = 401;
    next(e);
  }
};
const updateUser = async (req, res, next) => {
  try {
    const updates = Object.keys(req.body);
    const notAllowedUpdates = ['status', 'tokens', 'password', 'updatedAt', '_id', 'createdAt', 'resetLink',];
    const inValidUpdates = updates.filter(el => notAllowedUpdates.includes(el))
    if (inValidUpdates.length > 0) {
      return next(ServerError.badRequest(401, `not allowed to update (${inValidUpdates.join(', ')})`))
    }
    const user = await User.findByIdAndUpdate(req.user.id, req.body, {
      new: true,
      runValidators: true,
    })
    await user.save();
    res.status(200).json({
      ok: true,
      code: 200,
      message: 'succeeded',
      body: user,
    })
  } catch (e) {
    next(e)
  }
};
const getBuyerOrderById = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return next(ServerError.badRequest(401, "token is not valid"));
    }
    if (user.role !== 'buyer') {
      return next(ServerError.badRequest(401, "not authorized"));
    }
    const id = req.params.id;
    if (!id || id.length < 24)
      return next(ServerError.badRequest(400, 'order id not valid'));
    const order = await Order.findOne({ _id: id, buyerId: user._id }, {
      productId: 1,
      orderItems: 1,
      totalPrice: 1,
      name: 1,
      phone: 1,
      city: 1,
      area: 1,
      address: 1,
      subAddress: 1,
      shippingPrice: 1,
      storeName: 1,
      comment: 1,
      orderState: 1,
      createdAt: 1,
      buyerCommission: 1,
      sellPrice: 1,
      newPrice: 1,
    })
    if (!order)
      return next(ServerError.badRequest(400, 'order id not valid'));
    const OrderedProduct = await Product.findById({ _id: order.productId }, {
      reviews: 0,
      originalPrice: 0
    });
    const OrderedProperties = order.orderItems.map(orderProperty => OrderedProduct.properties.find(property => property._id.toString() === orderProperty.propertyId.toString()))
    res.status(200).json({
      ok: true,
      code: 200,
      message: 'succeeded',
      body: {
        order,
        OrderedProduct,
        OrderedProperties
      }
    })
  } catch (e) {
    next(e);
  }
}
const getUserInfo = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return next(ServerError.badRequest(401, "token is not valid"));
    }
    res.status(200).json({
      ok: true,
      code: 200,
      message: 'succeeded',
      body: user
    })
  } catch (e) {
    next(e);
  }
}
const changePassword = async (req, res, next) => {
  try {
    if (!req.user)
      return next(ServerError.badRequest(400, "token is not valid"));
    const user = req.user;
    const password = req.body.password;
    const newPassword = req.body.newPassword;
    if (password === newPassword)
      return next(ServerError.badRequest(400, "old and new password are same"));
    const isMatched = await user.validatePassword(password);
    if (!isMatched)
      return next(ServerError.badRequest(400, "wrong password"));
    user.password = newPassword;
    await user.save()
    res.status(200).json({
      ok: true,
      code: 200,
      message: 'password has been updated successfully',
    })
  } catch (e) {
    next(e)
  }
};
const getAll = async (req, res, next) => {
  try {
    const users = await User.find({});
    res.status(200).json({
      ok: true,
      code: 200,
      message: 'succeeded',
      body: users,
    })
  } catch (e) {
    next(e)
  }
};
const logout = async (req, res, next) => {
  try {
    req.user.tokens = req.user.tokens.filter((el) => {
      return el != req.token;
    });
    await req.user.save();
    res.status(200).json({
      ok: true,
      code: 200,
      message: 'succeeded',
    })
  } catch (e) {
    next(e)
  }
};
const logoutAll = async (req, res, next) => {
  try {
    console.log(req.user);
    req.user.tokens = [];
    await req.user.save();
    res.status(200).json({
      ok: true,
      code: 200,
      message: 'succeeded',
    })
  } catch (e) {
    next(e)
  }
};
// const resetPassword = async (req, res, next) => {
//   try {
//     const resetLink = req.params.token
//     const newPassword = req.body.password
//     if (!newPassword) {
//       return next(ServerError.badRequest(401, 'please send password'))
//     }
//     if (resetLink) {
//       jwt.verify(resetLink, 'resetPassword', async function (err, decoded) {
//         if (err) {
//           return next(ServerError.badRequest(401, 'token is not correct'))
//         }
//         const user = await User.findOne({ resetLink: resetLink })
//         if (!user) {
//           return next(ServerError.badRequest(401, 'token is not correct'))
//         }
//         await user.updateOne({ password: newPassword }, {
//           new: true,
//           runValidators: true,
//         }, async (err, data) => {
//           if (err) {
//             return next(ServerError.badRequest(401, e.message))
//           }
//           else if (data) {
//             console.log(user.password)
//             console.log()
//             user.password = newPassword;
//             user.resetLink = ''
//             await user.save()
//             res.json(
//               {
//                 ok: true,
//                 code: 200,
//                 message: 'succeeded',
//                 data: 'your password is successfully changed'
//               }
//             )
//           }
//         })
//       })
//     }
//     else {
//       return next(ServerError.badRequest(401, 'Authentication error!'))
//     }
//   } catch (e) {
//     next(e)
//   }
// }
// const forgetPassword = async (req, res, next) => {
//   try {
//     const email = req.body.email
//     const url = 'http://localhost:3000'
//     const user = User.findOne({ email }, (err, user) => {
//       if (err || !user) {
//         // return res.status(404).send('user with this email dose not exist')
//         return next(ServerError.badRequest(400, 'no user found with this email'))
//       }
//       const token = jwt.sign({ _id: user._id }, 'resetPassword', { expiresIn: '20m' })
//       // const SENDGRID_API_KEY = "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"
//       // const SENDGRID_API_KEY = "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"
//       sendgrid.setApiKey(sendgridApiKey)
//       const data = {
//         to: email,
//         from: sendgridEmail,
//         subject: 'Account reset password Link',
//         html: ` <h2>Please click on given Link to reset your password</h2>  
//                     <p> ${url}/api/v1/users/auth/reset-password/${token} </p> 
//               `
//       }
//       user.updateOne({ resetLink: token }, function (err, success) {
//         if (err) {
//           return next(ServerError.badRequest(400, 'something went wrong'))
//           // return res.status(400).json({ err: 'reset password link error' })
//         }
//         else {
//           sendgrid.send(data)
//             .then((response) => {
//               res.status(200).json({
//                 ok: true,
//                 code: 200,
//                 message: 'succeeded',
//                 body: 'email has been sent',
//               })
//             })
//             .catch((err) => {
//               return next(ServerError.badRequest(400, err.message))
//               // res.json(error.message)
//             })
//         }
//       })
//     })
//   }
//   catch (e) {
//     next(e)
//   }
// }
module.exports = {
  signup,
  login,
  updateUser,
  getUserInfo,
  logout,
  logoutAll,
  changePassword,
  getAll,
  // resetPassword,
  // forgetPassword,
  getBuyerOrderById,
};
