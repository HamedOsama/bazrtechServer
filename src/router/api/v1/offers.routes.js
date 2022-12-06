const {Router} = require('express');

const adminController = require('../../../controllers/admin.controller')
const routes = Router();

routes.route('/').get(adminController.getAllOffers)

module.exports = routes