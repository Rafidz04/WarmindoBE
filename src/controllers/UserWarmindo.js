const Axios = require("axios");
const UserWarmindo = require("../models/UserWarmindo");
const { generateTokenWOExp, generateTokenWithExp } = require("../helpers/jwt");
const { checkPass } = require("../helpers/hashPass");

class Controller {
  static daftarUserWarmindo(req, res, next) {
    let { email, nama, password, role } = req.body;
    UserWarmindo.create({ email, password, nama, role })
      .then((response) => {
        res.status(200).json({ message: "User berhasil didaftarkan" });
      })
      .catch(next);
  }

  static getUserWarmindo(req, res, next) {
    UserWarmindo.find({})
      .then((response) => {
        res.status(200).json({ data: response });
      })
      .catch(next);
  }
  static loginWarmindo(req, res, next) {
    let { email, password } = req.body;
    console.log(email);
    UserWarmindo.findOne({ email })
      .then(async (response) => {
        console.log(response);
        if (response && checkPass(password, response.password)) {
          try {
            let token = {
              email: response.email,
              nama: response.nama,
            };
            let tokenHashed = await generateTokenWithExp(token);
            res.status(200).json({
              email: response.email,
              nama: response.nama,
              token: tokenHashed,
            });
          } catch (err) {
            console.log(err);
          }
        } else {
          throw { status: 400, message: "email atau password anda salah!" };
        }
      })
      .catch(next);
  }
}

module.exports = Controller;
