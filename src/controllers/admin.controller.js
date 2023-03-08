const config = require('../../config');
const Admin = require('../model/admin');
const { User } = require('../model/user');
const ContactUs = require('../model/contactUs');
const Product = require('../model/product');
const multer = require('multer');
const ServerError = require('../interface/Error');
const Str = require('@supercharge/strings');
const sendgrid = require('@sendgrid/mail');
const e = require('express');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const ApiFeatures = require('../utils/ApiFeatures');
const Order = require('../model/order');
const Withdrawal = require('../model/withdrawal');
const { uploadToS3 } = require('../utils/uploadPhoto');
const Website = require('../model/websites');
const PopularWebsites = require('../model/popularWebsites');
const Offer = require('../model/offer');
const Shipping = require('../model/shipping');
const { sendgridApiKey, sendgridEmail } = config;

const addAdmin = async (req, res, next) => {
  try {
    const admin = new Admin(req.body);
    const token = await admin.getToken();
    if (req.file) req.admin.image = req.file.filename;
    await admin.save();
    res.status(201).json({
      ok: true,
      code: 201,
      message: 'succeeded',
      data: admin,
      token,
    });
  } catch (e) {
    e.statusCode = 400;
    next(e);
  }
};
const login = async (req, res, next) => {
  try {
    const admin = await Admin.logIn(req.body.email, req.body.password);
    const token = await admin.getToken();
    res.status(200).json({
      ok: true,
      code: 200,
      message: 'succeeded',
      data: {
        admin: admin,
      },
      token,
    });
    //   {

    //   // const random = Str.random(10);
    //   // await admin.updateOne({ LoginCode: random });
    //   // console.log(sendgridApiKey);
    //   // sendgrid.setApiKey(sendgridApiKey);
    //   // const data = {
    //   //   to: req.body.email,
    //   //   from: sendgridEmail,
    //   //   subject: 'verify with this',
    //   //   html: ` <p>${random}</p> `,
    //   // };
    //   // sendgrid
    //   //   .send(data)
    //   //   .then((response) => {
    //   //     res.status(200).json({
    //   //       ok: true,
    //   //       code: 200,
    //   //       message: 'succeeded',
    //   //       data: 'code has been sent to your email',
    //   //     });
    //   //   })
    //   //   .catch((error) => {
    //   //     return next(ServerError.badRequest(401, error.message));
    //   //   });
    // }
  } catch (e) {
    e.statusCode = 401;
    next(e);
  }
};
const getWebsiteStatistics = async () => {
  const year = new Date().getFullYear();
  const users = await User.countDocuments();
  const sellers = await User.countDocuments({ role: 'seller' });
  const buyers = await User.countDocuments({ role: 'buyer' });
  const products = await Product.count({});
  const orders = await Order.countDocuments();
  const withdrawals = await Withdrawal.countDocuments();
  const productsChart = new Array(12).fill(0);
  const withdrawalsChart = new Array(12).fill(0);
  const ordersChart = new Array(12).fill(0);
  const createdSellersChart = new Array(12).fill(0);
  const createdBuyersChart = new Array(12).fill(0);
  const blockedSellersChart = new Array(12).fill(0);
  const blockedBuyersChart = new Array(12).fill(0);
  const ordersThisYear = await Order.find({
    createdAt: {
      $gte: new Date(`${year}-1`),
      $lte: new Date(`${year}-12`),
    },
  });
  const withdrawalsThisYear = await Withdrawal.find({
    createdAt: {
      $gte: new Date(`${year}-1`),
      $lte: new Date(`${year}-12`),
    },
  });
  const usersThisYear = await User.find({
    createdAt: {
      $gte: new Date(`${year}-1`),
      $lte: new Date(`${year}-12`),
    },
  });
  const productThisYear = await Product.find({
    createdAt: {
      $gte: new Date(`${year}-1`),
      $lte: new Date(`${year}-12`),
    },
  });
  usersThisYear.forEach((el) => {
    const index = el.createdAt.getMonth();
    el.role === 'seller'
      ? createdSellersChart[index]++
      : createdBuyersChart[index]++;
    if (el.status === 'not-active')
      el.role === 'seller'
        ? blockedSellersChart[index]++
        : blockedBuyersChart[index]++;
  });
  productThisYear.forEach((el) => {
    const index = el.createdAt.getMonth();
    productsChart[index]++;
  });
  ordersThisYear.forEach((el) => {
    const index = el.createdAt.getMonth();
    ordersChart[index]++;
  });
  withdrawalsThisYear.forEach((el) => {
    const index = el.createdAt.getMonth();
    withdrawalsChart[index]++;
  });
  return {
    users,
    sellers,
    buyers,
    products,
    orders,
    withdrawals,
    ordersChart,
    createdSellersChart,
    createdBuyersChart,
    blockedSellersChart,
    blockedBuyersChart,
    productsChart,
    withdrawalsChart,
  };
};
// const verifyLoginCode = async (req, res, next) => {
//   try {
//     const code = req.body.code;
//     if (code.length !== 10 || !code)
//       return next(ServerError.badRequest(400, 'code is not valid'));
//     const adminWithLoginCode = await Admin.findOne({ LoginCode: code });
//     if (!adminWithLoginCode)
//       return next(ServerError.badRequest(400, 'code is not valid'));
//     adminWithLoginCode.LoginCode = null;
//     await adminWithLoginCode.save();
//     const token = await adminWithLoginCode.getToken();
//     const websiteStatistics = await getWebsiteStatistics();
//     res.status(200).json({
//       ok: true,
//       code: 200,
//       message: 'succeeded',
//       data: {
//         admin: adminWithLoginCode,
//         ...websiteStatistics,
//       },
//       token,
//     });
//   } catch (e) {
//     e.statusCode = 401;
//     next(e);
//   }
// };

const getAdminData = async (req, res, next) => {
  try {
    if (!req.admin) {
      return next(ServerError.badRequest(400, 'token is not valid'));
    }
    // const websiteStatistics = await getWebsiteStatistics();
    res.status(200).json({
      ok: true,
      code: 200,
      message: 'succeeded',
      data: req.admin,
      // ...websiteStatistics,
    });
  } catch (e) {
    next(e);
  }
};
const getAllAdmins = async (req, res, next) => {
  try {
    const { admin } = req
    const admins = await ApiFeatures.pagination(Admin.find({ _id: { $ne: admin.id } }), req.query)
    const totalLength = await Admin.countDocuments({ _id: { $ne: admin.id } })
    res.status(200).json({
      ok: true,
      code: 200,
      message: 'succeeded',
      data: admins,
      totalLength
    })
  } catch (e) {
    next(e);
  }
}
const forgetPassword = async (req, res, next) => {
  try {
    const email = req.body.email;
    if (!email) {
      return next(
        ServerError.badRequest(400, 'please put email parameter in body')
      );
    }
    const url = 'http://localhost:3000';
    const admin = Admin.findOne({ email }, (err, admin) => {
      if (err || !admin) {
        return next(ServerError.badRequest(400, 'email is not valid'));
      }
      const token = jwt.sign({ _id: admin._id }, 'adminPassword', {
        expiresIn: '20m',
      });

      sendgrid.setApiKey(sendgridApiKey);
      const data = {
        to: email,
        from: {
          name: 'easy money',
          email: sendgridEmail,
        },
        subject: 'Account reset password Link',
        html: ` <h2>Please click on given Link to reset your password</h2>  
                    <p> ${url}/auth/reset-password/${token} </p> 
              `,
      };
      admin.updateOne({ resetLink: token }, function (err, success) {
        if (err) {
          return next(ServerError.badRequest(500, 'please try again'));
          // return res.status(400).json({ err: 'reset password link error' })
        } else {
          sendgrid
            .send(data)

            .then((response) => {
              res.status(200).json({
                ok: true,
                code: 200,
                message: 'succeeded',
                data: 'email has been sent',
              });
            })
            .catch((error) => {
              next(ServerError.badRequest(500, error.message));
              // res.json(error.message)
            });
        }
      });
    });
  } catch (e) {
    // e.statusCode = 500
    next(e);
    // next(ServerError.badRequest(500, e.message))

    // res.status(400).send(e.message)
  }
};
const resetPassword = async (req, res, next) => {
  try {
    const resetLink = req.params.token;
    const newPassword = req.body.password;
    if (!newPassword) {
      return next(ServerError.badRequest(401, 'please send password'));
    }
    if (resetLink) {
      jwt.verify(resetLink, 'adminPassword', async function (err, decoded) {
        if (err) {
          return next(ServerError.badRequest(401, 'token is not correct'));
          // return res.status(401).json({ error: 'Incorrect token or it is expired' })
        }
        const admin = await Admin.findOne({ resetLink: resetLink });
        if (!admin) {
          return next(ServerError.badRequest(401, 'token is not correct'));
          // res.status(401).send('unable to found')
        }

        // const hashedPass = bcryptjs.hashSync(newPassword, 8);
        // console.log(hashedPass);
        // admin.password = newPassword;
        // admin.resetpassword = ''
        // await admin.save();

        // res.json(
        //   {
        //     ok: true,
        //     code: 200,
        //     message: 'succeeded',
        //     data: 'your password is successfully changed'
        //   }
        // )
        // // const hashedPassword =
        await admin.updateOne(
          { password: newPassword },
          {
            new: true,
            runValidators: true,
          },
          async (err, data) => {
            if (err) {
              next(ServerError.badRequest(401, e.message));
              // return res.send(err.message)
            }
            // else if (!newPassword) {
            // next(ServerError.badRequest(401, e.message))
            // return res.send('please send your new password')
            // }
            else if (data) {
              console.log(admin.password);
              console.log();
              admin.password = newPassword;
              // console.log(admin.password)
              admin.resetLink = '';
              await admin.save();
              // const match = await bcryptjs.compare(newPassword, admin.password);
              // console.log(match)
              res.json({
                ok: true,
                code: 200,
                message: 'succeeded',
                data: 'your password is successfully changed',
              });
            }
          }
        );
      });
    } else {
      next(ServerError.badRequest(401, 'Authentication error!'));
      // res.status(401).json({ error: 'Authentication error!' })
    }
  } catch (e) {
    e.statusCode = 401;
    next(e);
    // next(ServerError.badRequest(401, e.message))
    // res.status(400).send(e.message)
  }
};

const logout = async (req, res, next) => {
  try {
    req.admin.token = req.admin.token.filter((el) => {
      return el != req.token;
    });
    await req.admin.save();
    res.status(200).json({
      ok: true,
      code: 200,
      message: 'succeeded',
    });
  } catch (e) {
    e.statusCode = 401;
    next(e);
    // next(ServerError.badRequest(401, e.message))
    // res.status(500).send(e.message)
  }
};

const logoutAllDevices = async (req, res, next) => {
  try {
    req.admin.token = [];
    await req.admin.save();
    res.status(200).json({
      ok: true,
      code: 200,
      message: 'succeeded',
    });
  } catch (e) {
    e.statusCode = 401;
    next(e);
    // next(ServerError.badRequest(401, e.message))
    // res.status(500).send(e.message)
  }
};

const addUser = async (req, res, next) => {
  try {
    const user = new User(req.body);
    const token = await user.generateToken();
    await user.save();
    res.status(201).json({
      ok: true,
      code: 201,
      message: 'succeeded',
      data: user,
      token,
    });
  } catch (e) {
    e.statusCode = 400;
    next(e);
  }
};
const updateUser = async (req, res, next) => {
  try {
    const userID = req.params.id;
    const user = await User.findById(userID);
    if (!user) return next(ServerError.badRequest(400, 'user not found'));
    const Updates = Object.keys(req.body);
    Updates.forEach((update) => {
      user[update] = req.body[update];
    });
    await user.save();
    res.status(200).json({
      ok: true,
      code: 200,
      message: 'succeeded',
      data: user,
    });
  } catch (e) {
    next(e);
  }
};
const getAllUsers = async (req, res, next) => {
  try {
    const users = await ApiFeatures.pagination(User.find({}), req.query);
    const totalLength = await User.countDocuments();
    res.status(200).json({
      ok: true,
      code: 200,
      message: 'succeeded',
      data: users,
      totalLength,
    });
  } catch (e) {
    // e.statusCode = 500
    next(e);
    // next(ServerError.badRequest(500, e.message))
    // res.status(500).send(e.message)
  }
};
const logoutUserFromAllDevices = async (req, res, next) => {
  try {
    const userID = req.params.id;
    if (!userID) return next(ServerError.badRequest(400, 'please send id'));
    const user = await User.findById({ _id: userID });
    user.tokens = [];
    await user.save();
    res.status(200).json({
      ok: true,
      code: 200,
      message: 'succeeded',
    });
  } catch (e) {
    e.statusCode = 401;
    next(e);
    // next(ServerError.badRequest(401, e.message))
    // res.status(500).send(e.message)
  }
};

const getUserById = async (req, res, next) => {
  try {
    const userId = req.params.code;
    console.log(userId)
    if (!userId) return next(ServerError.badRequest(400, 'please send id'));
    const user = await User.find({ code: new RegExp(userId, 'i') });
    // if (!user) {
    //   return next(
    //     ServerError.badRequest(400, 'unable to find any user match this ID')
    //   );
    // }

    res.status(200).json({
      ok: true,
      code: 200,
      message: 'succeeded',
      data: user,
    });
  } catch (e) {
    next(e);
  }
};
const getUserByPhoneNumber = async (req, res, next) => {
  try {
    const userPhone = req.params.phone;
    if (!userPhone)
      return next(ServerError.badRequest(400, 'please send user phone number'));
    const user = await User.findOne({ phone: userPhone });
    if (!user) {
      return next(
        ServerError.badRequest(
          400,
          'unable to find any user match this phone number'
        )
      );
    }
    res.status(200).json({
      ok: true,
      code: 200,
      message: 'succeeded',
      data: user,
    });
  } catch (e) {
    next(e);
  }
};

// websites
const addWebsite = async (req, res, next) => {
  try {
    const website = new Website(req.body);
    await website.save();
    res.status(201).json({
      ok: true,
      code: 201,
      message: 'succeeded',
      data: website,
    });
  } catch (e) {
    e.statusCode = 400;
    next(e);
  }
};
const getAllWebsites = async (req, res, next) => {
  try {
    const websites = await ApiFeatures.pagination(Website.find({}), req.query);
    const totalLength = await Website.countDocuments();
    res.status(200).json({
      ok: true,
      code: 200,
      message: 'succeeded',
      data: websites,
      totalLength,
    });
  } catch (e) {
    e.statusCode = 400;
    next(e);
  }
}
const updateWebsite = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id)
      return next(ServerError.badRequest(400, 'send an id'));
    const website = await Website.findByIdAndUpdate(id, req.body, {
      runValidators: true,
      new: true
    });
    if (!website)
      return next(ServerError.badRequest(400, 'enter valid id'));
    res.status(200).json({
      ok: true,
      status: 204,
      message: 'website has been updated successfully',
      data: website
    })
  } catch (e) {
    e.statusCode = 400;
    next(e);
  }
}
const deleteWebsite = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id)
      return next(ServerError.badRequest(400, 'send an id'));
    const deletedWebsite = await Website.findByIdAndDelete(id);
    if (!deletedWebsite)
      return next(ServerError.badRequest(400, 'enter valid id'));
    res.status(204).json({
      ok: true,
      status: 204,
      message: 'website has been deleted successfully'
    })
  } catch (e) {
    e.statusCode = 400;
    next(e);
  }
}

// popular websites
const addPopularWebsite = async (req, res, next) => {
  try {
    const website = new PopularWebsites(req.body);
    await website.save();
    res.status(201).json({
      ok: true,
      code: 201,
      message: 'succeeded',
      data: website,
    });
  } catch (e) {
    e.statusCode = 400;
    next(e);
  }
};
const getAllPopularWebsites = async (req, res, next) => {
  try {
    const websites = await ApiFeatures.pagination(PopularWebsites.find({}), req.query);
    const totalLength = await PopularWebsites.countDocuments();
    res.status(200).json({
      ok: true,
      code: 200,
      message: 'succeeded',
      data: websites,
      totalLength,
    });
  } catch (e) {
    e.statusCode = 400;
    next(e);
  }
}
const updatePopularWebsite = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id)
      return next(ServerError.badRequest(400, 'send an id'));
    const website = await PopularWebsites.findByIdAndUpdate(id, req.body, {
      runValidators: true,
      new: true
    });
    if (!website)
      return next(ServerError.badRequest(400, 'enter valid id'));
    res.status(200).json({
      ok: true,
      status: 204,
      message: 'website has been updated successfully',
      data: website
    })
  } catch (e) {
    e.statusCode = 400;
    next(e);
  }
}
const deletePopularWebsite = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id)
      return next(ServerError.badRequest(400, 'send an id'));
    const deletedWebsite = await PopularWebsites.findByIdAndDelete(id);
    if (!deletedWebsite)
      return next(ServerError.badRequest(400, 'enter valid id'));
    res.status(204).json({
      ok: true,
      status: 204,
      message: 'website has been deleted successfully'
    })
  } catch (e) {
    e.statusCode = 400;
    next(e);
  }
}







const addProduct = async (req, res, next) => {
  try {
    if (req?.body?.image <= 1 || !req.body.image)
      return next(ServerError.badRequest(400, 'add one image at least'));
    const product = new Product(req.body);
    const sum = product.properties.reduce((accumulator, object) => {
      return accumulator + object.amount;
    }, 0);

    product.total_amount = sum;
    await product.save();

    res.status(201).json({
      ok: true,
      code: 201,
      message: 'succeeded',
      data: product,
    });
  } catch (e) {
    // e.statusCode = 500
    next(e);
    // next(ServerError.badRequest(500, e.message))
    // res.status(500).send(e.message)
  }
};

const getAllCategories = async (req, res, next) => {
  try {
    const categories = [];
    const product = await Product.find({});
    product.forEach((el) => {
      if (!categories.includes(el.category)) categories.push(el.category);
    });
    res.status(200).json({
      ok: true,
      code: 200,
      message: 'succeeded',
      data: categories,
    });
  } catch (e) {
    // e.statusCode = 500
    next(e);
    // next(ServerError.badRequest(500, e.message))
    // res.status(500).send(e.message)
  }
};

const getAllProducts = async (req, res, next) => {
  try {
    // const limitValue = req.query.limit || 10;
    // const skipValue = req.query.skip || 0;
    // const products = await Product.find()
    //   .limit(limitValue).skip(skipValue);
    // console.log(req.query)
    const products = await ApiFeatures.pagination(Product.find({}), req.query);
    const totalLength = await Product.countDocuments();
    res.status(200).json({
      ok: true,
      code: 200,
      message: 'succeeded',
      data: products,
      totalLength,
    });
  } catch (e) {
    // e.statusCode = 500
    next(e);
    // next(ServerError.badRequest(500, e.message))
    // res.status(500).send(e.message)
  }
};

const getProductById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const product = await Product.findById(id);
    if (!product) {
      return next(ServerError.badRequest(400, 'product not found'));
      // res.status(404).send('unable to found')
    }
    res.status(200).json({
      ok: true,
      code: 200,
      message: 'succeeded',
      data: product,
    });
  } catch (e) {
    // e.statusCode = 500
    next(e);
    // next(ServerError.badRequest(500, e.message))
    // res.status(500).send(e.message)
  }
};

const getProductsByCategory = async (req, res, next) => {
  try {
    const catName = req.params.cat;
    // const products = await Product.find({ category: { $regex: new RegExp(catName, "i") } })

    const products = await ApiFeatures.pagination(
      Product.find({ category: { $regex: new RegExp(catName, 'i') } }),
      req.query
    );
    const totalLength = await Product.countDocuments();
    res.status(200).json({
      ok: true,
      code: 200,
      message: 'succeeded',
      data: products,
      totalLength,
    });
  } catch (e) {
    // e.statusCode = 500
    next(e);
    // next(ServerError.badRequest(500, e.message))
    // res.status(500).send(e.message)
  }
};

const getProductsByName = async (req, res, next) => {
  try {
    const productName = req.params.name;
    // const products = await Product.find({ name: { $regex: new RegExp(productName, "i") } })
    const products = await ApiFeatures.pagination(
      Product.find({ name: { $regex: new RegExp(productName, 'i') } }),
      req.query
    );
    const totalLength = await Product.countDocuments();

    res.status(200).json({
      ok: true,
      code: 200,
      message: 'succeeded',
      data: products,
      totalLength,
    });
  } catch (e) {
    // e.statusCode = 500
    next(e);
    // next(ServerError.badRequest(500, e.message))
    // res.status(500).send(e.message)
  }
};
const getProductsBySellerID = async (req, res, next) => {
  try {
    const sellerId = req.params.id;
    // const products = await Product.find({ name: { $regex: new RegExp(productName, "i") } })
    const products = await ApiFeatures.pagination(
      Product.find({ seller: sellerId }),
      req.query
    );
    const totalLength = await Product.countDocuments();

    res.status(200).json({
      ok: true,
      code: 200,
      message: 'succeeded',
      data: products,
      totalLength,
    });
  } catch (e) {
    // e.statusCode = 500
    next(e);
    // next(ServerError.badRequest(500, e.message))
    // res.status(500).send(e.message)
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const product = await Product.findOneAndUpdate(
      { _id: productId },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!product) {
      return next(ServerError.badRequest(400, 'product not found'));
    }
    if (req.body.status === 1 && (!product.sellPrice ?? !req.body.sellPrice)) {
      return next(
        ServerError.badRequest(
          400,
          'you must put sell price first to appear on website'
        )
      );
    }
    if (req.body.sellPrice <= product.originalPrice) {
      return next(
        ServerError.badRequest(400, 'sell price must be more original price')
      );
    }
    const filesPaths = [];
    console.log(req.files)
    if (req.files) {
      for (let i = 0; i < req.files.length; i++) {
        filesPaths.push(req.files[i].originalname);
        console.log(1)
        uploadToS3(req.files[i])
      }
      product.image = filesPaths;
      // console.log(product.image)
    }
    const sum = product.properties.reduce((accumulator, object) => {
      return accumulator + object.amount;
    }, 0);
    product.total_amount = sum;
    await product.save();
    res.status(200).json({
      ok: true,
      code: 200,
      message: 'succeeded',
      data: product,
    });
  } catch (e) {
    console.log(e);
    // e.statusCode = 500
    next(e);
    // next(ServerError.badRequest(500, e.message))
    // res.status(500).send(e.message)
  }
};

const getSellerOfProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById({ _id: productId });
    if (!product) return next(ServerError.badRequest(400, 'user not found'));
    // res.status(404).send('unable to found')
    const seller = await User.findById({ _id: product.seller });
    res.status(200).json({
      ok: true,
      code: 200,
      message: 'succeeded',
      data: seller,
    });
  } catch (e) {
    // e.statusCode = 500
    next(e);
    // next(ServerError.badRequest(500, e.message))
    // res.status(500).send(e.message)
  }
};
const deleteProduct = async (req, res, next) => {
  try {
    const productId = req.params.id;
    // const product = await Product.findOneAndDelete({ _id: productId })
    const product = await Product.findOne({ _id: productId });
    product.status = -2;
    await product.save();
    res.status(200).json({
      ok: true,
      code: 200,
      message: 'succeeded',
    });
  } catch (e) {
    // e.statusCode = 500
    next(e);
    // next(ServerError.badRequest(500, e.message))
    // res.status(500).send(e.message)
  }
};

const createOrder = async (req, res, next) => {
  try {
    // const seller = await User.findById({ _id: req.body.sellerId });
    const buyer = await User.findById({ _id: req.body.buyerId });
    // if (!seller)
    // return next(ServerError.badRequest(400, 'sellerId not valid'))
    if (!buyer) return next(ServerError.badRequest(400, 'buyerId not valid'));
    if (req.body.newPrice <= req.body.sellPrice) {
      return next(
        ServerError.badRequest(400, 'new price must be greater than sell price')
      );
    }
    const productId = req.body.productId;
    const product = await Product.findById({ _id: productId });
    if (!product)
      return next(ServerError.badRequest(400, 'invalid product id'));
    if (product.status !== 1)
      return next(
        ServerError.badRequest(
          400,
          'can not buy this product because it is not active'
        )
      );
    if (!product.sellPrice)
      return next(
        ServerError.badRequest(
          400,
          'can not buy this product because it is not active and do not have sell price yet'
        )
      );
    if (req.body.sellPrice !== product.sellPrice)
      return next(ServerError.badRequest(400, 'sellPrice is wrong'));
    //check if product seller is active or no
    const seller = await User.findById({ _id: product.seller });
    if (seller.status !== 'active')
      return next(
        ServerError.badRequest(
          400,
          'can not buy this product because its seller is blocked'
        )
      );
    // const ordersProperties = product.properties.filter(el => el._id.toString() === req.body.orderItems[0].propertyId)
    const validateQuantity = req?.body?.orderItems?.every(
      (el) => el.quantity > 0
    );
    if (!validateQuantity)
      return next(
        ServerError.badRequest(400, 'quantity must be positive number')
      );

    let checkForProperties = 0;
    let checkForStock = 0;
    req?.body?.orderItems?.forEach((orderItem) => {
      console.log(orderItem.propertyId);
      const checker = product.properties.find(
        (el) => el?._id?.toString() === orderItem?.propertyId
      );
      const stockChecker = product.properties.find(
        (el) =>
          el?._id?.toString() === orderItem?.propertyId &&
          el.amount >= orderItem.quantity
      );
      // console.log
      if (checker) checkForProperties++;
      if (stockChecker) checkForStock++;
    });
    console.log(checkForProperties);
    if (checkForProperties !== req.body.orderItems.length)
      return next(ServerError.badRequest(400, 'invalid property id'));
    if (checkForStock !== req.body.orderItems.length)
      return next(ServerError.badRequest(400, 'stock is low'));

    const orderQuantity = req.body.orderItems.reduce(
      (acc, cur) => cur.quantity + acc,
      0
    );
    console.log(orderQuantity);
    const shippingPrice = product.shipping_price[req.body.city];
    const totalPrice = req.body.newPrice * orderQuantity + shippingPrice;
    console.log(totalPrice);
    // console.log(totalPrice);
    // console.log(req.body.totalPrice);
    if (req.body.shippingPrice !== shippingPrice)
      return next(ServerError.badRequest(400, 'invalid shipping price'));
    if (req.body.totalPrice !== totalPrice)
      return next(ServerError.badRequest(400, 'invalid total price'));

    console.log(req.admin._id);
    const order = new Order({
      ...req.body,
      sellerId: product.seller,
      buyerId: req.body.buyerId,
      adminId: req.admin._id,
      shippingPrice,
      totalPrice,
      websiteTax: (product.sellPrice - product.originalPrice) * orderQuantity,
      buyerCommission: (req.body.newPrice - product.sellPrice) * orderQuantity,
    });
    await order.save();
    res.status(201).json({
      ok: true,
      code: 201,
      message: 'succeeded',
      data: order,
    });
  } catch (e) {
    next(e);
  }
};

const addMoreDataToOrder = async (orders) => {
  const newOrders = [];

  // await orders.map(async el => {
  if (!(orders instanceof Array)) {
    const product = await Product.findById({ _id: orders.productId });
    const buyer = await User.findById({ _id: orders.buyerId });
    const seller = await User.findById({ _id: orders.sellerId });
    const newOrderForm = { ...orders._doc };
    newOrderForm.OrderedProduct = product;
    newOrderForm.buyer = buyer;
    newOrderForm.seller = seller;
    newOrderForm.OrderedProperties = orders.orderItems.map((orderProperty) => {
      const propertiesNewForm = product.properties.find(
        (property) =>
          property._id.toString() === orderProperty.propertyId.toString()
      );
      propertiesNewForm.amount = orderProperty.quantity;
      return propertiesNewForm;
    });
    return newOrderForm;
  }
  for (const el of orders) {
    const product = await Product.findById({ _id: el.productId });
    const buyer = await User.findById({ _id: el.buyerId });
    const seller = await User.findById({ _id: el.sellerId });
    const newOrderForm = { ...el._doc };
    newOrderForm.OrderedProduct = product;
    newOrderForm.buyer = buyer;
    newOrderForm.seller = seller;
    newOrderForm.OrderedProperties = el.orderItems.map((orderProperty) => {
      const propertiesNewForm = product.properties.find(
        (property) =>
          property._id.toString() === orderProperty.propertyId.toString()
      );
      propertiesNewForm.amount = orderProperty.quantity;
      return propertiesNewForm;
    });
    newOrders.push(newOrderForm);
  }
  return newOrders;
};
const getAllOrders = async (req, res, next) => {
  try {
    const filter = { ...req.query }
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete filter[el]);

    const orders = await ApiFeatures.pagination(Order.find(filter), req.query);
    const totalLength = await Order.countDocuments(filter);
    res.status(200).json({
      ok: true,
      code: 200,
      message: 'succeeded',
      data: orders,
      totalLength,
    });
  } catch (e) {
    next(e);
  }
};

const updateOrder = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    if (!orderId || orderId.length < 24)
      return next(ServerError.badRequest(400, 'order id not valid'));
    const order = await Order.findById({ _id: orderId });
    if (!order) return next(ServerError.badRequest(400, 'order id not valid'));

    const orderState = req.body.orderState;
    order.orderState = orderState;
    await order.save()
    res.status(200).json({
      ok: true,
      code: 200,
      message: 'succeeded',
      data: order
    });
  } catch (e) {
    next(e);
  }
};

const getOrder = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    if (!orderId)
      return next(ServerError.badRequest(400, 'order id is required'));
    const order = await Order.findById({ _id: orderId });
    if (!order) return next(ServerError.badRequest(400, 'order id don\'t belong to any order'));
    res.status(200).json({
      ok: true,
      code: 200,
      message: 'succeeded',
      data: order,
    });
  } catch (e) {
    next(e);
  }
};
const getOrdersByBuyerId = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id)
      return next(ServerError.badRequest(400, 'order id not valid'));
    const orders = await ApiFeatures.pagination(
      Order.find({ buyerId: { $regex: new RegExp(id, 'i') } }),
      req.query
    );
    const totalLength = await Order.countDocuments({ buyerId: { $regex: new RegExp(id, 'i') } });
    res.status(200).json({
      ok: true,
      code: 200,
      message: 'succeeded',
      data: orders,
      totalLength,
    });
  } catch (e) {
    next(e);
  }
};
// const getOrdersByBuyerId = async (req, res, next) => {
//   try {
//     const id = req.params.id;
//     if (!id || id.length < 24)
//       return next(ServerError.badRequest(400, 'order id not valid'));
//     const orders = await ApiFeatures.pagination(
//       Order.find({ buyerId: id }),
//       req.query
//     );
//     const newOrdersForm = await addMoreDataToOrder(orders);
//     const totalLength = await Order.countDocuments({ buyerId: id });
//     res.status(200).json({
//       ok: true,
//       code: 200,
//       message: 'succeeded',
//       data: newOrdersForm,
//       totalLength,
//     });
//   } catch (e) {
//     next(e);
//   }
// };
const confirmOder = async (order, req, res, next) => {
  try {
    order.orderState = 1;
    const product = await Product.findById({ _id: order.productId });
    let checkStockError = false;
    order.orderItems.forEach(async (item) => {
      // get property
      const elIndex = product.properties.findIndex(
        (el) => el._id.toString() === item.propertyId.toString()
      );
      //check for Stock First
      if (product.properties[elIndex].amount < item.quantity)
        checkStockError = true;
      // decrease stock
      product.properties[elIndex].amount -= item.quantity;
    });
    if (checkStockError)
      return next(
        ServerError.badRequest(
          400,
          'stock is low cancel the or try again later'
        )
      );
    console.log(product);
    const sum = product.properties.reduce((acc, el) => {
      return acc + el.amount;
    }, 0);
    product.total_amount = sum;
    await product.save();
    await order.save();
    res.status(200).json({
      ok: true,
      code: 200,
      message: 'succeeded',
      order,
    });
  } catch (e) {
    next(e);
  }
};
const cancelOrder = async (order, req, res, next) => {
  try {
    const product = await Product.findById({ _id: order.productId });
    order.orderItems.forEach(async (item) => {
      // get property
      const elIndex = product.properties.findIndex(
        (el) => el._id.toString() === item.propertyId.toString()
      );
      // decrease stock
      product.properties[elIndex].amount += item.quantity;
    });
    const sum = product.properties.reduce((acc, el) => {
      return acc + el.amount;
    }, 0);
    product.total_amount = sum;
    await product.save();
    await order.save();
    res.status(200).json({
      ok: true,
      code: 200,
      message: 'succeeded',
      order,
    });
  } catch (e) {
    next(e);
  }
};
const finishOrder = async (order, req, res, next) => {
  try {
    const user = await User.findById({ _id: order.buyerId });
    const orderQuantity = order.orderItems.reduce(
      (acc, cur) => cur.quantity + acc,
      0
    );
    const checkCommission = orderQuantity * (order.newPrice - order.sellPrice);
    if (checkCommission !== order.buyerCommission)
      return next(
        ServerError.badRequest(
          400,
          'buyer commission has error in its calculation'
        )
      );
    user.balance += order.buyerCommission;
    user.save();
    order.save();
    res.status(200).json({
      ok: true,
      code: 200,
      message: 'succeeded',
      order,
    });
  } catch (e) {
    next(e);
  }
};
// const updateOrder = async (req, res, next) => {
//   try {
//     const orderId = req.params.id;
//     if (!orderId || orderId.length < 24)
//       return next(ServerError.badRequest(400, 'order id not valid'));
//     const order = await Order.findById({ _id: orderId });
//     if (!order) return next(ServerError.badRequest(400, 'order id not valid'));

//     const orderState = req.body.orderState;
//     if (!orderState)
//       return next(ServerError.badRequest(400, 'please put orderState in body'));
//     if (![-5, -4, -3, -2, -1, 0, 1, 2, 3, 4].includes(orderState))
//       return next(
//         ServerError.badRequest(400, 'orderState is not in valid range')
//       );
//     // if (order.orderState === 4 && orderState !== -5) { // return item
//     //   return next(ServerError.badRequest(400, 'order is done you can only return it'));
//     // }
//     if (order.orderState === 4) {
//       return next(
//         ServerError.badRequest(
//           400,
//           'order can not modified after it is finished'
//         )
//       );
//     }
//     if (order.orderState === 0 && orderState > 1) {
//       return next(ServerError.badRequest(400, 'order must be confirmed first'));
//     }
//     if (order.orderState >= orderState && orderState >= 0)
//       return next(
//         ServerError.badRequest(
//           400,
//           'you cannot downgrade orderState step except you canceling it '
//         )
//       );
//     if (order.orderState < 0)
//       return next(
//         ServerError.badRequest(
//           400,
//           'order is already canceled you cannot change anything in it'
//         )
//       );
//     if (orderState === 1) return await confirmOder(order, req, res, next);
//     if (orderState === 2) {
//       order.orderState = orderState;
//       await order.save();
//     }
//     if (orderState === 3) {
//       order.orderState = orderState;
//       await order.save();
//     }
//     if (orderState === 4) {
//       order.orderState = orderState;
//       return await finishOrder(order, req, res, next);
//     }
//     if ([-5, -4, -3, -2, -1].includes(orderState)) {
//       if (order.orderState === 0) {
//         order.orderState = orderState;
//         order.save();
//       } else {
//         order.orderState = orderState;
//         return await cancelOrder(order, req, res, next);
//       }
//       // order.save();
//     }
//     res.status(200).json({
//       ok: true,
//       code: 200,
//       message: 'succeeded',
//     });
//   } catch (e) {
//     next(e);
//   }
// };

const filterOrders = async (req, res, next) => {
  try {
    console.log('filter')
    const filter = req.query.state;
    const orders = await ApiFeatures.pagination(Order.find({ orderState: filter }), req.query)
    const totalLength = await Order.countDocuments({ orderState: filter })
    res.status(200).json({
      ok: true,
      status: 200,
      message: 'succeeded',
      data: orders,
      totalLength
    })
  } catch (e) {

  }
}

const updateWithdrawal = async (req, res, next) => {
  try {
    const validFields = ['transactionId'];
    let checkerForValidFields = true;
    for (const el in req.body)
      if (!validFields.includes(el)) {
        return next(ServerError.badRequest(400, 'not valid fields sent'));
        // checkerForValidFields = false;
        // break;
      }
    // if (!checkerForValidFields)
    //   return next(ServerError.badRequest(400, 'not valid fields sent'));
    // console.log(1)
    const id = req.params.id;
    if (!id || id.length < 24)
      return next(ServerError.badRequest(400, 'withdrawal id not valid'));
    const transactionId = req.body.transactionId;
    if (!transactionId)
      return next(ServerError.badRequest(400, 'please enter transaction Id'));
    const withdrawal = await Withdrawal.findById({ _id: id });
    if (!withdrawal)
      return next(ServerError.badRequest(400, 'withdrawal id not valid'));
    if (withdrawal.state === 1)
      return next(
        ServerError.badRequest(
          400,
          'withdrawal has already completed you can not update it'
        )
      );
    withdrawal.transactionId = transactionId;
    withdrawal.state = 1;
    await withdrawal.save();
    res.status(200).json({
      ok: true,
      code: 200,
      message: 'succeeded',
      data: withdrawal,
    });
  } catch (e) {
    next(e);
  }
};

const getWithdrawalById = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id || id.length < 24)
      return next(ServerError.badRequest(400, 'withdrawal id not valid'));
    const withdrawal = await Withdrawal.findById({ _id: id });
    if (!withdrawal)
      return next(ServerError.badRequest(400, 'withdrawal id not valid'));
    res.status(200).json({
      ok: true,
      code: 200,
      message: 'succeeded',
      data: withdrawal,
    });
  } catch (e) {
    next(e);
  }
};

const getWithdrawalsByBuyerId = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id || id.length < 24)
      return next(ServerError.badRequest(400, 'buyer id not valid'));
    const withdrawals = await ApiFeatures.pagination(
      Withdrawal.find({ buyerId: id }),
      req.query
    );
    const totalLength = await Withdrawal.countDocuments({ buyerId: id });
    res.status(200).json({
      ok: true,
      code: 200,
      message: 'succeeded',
      data: withdrawals,
      totalLength,
    });
  } catch (e) {
    next(e);
  }
};

const getWithdrawalsByPaymentPhone = async (req, res, next) => {
  try {
    const phoneNumber = req.params.phone;
    if (!phoneNumber || phoneNumber.length < 11)
      return next(ServerError.badRequest(400, 'phone number id not valid'));
    const withdrawals = await ApiFeatures.pagination(
      Withdrawal.find({ payment_method_number: phoneNumber }),
      req.query
    );
    const totalLength = await Withdrawal.countDocuments({
      payment_method_number: phoneNumber,
    });
    res.status(200).json({
      ok: true,
      code: 200,
      message: 'succeeded',
      data: withdrawals,
      totalLength,
    });
  } catch (e) {
    next(e);
  }
};

const getAllWithdrawals = async (req, res, next) => {
  try {
    const withdrawals = await ApiFeatures.pagination(
      Withdrawal.find({}).sort({ createdAt: -1 }),
      req.query
    );
    const totalLength = await Withdrawal.countDocuments({});
    res.status(200).json({
      ok: true,
      code: 200,
      message: 'succeeded',
      data: withdrawals,
      totalLength,
    });
  } catch (e) {
    next(e);
  }
};

const getUnpaidWithdrawals = async (req, res, next) => {
  try {
    const paid = req.query.paid;
    console.log(paid);
    if (!paid) return next(ServerError.badRequest(400, 'no state sent'));
    const paidState = paid === 'yes' ? 1 : 0;
    const withdrawals = await ApiFeatures.pagination(
      Withdrawal.find({ state: paidState }).sort({ createdAt: -1 }),
      req.query
    );
    const totalLength = await Withdrawal.countDocuments({ state: paidState });
    res.status(200).json({
      ok: true,
      code: 200,
      message: 'succeeded',
      data: withdrawals,
      totalLength,
    });
  } catch (e) {
    next(e);
  }
};
const getAllContacts = async (req, res, next) => {
  try {
    const contacts = await ApiFeatures.pagination(
      ContactUs.find({}).sort({ createdAt: -1 }),
      req.query
    );
    const totalLength = await ContactUs.countDocuments({});
    res.status(200).json({
      ok: true,
      code: 200,
      message: 'succeeded',
      data: contacts,
      totalLength,
    });
  } catch (e) {
    next(e);
  }
};
const getClosedContacts = async (req, res, next) => {
  try {
    const state = req.query.state;
    if (!state) return next(ServerError.badRequest(400, 'no state sent'));
    const intState = state === 'opened' ? 0 : 1;
    const contacts = await ApiFeatures.pagination(
      ContactUs.find({ state: intState }).sort({ createdAt: -1 }),
      req.query
    );
    const totalLength = await ContactUs.countDocuments({ state: intState });
    res.status(200).json({
      ok: true,
      code: 200,
      message: 'succeeded',
      data: contacts,
      totalLength,
    });
  } catch (e) {
    next(e);
  }
};
const updateContact = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id || id.length < 24)
      return next(ServerError.badRequest(400, 'withdrawal id not valid'));
    const contact = await ContactUs.findById({ _id: id });
    if (!contact)
      return next(ServerError.badRequest(400, 'withdrawal id not valid'));
    if (contact.state === 1)
      return next(
        ServerError.badRequest(400, 'ticket is closed you can not update it')
      );
    contact.state = 1;
    await contact.save();
    res.status(200).json({
      ok: true,
      code: 200,
      message: 'succeeded',
      data: contact,
    });
  } catch (e) {
    next(e);
  }
};


const getAllOffers = async (req, res, next) => {
  try {
    const offers = await ApiFeatures.pagination(Offer.find({}).sort({ createdAt: -1 }), req.query);
    const totalLength = await Offer.countDocuments({});
    res.status(200).json({
      ok: true,
      code: 200,
      message: 'succeeded',
      data: offers,
      totalLength,
    });
  } catch (e) {
    next(e)
  }
}
const addOffer = async (req, res, next) => {
  try {
    const offer = await Offer.create(req.body);
    res.status(201).json({
      ok: true,
      code: 201,
      message: 'succeeded',
      data: offer,
    })
  } catch (e) {
    next(e);
  }
}
const deleteOffer = async (req, res, next) => {
  const id = req.params.id;
  if (!id)
    return next(ServerError.badRequest(400, 'id is required'));
  const offer = await Offer.findByIdAndDelete(id);
  if (!offer)
    return next(ServerError.badRequest(400, 'id is not valid'));
  res.status(204).json({
    ok: true,
    status: 204,
    message: 'Offer has been deleted successfully'
  })
}
const getAllShippings = async (req, res, next) => {
  try {
    const shippings = await ApiFeatures.pagination(Shipping.find({}).sort({ createdAt: -1 }), req.query);
    const totalLength = await Shipping.countDocuments({});
    res.status(200).json({
      ok: true,
      code: 200,
      message: 'succeeded',
      data: shippings,
      totalLength,
    });
  } catch (e) {
    next(e);
  }
}
const addShippingMethod = async (req, res, next) => {
  try {
    const shipping = await Shipping.create(req.body)
    res.status(201).json({
      ok: true,
      status: 201,
      message: 'succeeded',
      shipping
    })
  } catch (e) {
    next(e);
  }
}
const updateShipping = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id)
      return next(ServerError.badRequest(400, 'id is required'));
    const shipping = await Shipping.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!shipping)
      return next(ServerError.badRequest(400, 'id is not valid'));
    res.status(200).json({
      ok: true,
      status: 200,
      message: 'succeeded',
      shipping
    })
  } catch (e) {
    next(e)
  }
}
const deleteShipping = async (req, res, next) => {
  const id = req.params.id;
  if (!id)
    return next(ServerError.badRequest(400, 'id is required'));
  const shipping = await Shipping.findByIdAndDelete(id);
  if (!shipping)
    return next(ServerError.badRequest(400, 'id is not valid'));
  res.status(204).json({
    ok: true,
    status: 204,
    message: 'Shipping has been deleted successfully'
  })
}
module.exports = {
  getAllAdmins,
  addAdmin,
  getAdminData,
  login,
  logout,
  logoutAllDevices,
  forgetPassword,
  resetPassword,
  addUser,
  getAllUsers,
  getUserById,
  updateUser,
  getUserByPhoneNumber,
  logoutUserFromAllDevices,
  addProduct,
  getAllProducts,
  getProductById,
  getProductsByCategory,
  getProductsByName,
  getProductsBySellerID,
  getAllCategories,
  updateProduct,
  getSellerOfProduct,
  deleteProduct,
  createOrder,
  getOrder,
  getAllOrders,
  getOrdersByBuyerId,
  updateOrder,
  filterOrders,
  updateWithdrawal,
  getWithdrawalById,
  getWithdrawalsByBuyerId,
  getWithdrawalsByPaymentPhone,
  getAllWithdrawals,
  getUnpaidWithdrawals,
  getAllContacts,
  getClosedContacts,
  updateContact,
  addWebsite,
  getAllWebsites,
  updateWebsite,
  deleteWebsite,
  addPopularWebsite,
  getAllPopularWebsites,
  updatePopularWebsite,
  deletePopularWebsite,
  getAllOffers,
  addOffer,
  deleteOffer,
  getAllShippings,
  addShippingMethod,
  updateShipping,
  deleteShipping,


};
