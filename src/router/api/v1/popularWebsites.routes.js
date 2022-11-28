const {Router}  = require('express');
const websitesController = require('../../../controllers/popularWebsites.controller');

const routes = Router();

routes.route('/').get(websitesController.getAllWebsites);

module.exports = routes;