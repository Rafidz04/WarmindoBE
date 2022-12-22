const Router = require("express").Router();
const { upload } = require("../middlewares/uploadImage");
const KunjunganPestController = require("../controllers/KunjunganPestRodent");

Router.post("/ajukanvisit", KunjunganPestController.ajukanVisit);
Router.patch(
  "/responvisit",
  upload.array("buktiSelesai", 10),
  KunjunganPestController.responVisit
);
Router.patch("/ajukanvisitulang", KunjunganPestController.ajukanVisitUlang);
Router.get("/getvisitall", KunjunganPestController.getVisitAll);
Router.get("/getvisitbystatus", KunjunganPestController.getVisitByStatus);
Router.get(
  "/getgrafikkunjunganpest",
  KunjunganPestController.getGrafikKunjunganPest
);
Router.get(
  "/getcalendarvisitpest",
  KunjunganPestController.getVisitPestCalendar
);
Router.delete("/deletevisit", KunjunganPestController.deletedVisitPest);
module.exports = Router;
