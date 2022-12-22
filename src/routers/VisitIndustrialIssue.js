const Router = require("express").Router();
const { upload } = require("../middlewares/uploadImage");
const VisitIndustrialIssue = require("../controllers/VisitIndustrialIssue");

Router.post("/ajukanvisit", VisitIndustrialIssue.ajukanVisit);
Router.patch(
  "/responvisit",
  upload.array("buktiSelesai", 10),
  VisitIndustrialIssue.responVisit
);
Router.patch("/ajukanvisitulang", VisitIndustrialIssue.ajukanVisitUlang);
Router.get("/getvisitall", VisitIndustrialIssue.getVisitAll);
Router.get("/getvisitbystatus", VisitIndustrialIssue.getVisitByStatus);
Router.get(
  "/getvisitindustrialgrafik",
  VisitIndustrialIssue.getVisitIndustrialGrafik
);
Router.get(
  "/getcalendarvisitindustrial",
  VisitIndustrialIssue.getVisitIndustrialCalendar
);
Router.delete("/deletvisitisue", VisitIndustrialIssue.deletedVisitIsue);

module.exports = Router;
