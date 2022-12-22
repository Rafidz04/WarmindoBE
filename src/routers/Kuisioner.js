const Router = require("express").Router();
const SurveyController = require("../controllers/Survey");
const { jwtAuthenticate } = require("../middlewares/auth");

Router.get("/getsurveyquestion", SurveyController.getSurveyQuestion);
Router.post("/lakukansurvey", SurveyController.lakukanSurvey);
Router.post("/cekidusersurvey", SurveyController.cekIdUserSurvey);
Router.use(jwtAuthenticate);
Router.post("/daftarpertanyaan", SurveyController.daftarPertanyaan);
Router.get("/getallkuisioner", SurveyController.getAllKuisioner);
Router.delete("/hapuspertanyaan", SurveyController.hapusPertanyaan);
Router.get("/grafikkuisioner", SurveyController.grafikKuisioner);
Router.get("/downloadhasilsurvey", SurveyController.downloadExcelHasilSurvey);

module.exports = Router;
