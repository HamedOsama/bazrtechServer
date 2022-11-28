const express = require('express')
const routes = express.Router()
const websiteController = require('../../../controllers/website.controller');

routes.route('/').get(websiteController.getAllWebsites);

module.exports = routes;