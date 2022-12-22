const Router = require("express").Router();
const { upload } = require("../middlewares/uploadImage");
const PembinaanController = require("../controllers/Pembinaan");

Router.post("/ajukanpembinaan", PembinaanController.ajukanPembinaan);
Router.patch(
  "/responpembinaan",
  upload.array("buktiSelesai", 10),
  PembinaanController.responPembinaan
);
Router.patch("/ajukanpembinaanulang", PembinaanController.ajukanPembinaanUlang);
Router.get("/getpembinaanall", PembinaanController.getPembinaanAll);
Router.get("/getpembinaanbystatus", PembinaanController.getPembinaanByStatus);
Router.get("/getgrafikpembinaan", PembinaanController.getGrafikPembinaan);
module.exports = Router;
