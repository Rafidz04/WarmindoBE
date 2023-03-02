const Router = require("express").Router();
const StokWarmindoController = require("../controllers/StokWarmindo");
const { jwtAuthenticate } = require("../middlewares/auth");
const { upload } = require("../middlewares/uploadFotoProduk");

Router.use(jwtAuthenticate);
Router.post(
  "/addStokWarmindo",
  upload.single("fotoProduk"),
  StokWarmindoController.daftarStokWarmindo
);
Router.get("/getallStokWarmindo", StokWarmindoController.getStokWarmindo);
Router.patch("/updateStokWarmindo", StokWarmindoController.editStokWarmindo);
Router.delete("/deletestokwarmindo", StokWarmindoController.deleteStokWarmindo);
Router.get("/getHarusOrder", StokWarmindoController.getHarusOrder);

module.exports = Router;
