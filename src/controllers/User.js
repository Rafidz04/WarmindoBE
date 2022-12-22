const Axios = require("axios");
const User = require("../models/User");
const { generateTokenWOExp, generateTokenWithExp } = require("../helpers/jwt");
const { checkPass } = require("../helpers/hashPass");

class Controller {
  static login(req, res, next) {
    let { username, password } = req.body;

    Axios.get(
      `https://backoffice.bapguard.com/api/jtilogin?nopeg=${username}&password=${password}`
      // `http://localhost:8888/backoffice/public/api/jtilogin?nopeg=${username}&password=${password}`
    )
      .then(async (response) => {
        let data = response.data.data[0];
        const arrJTI = [
          "PT. Karyadibya Mahardhika",
          "PT. Surya Mustika Nusantara (JTI)",
          "PT. Surya Mustika Nusantara",
        ];
        if (arrJTI.includes(data.nama_perusahaan)) {
          try {
            let token = {
              cabang: data.nama_cabang,
              nama: data.nama_karyawan,
              perusahaan: data.nama_perusahaan,
            };
            let tokenHashed = await generateTokenWOExp(token);
            res.status(200).json({ ...data, tokenHashed });
          } catch (err) {
            // console.log(err);
          }
        } else {
          res
            .status(400)
            .json({ message: "Maaf anda bukan karyawan PT. JTI..." });
        }
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

  static loginPerusahaan(req, res, next) {
    let { username, password } = req.body;

    User.findOne({ username })
      .then(async (response) => {
        if (response && checkPass(password, response.password)) {
          try {
            let token = {
              cabang: response.cabang,
              nama: response.username,
              perusahaan: response.perusahaan,
            };
            let tokenHashed = await generateTokenWithExp(token);
            res.status(200).json({
              cabang: response.cabang,
              username: response.username,
              perusahaan: response.perusahaan,
              token: tokenHashed,
              menu: response.menu,
            });
          } catch (err) {
            // console.log(err);
          }
        } else {
          throw { status: 400, message: "Username atau password anda salah!" };
        }
      })
      .catch(next);
  }

  static daftarUser(req, res, next) {
    let { username, password, perusahaan, cabang } = req.body;
    User.find({ username })
      .then((response) => {
        if (response.length === 0) {
          return User.create({ username, password, perusahaan, cabang });
        } else {
          throw { status: 400, message: "Maaf username sudah digunakan." };
        }
      })
      .then((response) => {
        res.status(200).json({ message: "User berhasil didaftarkan" });
      })
      .catch(next);
  }

  static refresh(req, res, next) {
    User.findOne({ username: req.decoded.nama })
      .then(async (response) => {
        if (response) {
          try {
            let token = {
              cabang: response.cabang,
              nama: response.username,
              perusahaan: response.perusahaan,
            };
            let tokenHashed = await generateTokenWithExp(token);
            res.status(200).json({
              cabang: response.cabang,
              username: response.username,
              perusahaan: response.perusahaan,
              token: tokenHashed,
              menu: response.menu,
            });
          } catch (err) {
            // console.log(err);
          }
        } else {
          throw { status: 403, message: "Kredensial bermasalah" };
        }
      })
      .catch(next);
  }
}

module.exports = Controller;
