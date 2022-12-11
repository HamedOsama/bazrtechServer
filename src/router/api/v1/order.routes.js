const express = require('express')
const routes = express.Router()
const ordersController = require('../../../controllers/order.controller')
const auth = require('../../../middleware/auh')

routes.route('/')
  .post(auth, ordersController.createOrder)
  .get(auth, ordersController.getUserOrders)
// routes.route('/:id').get(auth, ordersController.getOrder)
// routes.route('/:id').patch(auth, ordersController.updateOrder)

//api/v1/order (post) add order
//api/v1/order (get) get all user's orders


module.exports = routes