const Router = require("express").Router();
const { upload } = require("../middlewares/uploadImage");
const ProjectController = require("../controllers/Project");

Router.post("/daftarprojectkategory", ProjectController.daftarProjectKategory);
Router.post(
  "/ajukanproject",
  upload.array("dokumentasiAwalArr", 10),
  ProjectController.ajukanProject
);
Router.get("/getprojectkategory", ProjectController.getProjectKategory);
Router.get("/getprojectall", ProjectController.getprojectall);
Router.get("/getprojectgrafik", ProjectController.getprojectgrafik);
Router.get("/downloaddokumen", ProjectController.downloadDokumen);
Router.get("/getprojectbystatus", ProjectController.getprojectstatus);
Router.get("/getprojectbystatusgroup", ProjectController.getprojectstatusgroup);
Router.get("/getprojectcalendar", ProjectController.getprojectcalendar);
Router.patch(
  "/responproject",
  upload.array("dokumentasiAkhirArr", 10),
  ProjectController.responProject
);
Router.patch("/ajukanulang", ProjectController.ajukanUlang);
module.exports = Router;
