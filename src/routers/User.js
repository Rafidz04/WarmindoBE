const Router = require('express').Router();
const UserController = require('../controllers/User');
const { jwtAuthenticate } = require('../middlewares/auth');

Router.post('/login', UserController.login);
Router.post('/loginperusahaan', UserController.loginPerusahaan);
Router.post('/daftar', UserController.daftarUser);
Router.get('/refresh', jwtAuthenticate, UserController.refresh);

module.exports = Router;
