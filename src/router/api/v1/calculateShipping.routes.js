const {Router}  = require('express');

const calculatorController = require('../../../controllers/calculator.controller');

const routes = Router();

routes.route('/').post(calculatorController.calculateShipping);

// api/v1/calculate {
//  country ,price ,category,weight
//}
module.exports = routes