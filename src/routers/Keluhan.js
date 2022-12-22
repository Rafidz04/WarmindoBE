const Router = require('express').Router();
const KeluhanController = require('../controllers/Keluhan');
const { upload } = require('../middlewares/uploadImage');
const { jwtAuthenticate } = require('../middlewares/auth');
Router.post(
  '/daftarkeluhanbakalan',
  (req, res, next) => {
    req.decoded = {};
    req.decoded.cabang = 'Bakalan';
    next();
  },
  upload.array('dokumentasiAwalArr', 10),
  KeluhanController.daftarKeluhan
);

Router.get('/gettimeline', KeluhanController.getTimeLine);
Router.use(jwtAuthenticate);
Router.get('/getkeluhanbyruangan', KeluhanController.getKeluhanByRuangan);
Router.get('/getkeluhanall', KeluhanController.getKeluhanAll);
Router.get('/keluhangrafik', KeluhanController.keluhangrafik);
Router.post(
  '/verifykeluhan',
  upload.array('dokumentasiAkhirArr', 10),
  KeluhanController.verifyKeluhan
);

module.exports = Router;
