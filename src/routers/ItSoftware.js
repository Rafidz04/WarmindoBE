const Router = require("express").Router();
const { upload } = require("../middlewares/uploadImage");
const ItSoftware = require("../controllers/ItSoftware");

Router.post("/ajukansoftwareit", ItSoftware.ajukanProblemSoftwareIT);
Router.patch(
  "/responsoftwareit",
  upload.array("buktiSelesai", 10),
  ItSoftware.responProblemSoftwareIT
);
Router.get("/getsoftwareitall", ItSoftware.getProblemSoftwareITAll);
Router.get("/getsoftwareitbystatus", ItSoftware.getProblemSoftwareITByStatus);
Router.get("/getsoftwareitgrafik", ItSoftware.getProblemSoftwareItGrafik);
module.exports = Router;
