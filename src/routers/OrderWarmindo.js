const Router = require("express").Router();
const OrderWarmindoController = require("../controllers/OrderWarmindo");
const { jwtAuthenticate } = require("../middlewares/auth");

Router.post(
  "/addorderWarmindo",
  jwtAuthenticate,
  OrderWarmindoController.addOrderWarmindo
);
Router.get(
  "/getallorderWarmindo",
  jwtAuthenticate,
  OrderWarmindoController.getOrderWarmindo
);
Router.delete(
  "/deleteorderwarmindo",
  jwtAuthenticate,
  OrderWarmindoController.deleteOrderWarmindo
);
Router.get(
  "/getAllPendapatanWarmindo",
  jwtAuthenticate,
  OrderWarmindoController.getAllOrderWarmindo
);
Router.get(
  "/getGrafikPenghasilan",
  jwtAuthenticate,
  OrderWarmindoController.getGrafikPenghasilanWarmindo
);
Router.get(
  "/getHistoryOrderHariIni",
  jwtAuthenticate,
  OrderWarmindoController.getHistoryOrderHariIni
);

module.exports = Router;
