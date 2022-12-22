const Axios = require('axios');
const KategoryLaporan = require('../models/KategoryLaporan');
const Laporan = require('../models/LaporanKebersihan');
const JamLaporan = require('../models/JamLaporan');
const Lokasi = require('../models/Ruangan');
const moment = require('moment');

class Controller {
  static daftarJamLaporan(req, res, next) {
    let { nama, cabang, perusahaan } = req.decoded;
    let { jam, durasi } = req.body;

    JamLaporan.create({ jam, durasi })
      .then((response) => {
        res.status(200).json({ message: 'Shift berhasil ditambahkan' });
      })
      .catch(next);
  }
  static getJamLaporan(req, res, next) {
    let { nama, cabang, perusahaan } = req.decoded;

    JamLaporan.find({})
      .sort({ jam: 1 })
      .then((response) => {
        res.status(200).json(response);
      })
      .catch(next);
  }
  static deleteJamLaporan(req, res, next) {
    let { nama, cabang, perusahaan } = req.decoded;
    JamLaporan.deleteOne({ _id: req.body._id })
      .then((response) => {
        res
          .status(200)
          .json({ status: 200, message: 'Jam Laporan berhasil dihapus!' });
      })
      .catch(next);
  }

  static historyLaporan(req, res, next) {
    let { nama, cabang, perusahaan } = req.decoded;
    let { tglmulai, tglselesai } = req.query;
    let matchQuery = { cabang, perusahaan };
    if (tglmulai) {
      let tmp = new Date(tglmulai);
      tmp.setHours(0, 0, 0, 0);
      matchQuery = {
        createdAt: {
          $gt: tmp,
        },
        ...matchQuery,
      };
    }
    if (tglselesai) {
      let tmp = new Date(tglselesai);
      tmp.setHours(24, 0, 0, 0);
      matchQuery = {
        ...matchQuery,
        createdAt: matchQuery.createdAt
          ? {
              $gt: matchQuery.createdAt.$gt,
              $lt: tmp,
            }
          : {
              $lt: tmp,
            },
      };
    }

    Laporan.aggregate([
      {
        $match: { ...matchQuery },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ])
      .then((response) => {
        res.status(200).json(response);
      })
      .catch(next);
  }

  static historyLaporanuser(req, res, next) {
    let { nama, cabang, perusahaan } = req.decoded;
    let { gedung, area } = req.query;

    let matchQuery = { cabang, perusahaan, namaPelapor: nama };
    if (gedung) {
      matchQuery = { gedung, ...matchQuery };
    }
    if (area) {
      matchQuery = { area, ...matchQuery };
    }
    Laporan.aggregate([
      {
        $match: { ...matchQuery },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ])
      .then((response) => {
        res.status(200).json(response);
      })
      .catch(next);
  }

  static getCategoryLaporan(req, res, next) {
    let { nama, cabang, perusahaan } = req.decoded;
    KategoryLaporan.find({})
      .then((response) => {
        res.status(200).json(response);
      })
      .catch(next);
  }

  static daftarCategoryLaporan(req, res, next) {
    let { nama: namaKat, punyaUraian } = req.body;
    KategoryLaporan.create({ nama: namaKat, punyaUraian })
      .then((response) => {
        res.status(200).json({ message: 'Kategori berhasil ditambahkan' });
      })
      .catch(next);
  }

  static lakukanLaporan(req, res, next) {
    let { nama, cabang, perusahaan } = req.decoded;
    let {
      kategory,
      foto,
      problem,
      tindakLanjut,
      lembagaTerkait,
      gedung,
      area,
      latitude,
      longitude,
    } = req.body;
    let valid = false;

    JamLaporan.find({})
      .then((respon) => {
        let tanggalDilaporkan = new Date();
        let mulai = new Date();
        let selesai = new Date();
        for (let i = 0; i < respon.length; i++) {
          mulai.setHours(respon[i].jam - respon[i].durasi);
          mulai.setMinutes(0);
          mulai.setSeconds(0);
          selesai.setHours(respon[i].jam);
          selesai.setMinutes(0);
          selesai.setSeconds(0);

          if (tanggalDilaporkan > mulai && tanggalDilaporkan < selesai) {
            valid = true;

            break;
          }
        }
        return Laporan.create({
          valid,
          cabang,
          perusahaan,
          namaPelapor: nama,
          kategory,
          status: kategory === 'Baik' ? true : false,
          gedung,
          fotoSebelum: foto,
          problem,
          tindakLanjut,
          lembagaTerkait,
          area,
          latitude,
          longitude,
        });
      })
      .then((response) => {
        res.status(200).json({
          message: `Terimakasih laporan anda berhasil kami tambahkan! status: ${
            valid ? 'Tepat waktu' : 'Melewati batas waktu'
          }`,
        });
      })
      .catch(next);
  }
  static laporanSelesai(req, res, next) {
    let { nama, cabang, perusahaan } = req.decoded;
    let { idLaporan, foto } = req.body;
    Laporan.findByIdAndUpdate(idLaporan, {
      fotoSesudah: foto,
      status: true,
      tanggalSelesai: new Date(),
      pelaporSelesai: nama,
    })
      .then((response) => {
        if (response) {
          res.status(200).json({
            message:
              'Terimakasih laporan selesai anda berhasil kami tambahkan!',
          });
        } else {
          throw {
            status: 400,
            message: 'Terjadi masalah silahkan ulangi lagi',
          };
        }
      })
      .catch(next);
  }
  ////////////////////////////////////////////////////////////////////////////////////////////////
  static getKpiMonitoring1(req, res, next) {
    let { nama, cabang, perusahaan } = req.decoded;
    let { tglmulai, tglselesai } = req.query;

    let matchQuery = { cabang, perusahaan, kategory: { $ne: 'Baik' } };
    if (tglmulai) {
      let tmp = new Date(tglmulai);
      tmp.setHours(0, 0, 0, 0);
      matchQuery = {
        createdAt: {
          $gt: tmp,
        },
        ...matchQuery,
      };
    }
    if (tglselesai) {
      let tmp = new Date(tglselesai);
      tmp.setHours(24, 0, 0, 0);
      matchQuery = {
        ...matchQuery,
        createdAt: matchQuery.createdAt
          ? {
              $gt: matchQuery.createdAt.$gt,
              $lt: tmp,
            }
          : {
              $lt: tmp,
            },
      };
    }

    Laporan.aggregate([
      {
        $match: { ...matchQuery },
      },
      {
        $group: {
          _id: '$gedung',
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ])
      .then((response) => {
        res.status(200).json(response);
      })
      .catch(next);
  }

  static getKpiMonitoring2(req, res, next) {
    let { nama, cabang, perusahaan } = req.decoded;
    let { tglmulai, tglselesai } = req.query;

    if (tglmulai) {
      tglmulai = new Date(tglmulai);
    } else {
      tglmulai = new Date();
      tglmulai.setDate(1);
    }
    tglmulai.setHours(0, 0, 0, 0);
    if (tglselesai) {
      tglselesai = new Date(tglselesai);
    } else {
      tglselesai = new Date();
    }
    tglselesai.setHours(24, 0, 0, 0);
    const diffTime = Math.abs(tglselesai - tglmulai);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let facets = {};

    for (let i = 0; i < diffDays; i++) {
      let tmpselesai = new Date(tglmulai);
      tmpselesai.setHours(24, 0, 0, 0);
      facets[moment(tglmulai).format('DD-MMM-YY')] = [
        {
          $match: {
            cabang,
            perusahaan,
            createdAt: {
              $gt: new Date(tglmulai),
              $lt: tmpselesai,
            },
          },
        },
        {
          $group: {
            _id: '$namaPelapor',
            count: { $sum: 1 },
          },
        },
      ];
      tglmulai.setDate(tglmulai.getDate() + 1);
    }
    Laporan.aggregate([
      {
        $facet: facets,
      },
    ])
      .then((response) => {
        let tmp = [];
        let keys = Object.keys(response[0]);
        let data = {};
        keys.map((val, index) => {
          response[0][keys[index]].map((val) => {
            if (!data[val._id]) {
              data[val._id] = [];
            }
            data[val._id].push({ count: val.count, tgl: keys[index] });
          });
        });
        Object.keys(data).map((val, index) => {
          if (!tmp[index]) {
            tmp[index] = {};
          }
          tmp[index].name = val;
          tmp[index].data = [];
          keys.map((val2, index2) => {
            tmp[index].data.push(0);
            data[val].map((val3, index3) => {
              if (val2 === val3.tgl && tmp[index].name === val) {
                tmp[index].data[index2] = val3.count;
              }
            });
          });
        });

        res.status(200).json({ categories: keys, series: tmp });
      })
      .catch(next);
  }

  static getVisitHariIni(req, res, next) {
    let mulai = new Date();
    let selesai = new Date();

    mulai.setHours(0, 0, 0, 0);
    selesai.setHours(24, 0, 0, 0);

    Laporan.count({ createdAt: { $gt: mulai, $lt: selesai } })
      .then((response) => {
        res.status(200).json(response);
      })
      .catch(next);
  }

  static getVisitProblem(req, res, next) {
    Laporan.count({ status: false })
      .then((response) => {
        res.status(200).json(response);
      })
      .catch(next);
  }
}

module.exports = Controller;
