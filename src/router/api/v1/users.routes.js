const express = require('express')
const routes = express.Router()
const usersController = require('../../../controllers/users.controller')
const auth = require('../../../middleware/auh')

routes.route('/signup').post(usersController.signup)
routes.route('/login').post(usersController.login)
routes.route('/get-all').get(usersController.getAll)
// routes.route('/auth/reset-password/:token').put(usersController.resetPassword)
// routes.route('/forget-password').put(usersController.forgetPassword)

// routes.use(auth)
routes.route('/get-user-info').get(auth, usersController.getUserInfo)
//order
routes.route('/change-password').put(auth, usersController.changePassword)
routes.route('/logout').delete(auth, usersController.logout)
routes.route('/logout-all-devices').delete(auth, usersController.logoutAll)
routes.route('/update').patch(auth, usersController.updateUser)

module.exports = routes;