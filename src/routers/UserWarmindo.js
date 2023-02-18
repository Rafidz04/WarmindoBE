const Router = require('express').Router();
const UserWarmindoController = require('../controllers/UserWarmindo');
const { jwtAuthenticate } = require('../middlewares/auth');

Router.post('/daftarUserWarmindo', UserWarmindoController.daftarUserWarmindo);
Router.get('/getallUserWarmindo', jwtAuthenticate, UserWarmindoController.getUserWarmindo)
Router.post('/loginWarmindo', UserWarmindoController.loginWarmindo)
Router.get('/refresh', jwtAuthenticate, UserWarmindoController.refresh);
Router.delete('/deleteUserWarmindo',jwtAuthenticate,UserWarmindoController.deleteUserWarmindo)
Router.patch('/updatePassword',jwtAuthenticate,UserWarmindoController.editUserWarmindo)

module.exports = Router;