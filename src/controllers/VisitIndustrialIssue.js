const VisitIndustrialIssue = require("../models/VisitIndustrialIssue");
const path = require("path");

class Controller {
  static ajukanVisit(req, res, next) {
    let { nama } = req.decoded;
    let { jenisVisit, deskripsi, startDate, deadlineDate } = req.body;
    VisitIndustrialIssue.create({
      diajukanOleh: nama,
      jenisVisit,
      deskripsi,
      startDate,
      deadlineDate,
    })
      .then((response) => {
        res.status(200).json({
          status: 200,
          message: "Terimakasih, pengajuan kunjungan berhasil ditambahkan!",
        });
      })
      .catch(next);
  }

  static responVisit(req, res, next) {
    let { nama } = req.decoded;
    let { visitId, respon, keterangan } = req.body;
    let visit;
    let date = new Date();
    VisitIndustrialIssue.findById(visitId)
      .then((response) => {
        visit = response;
        visit.diresponOleh = nama;
        if (respon === "Done") {
          if (respon === "Done") {
            if (visit.status === "Done") {
              throw {
                message:
                  "Maaf, sudah diverifikasi dan tidak dapat diverifikasi ulang!",
                status: 400,
              };
            }
          }
          visit.solvedDate = date;
          visit.keterangan = keterangan;
          let dateLama = new Date(visit.deadlineDate);
          // dateLama.setHours(24, 0, 0, 0);
          var diff = (date - dateLama) / 3600000;
          visit.solvedInTime = diff <= 24 ? true : false;
          visit.buktiSelesai = req.body.foto;
        }
        visit.status = respon;
        return visit.save();
      })
      .then((response) => {
        res.status(200).json({
          status: 200,
          message: `Terimakasih, kunjungan berhasil diupdate!`,
        });
      })
      .catch(next);
  }

  static ajukanVisitUlang(req, res, next) {
    let { nama } = req.decoded;
    let { visitId, jenisVisit, deskripsi, startDate, deadlineDate } = req.body;
    let visit;
    VisitIndustrialIssue.findById(visitId)
      .then((response) => {
        if (response.status === "Done") {
          throw { message: "Maaf kunjungan tidak dapat diajukan ulang!" };
        } else {
          visit = response;
          visit.diajukanOleh = nama;
          visit.jenisVisit = jenisVisit;
          visit.deskripsi = deskripsi;
          visit.startDate = startDate;
          visit.deadlineDate = deadlineDate;
          return visit.save();
        }
      })
      .then((response) => {
        res.status(200).json({
          status: 200,
          message: `Terimakasih, kunjungan berhasil diupdate!`,
        });
      })
      .catch(next);
  }

  static getVisitAll(req, res, next) {
    VisitIndustrialIssue.find({})
      .sort({ createdAt: -1 })
      .then((response) => {
        res.status(200).json(response);
      })
      .catch(next);
  }

  static getVisitByStatus(req, res, next) {
    let { status } = req.query;
    let query = {};
    if (status) query = { status };
    VisitIndustrialIssue.find(query)
      .sort({ updatedAt: -1 })
      .then((response) => {
        res.status(200).json(response);
      })
      .catch(next);
  }

  static getVisitIndustrialGrafik(req, res, next) {
    let { dari, sampai } = req.query;

    let tglMulai = new Date(Number(dari));
    let tglSelesai = new Date(Number(sampai));
    VisitIndustrialIssue.find({
      $or: [{ status: "On Progress" }, { status: "Done" }],
      $and: [
        { deadlineDate: { $lt: tglSelesai } },
        { deadlineDate: { $gt: tglMulai } },
      ],
    })
      .then((respon) => {
        let Output = [
          {
            nama: "Visit Industrial Issue",
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

  static getVisitIndustrialCalendar(req, res, next) {
    VisitIndustrialIssue.aggregate([
      {
        $match: {
          status: "On Progress",
        },
      },
    ])
      .then((response) => {
        let hasil = response.map((val, index) => {
          return {
            title: val.jenisVisit,
            allDay: true,
            start: val.startDate,
            end: val.deadlineDate,
            // color: "default",
          };
        });
        res.status(200).json(hasil);
      })
      .catch(next);
  }

  static deletedVisitIsue(req, res, next) {
    let { visitId } = req.body;
    VisitIndustrialIssue.findByIdAndDelete(visitId.visitId)
      .then((respon) => {
        res.status(200).json(respon);
      })
      .catch(next);
  }
}

module.exports = Controller;
