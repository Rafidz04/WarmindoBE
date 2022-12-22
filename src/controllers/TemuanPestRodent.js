const TemuanPestRodent = require("../models/TemuanPestRodent");
const path = require("path");

class Controller {
  static ajukanTemuan(req, res, next) {
    let { nama } = req.decoded;
    let { gedung, area, jenisTemuan, deskripsi } = req.body;
    let date = new Date();
    TemuanPestRodent.create({
      diajukanOleh: nama,
      gedung,
      area,
      jenisTemuan,
      deskripsi,
      startDate: new Date(),
      deadlineDate: date.setHours(date.getHours() + 48),
      dokumentasiAwalArr: req.body.foto,
    })
      .then((response) => {
        res.status(200).json({
          status: 200,
          message: "Terimakasih, pengajuan temuan berhasil ditambahkan!",
        });
      })
      .catch(next);
  }

  static responTemuan(req, res, next) {
    let { nama } = req.decoded;
    let { temuanId, respon, keterangan } = req.body;
    let temuan;
    let date = new Date();
    TemuanPestRodent.findById(temuanId)
      .then((response) => {
        temuan = response;
        temuan.diresponOleh = nama;
        if (respon === "Done") {
          if (temuan.status === "Done") {
            throw {
              message:
                "Maaf, sudah diverifikasi dan tidak dapat diverifikasi ulang!",
              status: 400,
            };
          }
        }
        temuan.solvedDate = date;
        let dateLama = new Date(temuan.deadlineDate);
        // dateLama.setHours(24, 0, 0, 0);
        var diff = (date - dateLama) / 3600000;
        temuan.solvedInTime = diff <= 24 ? true : false;
        temuan.dokumentasiAkhirArr = req.body.foto;
        temuan.keterangan = keterangan;
        temuan.status = respon;
        return temuan.save();
      })
      .then((response) => {
        res.status(200).json({
          status: 200,
          message: `Terimakasih, temuan berhasil diupdate!`,
        });
      })
      .catch(next);
  }

  static getTemuanAll(req, res, next) {
    TemuanPestRodent.find({})
      .sort({ createdAt: -1 })
      .then((response) => {
        res.status(200).json(response);
      })
      .catch(next);
  }

  static getTemuanByStatus(req, res, next) {
    let { status } = req.query;
    let query = {};
    if (status) query = { status };
    TemuanPestRodent.find(query)
      .sort({ updatedAt: -1 })
      .then((response) => {
        res.status(200).json(response);
      })
      .catch(next);
  }

  static getTemuanGrafik(req, res, next) {
    let { dari, sampai } = req.query;

    let tglMulai = new Date(Number(dari));
    let tglSelesai = new Date(Number(sampai));
    TemuanPestRodent.find({
      $or: [{ status: "On Progress" }, { status: "Done" }],
      $and: [
        { deadlineDate: { $lt: tglSelesai } },
        { deadlineDate: { $gt: tglMulai } },
      ],
    })
      .then((respon) => {
        let Output = [
          {
            nama: "Finding Pest & Rodent",
            "On Time": 0,
            "Not Ontime": 0,
          },
        ];

        respon.forEach((val) => {
          if (val.status == "Done" && val.solvedInTime == true) {
            Output[0]["On Time"]++;
          } else if (val.status == "Done" && val.solvedInTime == false) {
            Output[0]["Not Ontime"]++;
          } else if (
            val.status == "On Progress" &&
            new Date() <= new Date(val.deadlineDate)
          ) {
            Output[0]["On Time"]++;
          } else {
            Output[0]["Not Ontime"]++;
          }
        });
        let pencapaian = (Output[0]["On Time"] / respon.length) * 100;
        res.status(200).json({
          data: Output,
          pencapaian: respon.length ? Math.ceil(pencapaian) : 100,
          target: 100,
        });
      })
      .catch(next);
  }

  //   static getpembinaancalendar(req, res, next) {
  //     Pembinaan.aggregate([
  //       {
  //         $match: {
  //           status: "Received",
  //         },
  //       },
  //     ])
  //       .then((response) => {
  //         let hasil = response.map((val, index) => {
  //           return {
  //             title: val.title,
  //             allDay: true,
  //             start: val.startDate,
  //             end: val.deadlineDate,
  //             // color: "default",
  //           };
  //         });
  //         res.status(200).json(hasil);
  //       })
  //       .catch(next);
  //   }
}

module.exports = Controller;
