const multer = require('multer');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'FileProject');
  },
  filename: function (req, file, cb) {
    let filename = file.originalname;
    if (!req.body.dokumen) {
      req.body.dokumen = [];
      req.body.dokumen.push(filename);
    } else {
      req.body.dokumen.push(filename);
    }

    cb(null, filename);
  },
});

var upload = multer({ storage: storage });

module.exports = { upload };
