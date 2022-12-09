const Router = require('express');
const usersRoutes = require('./api/v1/users.routes')
const productsRoutes = require('./api/v1/products.routes')
const ordersRoutes = require('./api/v1/order.routes')
const withdrawalRoutes = require('./api/v1/withdrawal.routes')
const contactUsRoutes = require('./api/v1/contactUs.routes')
const adminRoutes = require('./api/v1/admin.routes')
const websitesRouters = require('./api/v1/website.routes')
const popularWebsitesRouters = require('./api/v1/popularWebsites.routes')
const offersRouters = require('./api/v1/offers.routes')
const calculatorRouters = require('./api/v1/calculateShipping.routes')
const routes = Router();
routes.use('/users', usersRoutes);
routes.use('/products', productsRoutes);
routes.use('/order', ordersRoutes);
routes.use('/admin', adminRoutes);
routes.use('/user', withdrawalRoutes);
routes.use('/contact-us', contactUsRoutes);
routes.use('/websites', websitesRouters);
routes.use('/popular-websites', popularWebsitesRouters);
routes.use('/offers', offersRouters);
routes.use('/calculate' , calculatorRouters)

module.exports = routes;
