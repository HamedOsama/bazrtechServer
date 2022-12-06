const express = require('express')
const routes = express.Router()
const adminController = require('../../../controllers/admin.controller')
const auth = require('../../../middleware/adminAuth')
const { Uploads } = require('../../../utils/uploadPhoto')

// routes do not need for authentication
routes.route('/login').post(adminController.login)


routes.route('/add').post(adminController.addAdmin)
// routes.route('/forget-password').put(adminController.forgetPassword)
// routes.route('/reset-password/:token').put(adminController.resetPassword)
// routes.use(auth)
// routes need for authentication
// admin controllers
routes.route('/get-data').get(auth, adminController.getAdminData)
routes.route('/logout').delete(auth, adminController.logout)
routes.route('/logout-all').delete(auth, adminController.logoutAllDevices)
//users
routes.route('/users/add').post(auth, adminController.addUser)
routes.route('/users/user/:id').get(auth, adminController.getUserById)
routes.route('/users/phone/:phone').get(auth, adminController.getUserByPhoneNumber)
routes.route('/users/all').get(auth, adminController.getAllUsers)
routes.route('/users/logout/:id').delete(auth, adminController.logoutUserFromAllDevices)
//products
// routes.route('/products/categories/all').get(auth, adminController.getAllCategories)
// routes.route('/products/all').get(auth, adminController.getAllProducts)
// routes.route('/products/id/:id').get(auth, adminController.getProductById)
// routes.route('/products/category/:cat').get(auth, adminController.getProductsByCategory)
// routes.route('/products/name/:name').get(auth, adminController.getProductsByName)
// routes.route('/products/seller/:id').get(auth, adminController.getProductsBySellerID)
// routes.route('/products/product/get-seller/:id').get(auth, adminController.getSellerOfProduct)
// routes.route('/products/product/:id').delete(auth, adminController.deleteProduct)



// order routes
// routes.route('/order/add').post(auth, adminController.createOrder);
// routes.route('/order/all').get(auth, adminController.getAllOrders);
// routes.route('/order/:id').patch(auth, adminController.updateOrder);
// routes.route('/order/id/:id').get(auth, adminController.getOrder);
// routes.route('/order/seller/:id').get(auth, adminController.getOrdersBySellerId);
// routes.route('/order/buyer/:id').get(auth, adminController.getOrdersByBuyerId);


// change buffer to photo
// routes.use(Uploads.single('avatar'))
//users
// routes.route('/users/update/:id').patch(auth, Uploads.single('avatar'), adminController.updateUser)
//products
// routes.route('/products/add').post(auth, Uploads.array('avatar', 8), adminController.addProduct)
// routes.route('/products/product/:id').patch(auth, Uploads.array('avatar', 8), adminController.updateProduct)

// withdrawal
// routes.route('/withdrawal/all').get(auth, adminController.getAllWithdrawals)
// routes.route('/withdrawal/paid').get(auth, adminController.getUnpaidWithdrawals)
// routes.route('/withdrawal/:id').get(auth, adminController.getWithdrawalById)
// routes.route('/withdrawal/buyer/:id').get(auth, adminController.getWithdrawalsByBuyerId)
// routes.route('/withdrawal/phone/:phone').get(auth, adminController.getWithdrawalsByPaymentPhone)

// routes.route('/withdrawal/:id').patch(auth, adminController.updateWithdrawal)

// contact Us 
routes.route('/contact-us/all').get(auth, adminController.getAllContacts)
routes.route('/contact-us/all/opened').get(auth, adminController.getClosedContacts)
routes.route('/contact-us/:id').patch(auth, adminController.updateContact)

// websites
routes.route('/websites')
  .get(auth, adminController.getAllWebsites)
  .post(auth, adminController.addWebsite)
routes.route('/websites/:id')
  .patch(auth, adminController.updateWebsite)
  .delete(auth, adminController.deleteWebsite);
// /api/v1/admin/websites (get) get all websites
// /api/v1/admin/websites (post) add website
// /api/v1/admin/websites/:id (patch) update website
// /api/v1/admin/websites/:id (delete) delete website
// popular websites
routes.route('/popular-websites')
  .get(auth, adminController.getAllPopularWebsites)
  .post(auth, adminController.addPopularWebsite)
routes.route('/popular-websites/:id')
  .patch(auth, adminController.updatePopularWebsite)
  .delete(auth, adminController.deletePopularWebsite);

// /api/v1/admin/popular-websites (get) get all popular-websites
// /api/v1/admin/popular-websites (post) add popular-website
// /api/v1/admin/popular-websites/:id (patch) update popular-website
// /api/v1/admin/popular-websites/:id (delete) delete popular-website


//offers

routes.route('/offers')
  .get(auth, adminController.getAllOffers)
  .post(auth, adminController.addOffer)
routes.route('/offers/:id').delete(auth, adminController.deleteOffer)

// /api/v1/admin/offers (get) get all offers
// /api/v1/admin/offers (post) add offer
// /api/v1/admin/offers/:id (delete) delete offer
module.exports = routes