const Router = require('express').Router();
const StokWarmindoController = require('../controllers/StokWarmindo');
const { jwtAuthenticate } = require('../middlewares/auth');

Router.post('/addStokWarmindo', jwtAuthenticate, StokWarmindoController.daftarStokWarmindo);
Router.get('/getallStokWarmindo', jwtAuthenticate, StokWarmindoController.getStokWarmindo);
Router.delete("/deletestokwarmindo", jwtAuthenticate, StokWarmindoController.deleteStokWarmindo);

module.exports = Router;