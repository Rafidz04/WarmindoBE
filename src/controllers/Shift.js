const Shift = require("../models/Shift");
const Ruangan = require("../models/Ruangan");
const JadwalPatroli = require("../models/JadwalPatroli");
const CalendarPatroli = require("../models/CalendarPatroli");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

class Controller {
  static daftarShift(req, res, next) {
    let { jam, durasi } = req.body;
    if (JSON.parse(jam).length === 0) {
      throw {
        message: "Maaf masukan jam shift selesai terlebih dahulu",
        status: 400,
      };
    } else {
      Shift.create({ jam: JSON.parse(jam), durasi })
        .then((response) => {
          res.status(200).json({ message: "Shift berhasil ditambahkan" });
        })
        .catch(next);
    }
  }
  static getShift(req, res, next) {
    Shift.find({})
      .sort({ jam: 1 })
      .then((response) => {
        res.status(200).json(response);
      })
      .catch(next);
  }

  static assignShiftToRoom(req, res, next) {
    let { idRooms, idShift } = req.body;
    let roomIds = JSON.parse(idRooms);
    let updateShiftArrayPromise = roomIds.map((val, index) => {
      return Ruangan.updateOne({ _id: val }, { idShift: idShift });
    });

    Ruangan.updateMany({ idShift }, { idShift: null })
      .then((response) => {
        return Promise.all(updateShiftArrayPromise);
      })
      .then((response) => {
        res.status(200).json({
          status: 200,
          message: "Shift berhasil diassign pada ruangan!",
        });
      })
      .catch(next);

    //   .catch(next);
  }
  static deleteShift(req, res, next) {
    let { _id } = req.body;

    Ruangan.findOne({ idShift: _id })
      .then((response) => {
        if (response) {
          throw {
            message:
              "Maaf shift tidak dapat dihapus. Masih ada ruangan yang menggunakan shift ini!",
          };
        } else {
          return Shift.deleteOne({ _id });
        }
      })
      .then((response) => {
        res.status(200).json({
          status: 200,
          message: "Shift berhasil didelete!",
        });
      })
      .catch(next);
  }

  static addJadwalLibur(req, res, next) {
    let { namaAcara, tanggal, startDate, endDate } = req.body;
    // console.log(namaAcara);
    // console.log(tanggal);
    // console.log(startDate);
    // console.log(endDate);
    CalendarPatroli.create({
      namaAcara,
      startDate,
      endDate,
    })
      .then((response) => {
        if (response) {
          let tmp = tanggal.map((val) => {
            return {
              namaAcara,
              eventDate: val,
              idCalendarPatroli: response._id,
            };
          });

          return JadwalPatroli.create(tmp);
        } else {
          throw {
            message: "Maaf setting jadwal gagal dilakukan!",
          };
        }
      })
      .then((response) => {
        res.status(200).json({
          message: "Jadwal berhasil dibuat!",
        });
      })
      .catch(next);
  }

  static getJadwalLibur(req, res, next) {
    CalendarPatroli.find()
      .then((respon) => {
        let hasil = respon.map((val) => {
          return {
            id: val._id,
            title: val.namaAcara,
            allDay: true,
            start: val.startDate,
            end: val.endDate,
            // color: "default",
          };
        });
        res.status(200).json(hasil);
      })
      .catch(next);
  }

  static deleteJadwalLibur(req, res, next) {
    let { idJadwal } = req.body;
    CalendarPatroli.findByIdAndDelete({
      _id: idJadwal.idJadwal,
    })
      .then((respon) => {
        if (respon) {
          return JadwalPatroli.deleteMany({
            idCalendarPatroli: ObjectId(idJadwal.idJadwal),
          });
        } else {
          throw {
            message: "Maaf gagal menghapus data!",
          };
        }
      })
      .then((respons) => {
        res.status(200).json({
          message: "Data berhasil dihapus!",
        });
      })
      .catch(next);
  }
}

module.exports = Controller;
