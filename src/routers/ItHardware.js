const Router = require("express").Router();
const { upload } = require("../middlewares/uploadImage");
const ItHardware = require("../controllers/ItHardware");

Router.post("/ajukanhardwareit", ItHardware.ajukanProblemHardwareIT);
Router.patch(
  "/responhardwareit",
  upload.array("buktiSelesai", 10),
  ItHardware.responProblemHardwareIT
);
Router.get("/gethardwareitall", ItHardware.getProblemHardwareITAll);
Router.get("/gethardwareitbystatus", ItHardware.getProblemHardwareITByStatus);
Router.get("/gethardwareitgrafik", ItHardware.getProblemHardwareItGrafik);
module.exports = Router;
