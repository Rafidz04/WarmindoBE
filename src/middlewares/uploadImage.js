const multer = require("multer");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "imageLaporan");
  },
  filename: function (req, file, cb) {
    let filename = req.decoded.cabang + "-" + Date.now() + ".jpg";

    if (!req.body.foto) {
      req.body.foto = [];
      req.body.foto.push("https://uptight-bee-woolens.cyclic.app/warmindofoto/" + filename);
    } else {
      req.body.foto.push("https://uptight-bee-woolens.cyclic.app/warmindofoto/" + filename);
    }
    // req.body.foto = 'https://apijti.ptbap.net/jtifoto//' + filename;

    cb(null, filename);
  },
});

var upload = multer({ storage: storage });

module.exports = { upload };
