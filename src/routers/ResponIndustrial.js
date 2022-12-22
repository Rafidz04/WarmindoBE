const Router = require("express").Router();
const { upload } = require("../middlewares/uploadImage");
const ResponIndustrial = require("../controllers/ResponIndustrial");

Router.post("/ajukanissue", ResponIndustrial.ajukanIssue);
Router.patch(
  "/responissue",
  upload.array("buktiSelesai", 10),
  ResponIndustrial.responIssue
);
Router.get("/getissueall", ResponIndustrial.getIssueAll);
Router.get("/getissuebystatus", ResponIndustrial.getIssueByStatus);
Router.get("/getresponissuegrafik", ResponIndustrial.getResponIssueGrafik);

module.exports = Router;
