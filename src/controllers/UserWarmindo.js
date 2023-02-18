const Axios = require("axios");
const UserWarmindo = require("../models/UserWarmindo");
const { generateTokenWOExp, generateTokenWithExp } = require("../helpers/jwt");
const { checkPass } = require("../helpers/hashPass");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

class Controller {
  static daftarUserWarmindo(req, res, next) {
    let { email, nama, password, role } = req.body;

    UserWarmindo.create({ email, password, nama, role })
      .then((response) => {
        res.status(200).json({ message: "User berhasil didaftarkan" });
      })
      .catch(next);
  }
  static deleteUserWarmindo(req, res, next) {
    
    let { _id } = req.body;
    
    if (_id == "") {
      throw {
        message: "Maaf ID tidak boleh kosong",
      };
    } else {
      UserWarmindo.findOne({ _id })
        .then((response) => {
         return UserWarmindo.deleteOne({ "_id" : ObjectId(_id) });
        })
        .then((response) => {
          res.status(200).json({
            status: 200,
            message: "User berhasil didelete!",
          });
        })
        .catch(next);
    }
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
    UserWarmindo.findOne({ email })
      .then(async (response) => {
        if (response && checkPass(password, response.password)) {
          try {
            let token = {
              email: response.email,
              nama: response.nama,
              role:response.role
            };
            let tokenHashed = await generateTokenWithExp(token);
            res.status(200).json({
              email: response.email,
              nama: response.nama,
              role:response.role,
              token: tokenHashed,
            });
            console.log(response)
          } catch (err) {
            console.log(err);
          }
        } else {
          throw { status: 400, message: "email atau password anda salah!" };
        }
      })
      .catch(next);
  }

  static refresh(req, res, next) {
    UserWarmindo.findOne({ nama: req.decoded.nama })
      .then(async (response) => {
        console.log(response,"INI RESPONREFRESH")
        if (response) {
          try {
            let token = {
              email: response.email,
              nama: response.nama,
              role:response.role
            };
            let tokenHashed = await generateTokenWithExp(token);
            res.status(200).json({
              email: response.email,
              nama: response.nama,
              role:response.role,
              token: tokenHashed,
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
