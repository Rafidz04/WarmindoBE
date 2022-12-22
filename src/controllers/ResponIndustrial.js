const ResponIndustrial = require("../models/ResponIndustrial");
const path = require("path");

class Controller {
  static ajukanIssue(req, res, next) {
    let { nama } = req.decoded;
    let { jenisIssue, deskripsi } = req.body;
    let date = new Date();
    ResponIndustrial.create({
      diajukanOleh: nama,
      jenisIssue,
      deskripsi,
      startDate: new Date(),
      deadlineDate: date.setHours(date.getHours() + 72),
    })
      .then((response) => {
        res.status(200).json({
          status: 200,
          message: "Terimakasih, pengajuan issue berhasil ditambahkan!",
        });
      })
      .catch(next);
  }

  static responIssue(req, res, next) {
    let { nama } = req.decoded;
    let { issueId, respon, keterangan } = req.body;
    let issue;
    let date = new Date();
    ResponIndustrial.findById(issueId)
      .then((response) => {
        issue = response;
        issue.diresponOleh = nama;
        if (respon === "Done") {
          if (issue.status === "Done") {
            throw {
              message:
                "Maaf, sudah diverifikasi dan tidak dapat diverifikasi ulang!",
              status: 400,
            };
          }
        }
        issue.solvedDate = date;
        let dateLama = new Date(issue.deadlineDate);
        // dateLama.setHours(24, 0, 0, 0);
        var diff = (date - dateLama) / 3600000;
        issue.solvedInTime = diff <= 24 ? true : false;
        issue.buktiSelesai = req.body.foto;
        issue.keterangan = keterangan;
        issue.status = respon;
        return issue.save();
      })
      .then((response) => {
        res.status(200).json({
          status: 200,
          message: `Terimakasih, issue berhasil diupdate!`,
        });
      })
      .catch(next);
  }

  static getIssueAll(req, res, next) {
    ResponIndustrial.find({})
      .sort({ createdAt: -1 })
      .then((response) => {
        res.status(200).json(response);
      })
      .catch(next);
  }

  static getIssueByStatus(req, res, next) {
    let { status } = req.query;
    let query = {};
    if (status) query = { status };
    ResponIndustrial.find(query)
      .sort({ updatedAt: -1 })
      .then((response) => {
        res.status(200).json(response);
      })
      .catch(next);
  }

  static getResponIssueGrafik(req, res, next) {
    let { dari, sampai } = req.query;

    let tglMulai = new Date(Number(dari));
    let tglSelesai = new Date(Number(sampai));
    ResponIndustrial.find({
      $or: [{ status: "On Progress" }, { status: "Done" }],
      $and: [
        { deadlineDate: { $lt: tglSelesai } },
        { deadlineDate: { $gt: tglMulai } },
      ],
    })
      .then((respon) => {
        let Output = [
          {
            nama: "Respon Issue",
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
}

module.exports = Controller;
