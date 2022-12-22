const Axios = require("axios");

class Controller {
  static daftarFinger(req, res, next) {
    let data = req.body;
    Axios.post("http://192.168.100.24/bap/public/api/daftar_finger", {
      nopeg: data.nopeg,
    })
      .then((response) => {
        res.status(200).json(response.data);
      })
      .catch((err) => {
        if (err.response.status === 400) {
          res.status(400).json({
            message: err.response.data.message,
          });
        } else {
          next(err);
        }
      });
  }
}

module.exports = Controller;
