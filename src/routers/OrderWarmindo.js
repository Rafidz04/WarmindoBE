const Router = require('express').Router();
const OrderWarmindoController = require('../controllers/OrderWarmindo');
const { jwtAuthenticate } = require('../middlewares/auth');

Router.post('/addorderWarmindo', OrderWarmindoController.addOrderWarmindo);
Router.get('/getallorderWarmindo', jwtAuthenticate, OrderWarmindoController.getOrderWarmindo)
Router.delete("/deleteorderwarmindo", jwtAuthenticate, OrderWarmindoController.deleteOrderWarmindo);

module.exports = Router;