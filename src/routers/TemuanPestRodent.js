const Router = require("express").Router();
const { upload } = require("../middlewares/uploadImage");
const TemuanPestRodentController = require("../controllers/TemuanPestRodent");

Router.post(
  "/ajukantemuanpest",
  upload.array("dokumentasiAwalArr", 10),
  TemuanPestRodentController.ajukanTemuan
);
Router.patch(
  "/respontemuanpest",
  upload.array("dokumentasiAkhirArr", 10),
  TemuanPestRodentController.responTemuan
);
Router.get("/gettemuanpestall", TemuanPestRodentController.getTemuanAll);
Router.get(
  "/gettemuanpestbystatus",
  TemuanPestRodentController.getTemuanByStatus
);

Router.get("/gettemuanpestgrafik", TemuanPestRodentController.getTemuanGrafik);
module.exports = Router;
