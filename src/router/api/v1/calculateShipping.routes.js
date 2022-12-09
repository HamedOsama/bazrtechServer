const {Router}  = require('express');

const calculatorController = require('../../../controllers/calculator.controller');

const routes = Router();

routes.route('/').post(calculatorController.calculateShipping);


module.exports = routes