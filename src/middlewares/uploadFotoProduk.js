const multer = require("multer");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "fotoProduk");
  },
  filename: function (req, file, cb) {
    let filename = "warmindo88-" + Date.now() + ".jpg";

    if (!req.body.foto) {
      req.body.foto = "http://192.168.1.11:9030/warmindofoto/" + filename
     
    } 

    cb(null, filename);
  },
});

var upload = multer({ storage: storage });

module.exports = { upload };
