const Safety = require("../models/Safety");
const path = require("path");

class Controller {
  static ajukanKejadian(req, res, next) {
    let { nama } = req.decoded;
    let { namaKaryawan, jabatan, jenisKejadian, deskripsi } = req.body;
    let date = new Date();
    Safety.create({
      diajukanOleh: nama,
      namaKaryawan,
      jabatan,
      jenisKejadian,
      deskripsi,
      startDate: new Date(),
      deadlineDate: date.setHours(date.getHours() + 24),
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

  static responKejadian(req, res, next) {
    let { nama } = req.decoded;
    let { kejadianId, respon, keterangan } = req.body;
    let kejadian;
    let date = new Date();
    Safety.findById(kejadianId)
      .then((response) => {
        kejadian = response;
        kejadian.diresponOleh = nama;
        if (respon === "Done") {
          if (kejadian.status === "Done") {
            throw {
              message:
                "Maaf, sudah diverifikasi dan tidak dapat diverifikasi ulang!",
              status: 400,
            };
          }
        }
        kejadian.solvedDate = date;
        let dateLama = new Date(kejadian.deadlineDate);
        // dateLama.setHours(24, 0, 0, 0);
        var diff = (date - dateLama) / 3600000;
        kejadian.solvedInTime = diff <= 24 ? true : false;
        kejadian.dokumentasiAkhirArr = req.body.foto;
        kejadian.keterangan = keterangan;
        kejadian.status = respon;
        return kejadian.save();
      })
      .then((response) => {
        res.status(200).json({
          status: 200,
          message: `Terimakasih, temuan berhasil diupdate!`,
        });
      })
      .catch(next);
  }

  static getKejadianAll(req, res, next) {
    Safety.find({})
      .sort({ createdAt: -1 })
      .then((response) => {
        res.status(200).json(response);
      })
      .catch(next);
  }

  static getKejadianByStatus(req, res, next) {
    let { status } = req.query;
    let query = {};
    if (status) query = { status };
    Safety.find(query)
      .sort({ updatedAt: -1 })
      .then((response) => {
        res.status(200).json(response);
      })
      .catch(next);
  }

  static getGrafikSafety(req, res, next) {
    let { dari, sampai } = req.query;

    let tglMulai = new Date(Number(dari));
    let tglSelesai = new Date(Number(sampai));
    Safety.find({
      $or: [{ status: "Penanganan" }, { status: "Done" }],
      $and: [
        { startDate: { $lt: tglSelesai } },
        { startDate: { $gt: tglMulai } },
      ],
    })
      .then((respon) => {
        let Output = [
          {
            nama: "Safety",
            "On Time": 0,
            "Not Ontime": 0,
          },
        ];

        let F = 0;
        let LTI = 0;
        let RWC = 0;
        let MTC = 0;
        let FAC = 0;
        let NM = 0;

        respon.forEach((val) => {
          if (val.status == "Done" && val.solvedInTime == true) {
            Output[0]["On Time"]++;
          } else if (val.status == "Done" && val.solvedInTime == false) {
            Output[0]["Not Ontime"]++;
          } else if (
            val.status == "Penanganan" &&
            new Date() <= new Date(val.deadlineDate)
          ) {
            Output[0]["On Time"]++;
          } else {
            Output[0]["Not Ontime"]++;
          }

          if (val.jenisKejadian == "Fatalities") {
            F++;
          } else if (val.jenisKejadian == "Lost time injuries (LTI)") {
            LTI++;
          } else if (val.jenisKejadian == "Restricted Work Cases (RWC)") {
            RWC++;
          } else if (val.jenisKejadian == "Medical Treatment Cases (MTC)") {
            MTC++;
          } else if (val.jenisKejadian == "First Aid Case (FAC)") {
            FAC++;
          } else if (val.jenisKejadian == "Near Miss (NM)") {
            NM++;
          }
        });
        let pencapaian = (Output[0]["On Time"] / respon.length) * 100;
        let F1 = F > 0 ? 0 : 100;
        let LTI1 = LTI > 0 ? 0 : 100;
        let RWC1 = RWC > 0 ? 0 : 100;
        let MTC1 = MTC > 0 ? 0 : 100;
        let FAC1 = FAC == 0 ? 100 : FAC == 1 ? 60 : FAC == 2 ? 30 : 0;
        let NM1 =
          NM == 0 ? 100 : NM == 1 ? 70 : NM == 2 ? 40 : NM == 3 ? 20 : 0;
        res.status(200).json({
          data: Output,
          pencapaian: respon.length ? Math.ceil(pencapaian) : 100,
          F2: F1,
          LTI2: LTI1,
          RWC2: RWC1,
          MTC2: MTC1,
          FAC2: FAC1,
          NM2: NM1,
          target: 100,
        });
      })
      .catch(next);
  }
}

module.exports = Controller;
