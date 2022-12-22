const Router = require("express").Router();
const { upload } = require("../middlewares/uploadImage");
const SafetyController = require("../controllers/Safety");

Router.post(
  "/ajukankejadian",
  upload.array("dokumentasiAwalArr", 10),
  SafetyController.ajukanKejadian
);
Router.patch(
  "/responkejadian",
  upload.array("dokumentasiAkhirArr", 10),
  SafetyController.responKejadian
);
Router.get("/getkejadianall", SafetyController.getKejadianAll);
Router.get("/getkejadianbystatus", SafetyController.getKejadianByStatus);
Router.get("/getsafetygrafik", SafetyController.getGrafikSafety);

module.exports = Router;
