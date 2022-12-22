const SurveyQuestion = require("../models/SurveyQuestion");
const Kuisioner = require("../models/Kuisioner");
const XLSX = require("xlsx");
const path = require("path");
const Busboy = require("busboy");
class Controller {
  static daftarPertanyaan(req, res, next) {
    let pertanyaanArr = JSON.parse(req.body.pertanyaanArr).map((val, index) => {
      return {
        pertanyaan: val.pertanyaan,
        jenis: val.jenis,
        urutan: index + 1,
      };
    });

    SurveyQuestion.deleteMany({})
      .then((response) => {
        return SurveyQuestion.create(pertanyaanArr);
      })
      .then((response) => {
        res
          .status(200)
          .json({ message: "Pertanyaan survey berhasil diperbarui" });
      })
      .catch(next);
  }
  static hapusPertanyaan(req, res, next) {
    let { pertanyaanId } = req.body;
    SurveyQuestion.deleteOne({ _id: pertanyaanId })
      .then((response) => {
        res.status(200).json({ message: "Pertanyaan survey berhasil dihapus" });
      })
      .catch(next);
  }
  static getSurveyQuestion(req, res, next) {
    SurveyQuestion.find({})
      .sort({ urutan: 1 })
      .then((response) => {
        res.status(200).json(response);
      })
      .catch(next);
  }
  static lakukanSurvey(req, res, next) {
    let pertanyaanArr = JSON.parse(req.body.pertanyaanArr);
    let nama = req.body.nama;
    let periode = "Periode 1";
    let karyawanId = req.body.karyawanId;
    let deskripsi = req.body.deskripsi;
    let score = 0;
    let bobotTotal = 0;
    pertanyaanArr.forEach((val) => {
      if (val.score != "0") {
        score += Number(val.score);
        bobotTotal += 100;
      }
    });

    Kuisioner.create({
      score,
      bobotTotal,
      pertanyaanArr,
      nama,
      karyawanId,
      periode,
      deskripsi,
    })
      .then((response) => {
        res
          .status(200)
          .json({ message: "Terimakasih telah mengisi survey kepuasan!" });
      })
      .catch(next);
  }
  static getAllKuisioner(req, res, next) {
    Kuisioner.find({})
      .sort({ createdAt: -1 })
      .then((response) => {
        let nilaiSoal = [
          {
            nama: "A",
            pertanyaan:
              "Bagaimanakah menurut anda tentang kebersihan di area kerja anda?",
            jumlah: 0,
            total: 0,
          },
          {
            nama: "B",
            pertanyaan: "Bagaimanakah kerapian taman menurut anda?",
            jumlah: 0,
            total: 0,
          },
          {
            nama: "C",
            pertanyaan:
              "Bagaimanakah kesesuaian peralatan kebersihan yang digunakan oleh tim kebersihan di area kerja anda?",
            jumlah: 0,
            total: 0,
          },
          {
            nama: "D",
            pertanyaan:
              "Bagaimanakah kondisi perangkap pest & rodent control di area kerja anda?",
            jumlah: 0,
            total: 0,
          },
          {
            nama: "E",
            pertanyaan:
              "Bagaimanakah kerapian seragam tim kebersihan di area kerja anda?",
            jumlah: 0,
            total: 0,
          },
          {
            nama: "F",
            pertanyaan:
              "Bagaimanakah kerapian tim pelayan kantin menurut anda?",
            jumlah: 0,
            total: 0,
          },
          {
            nama: "G",
            pertanyaan:
              "Bagaimanakah kemampuan petugas kebersihan dalam menyelesaikan tugas dan tanggung jawab kebersihan di area kerja anda?",
            jumlah: 0,
            total: 0,
          },
          {
            nama: "H",
            pertanyaan:
              "Bagaimanakah leader tim kebersihan mengkoordinir perencanaan dan pemantauan tim kebersihan di area kerja anda?",
            jumlah: 0,
            total: 0,
          },
          {
            nama: "I",
            pertanyaan:
              "Bagaimanakah keramahan leader tim kebersihan saat berkomunikasi/berkoordinasi dengan anda?",
            jumlah: 0,
            total: 0,
          },
          {
            nama: "J",
            pertanyaan:
              "Bagaimanakah efektifitas perangkap yang digunakan oleh tim pest & rodent control di area kerja anda?",
            jumlah: 0,
            total: 0,
          },
          {
            nama: "K",
            pertanyaan:
              "Bagaimanakah kualitas rasa menu makanan yang disajikan menurut anda?",
            jumlah: 0,
            total: 0,
          },
          {
            nama: "L",
            pertanyaan:
              "Bagaimanakah keramahan Petugas kantin dalam memberikan pelayanan",
            jumlah: 0,
            total: 0,
          },
          {
            nama: "M",
            pertanyaan:
              "Bagaimanakah kecepatan respons leader kebersihan saat menerima keluhan dari anda?",
            jumlah: 0,
            total: 0,
          },
          {
            nama: "N",
            pertanyaan:
              "Bagaimanakah kecepatan dan ketepatan tim pest & rodent control dalam menindak lanjuti masukan/temuan?",
            jumlah: 0,
            total: 0,
          },
          {
            nama: "O",
            pertanyaan:
              "Bagaimanakah kecepatan dan ketepatan tim kebersihan dalam menindak lanjuti masukan/temuan?",
            jumlah: 0,
            total: 0,
          },
          {
            nama: "P",
            pertanyaan:
              "Bagaimanakah pengetahuan dan kesungguhan tim kebersihan saat bekerja sehingga meyakinkan anda tentang mutu kebersihan di area kerja anda?",
            jumlah: 0,
            total: 0,
          },
          {
            nama: "Q",
            pertanyaan:
              "Bagaimanakah komunikasi dan koordinasi leader kebersihan sehingga meyakinkan anda tentang kualitas kebersihan yang dihasilkan?",
            jumlah: 0,
            total: 0,
          },
          {
            nama: "R",
            pertanyaan:
              "Bagaimanakah kompetensi tim pest & rodent control melakukan pekerjaan sehingga meyakinkan anda bahwa lingkungan kerja anda terbebas dari hama & hewan pengerat lain?",
            jumlah: 0,
            total: 0,
          },
          {
            nama: "S",
            pertanyaan:
              "Bagaimanakah menu makanan yang disajikan di kantin sehingga meyakinkan anda bahwa menu tersebut variatif dan sehat dikonsumsi?",
            jumlah: 0,
            total: 0,
          },
          {
            nama: "T",
            pertanyaan:
              "Bagaimanakah kesesuaian menu yang disajikan, selalu terdapat menu utama, appetizer dan dessert?",
            jumlah: 0,
            total: 0,
          },
          {
            nama: "U",
            pertanyaan:
              "Bagaimanakah sikap dan perhatian leader kebersihan untuk berkomunikasi dan memberi masukan tentang kebersihan di area kerja anda?",
            jumlah: 0,
            total: 0,
          },
          {
            nama: "V",
            pertanyaan: "Bagaimanakah inisiatif tim kebersihan saat bekerja?",
            jumlah: 0,
            total: 0,
          },
          {
            nama: "W",
            pertanyaan:
              "Bagaimanakah metode penyampaian keluhan yang kami buat untuk menerima masukan, sehingga memudahkan anda menyampaikan keluhan dan menerima umpan balik yang efektif?",
            jumlah: 0,
            total: 0,
          },
        ];
        if (response) {
          response.map((val) => {
            val.pertanyaanArr.map((value) => {
              if (value.jenis === "A") {
                nilaiSoal[0].jumlah++;
                nilaiSoal[0].total += value.score;
              } else if (value.jenis === "B") {
                nilaiSoal[1].jumlah++;
                nilaiSoal[1].total += value.score;
              } else if (value.jenis === "C") {
                nilaiSoal[2].jumlah++;
                nilaiSoal[2].total += value.score;
              } else if (value.jenis === "D") {
                nilaiSoal[3].jumlah++;
                nilaiSoal[3].total += value.score;
              } else if (value.jenis === "E") {
                nilaiSoal[4].jumlah++;
                nilaiSoal[4].total += value.score;
              } else if (value.jenis === "F") {
                nilaiSoal[5].jumlah++;
                nilaiSoal[5].total += value.score;
              } else if (value.jenis === "G") {
                nilaiSoal[6].jumlah++;
                nilaiSoal[6].total += value.score;
              } else if (value.jenis === "H") {
                nilaiSoal[7].jumlah++;
                nilaiSoal[7].total += value.score;
              } else if (value.jenis === "I") {
                nilaiSoal[8].jumlah++;
                nilaiSoal[8].total += value.score;
              } else if (value.jenis === "J") {
                nilaiSoal[9].jumlah++;
                nilaiSoal[9].total += value.score;
              } else if (value.jenis === "K") {
                nilaiSoal[10].jumlah++;
                nilaiSoal[10].total += value.score;
              } else if (value.jenis === "L") {
                nilaiSoal[11].jumlah++;
                nilaiSoal[11].total += value.score;
              } else if (value.jenis === "M") {
                nilaiSoal[12].jumlah++;
                nilaiSoal[12].total += value.score;
              } else if (value.jenis === "N") {
                nilaiSoal[13].jumlah++;
                nilaiSoal[13].total += value.score;
              } else if (value.jenis === "O") {
                nilaiSoal[14].jumlah++;
                nilaiSoal[14].total += value.score;
              } else if (value.jenis === "P") {
                nilaiSoal[15].jumlah++;
                nilaiSoal[15].total += value.score;
              } else if (value.jenis === "Q") {
                nilaiSoal[16].jumlah++;
                nilaiSoal[16].total += value.score;
              } else if (value.jenis === "R") {
                nilaiSoal[17].jumlah++;
                nilaiSoal[17].total += value.score;
              } else if (value.jenis === "S") {
                nilaiSoal[18].jumlah++;
                nilaiSoal[18].total += value.score;
              } else if (value.jenis === "T") {
                nilaiSoal[19].jumlah++;
                nilaiSoal[19].total += value.score;
              } else if (value.jenis === "U") {
                nilaiSoal[20].jumlah++;
                nilaiSoal[20].total += value.score;
              } else if (value.jenis === "V") {
                nilaiSoal[21].jumlah++;
                nilaiSoal[21].total += value.score;
              } else if (value.jenis === "W") {
                nilaiSoal[22].jumlah++;
                nilaiSoal[22].total += value.score;
              }
            });
          });
        }
        res.status(200).json({ dataNilai: nilaiSoal, data: response });
      })
      .catch(next);
  }
  static grafikKuisioner(req, res, next) {
    let { tahun } = req.query;
    let tglMulai = new Date();
    let tglSelesai = new Date();
    tglMulai.setFullYear(tahun);
    tglSelesai.setFullYear(tahun);
    tglMulai.setDate(1);
    tglMulai.setHours(0, 0, 0, 0);
    tglSelesai.setHours(24, 0, 0, 0);
    tglMulai.setMonth(0);
    Kuisioner.aggregate([
      {
        $match: {
          createdAt: { $gt: tglMulai, $lt: tglSelesai },
        },
      },
      // {
      //   $group: {
      //     _id: "$periode",
      //   },
      // },

      {
        $group: {
          _id: "$periode",
          "Total Score": { $sum: "$score" },
          "Max Likert (Y)": { $sum: "$bobotTotal" },
          Participant: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      //   {
      //     $project: {
      //       totalScore: { $sum: '$score' },
      //       totalBobot: { $sum: '$bobotTotal' },
      //     },
      //   },
    ])
      .then((response) => {
        // res.status(200).json(response);
        let tmp = [];

        response.map((val) => {
          return tmp.push({
            ...val,
            name: val._id,
          });
        });
        res.status(200).json({
          data: [tmp[tmp.length - 1]],
          pencapaian:
            response.length > 0
              ? Math.round(
                  (response[response.length - 1]["Total Score"] /
                    response[response.length - 1]["Max Likert (Y)"]) *
                    100
                )
              : 0,
          target: 90,
        });
      })
      .catch(next);
  }

  static cekIdUserSurvey(req, res, next) {
    Kuisioner.find({ karyawanId: req.body.karyawanId })
      .sort({ createdAt: -1 })
      .then((response) => {
        res.status(200).json(response);
      })
      .catch(next);
  }

  static downloadExcelHasilSurvey(req, res, next) {
    let periode = req.query.periode;
    console.log("periode", periode);
    Kuisioner.find({ periode: periode })
      .then((response) => {
        let data = [];
        let scoreA = 0;
        let scoreB = 0;
        let scoreC = 0;
        let scoreD = 0;
        let scoreE = 0;
        let scoreF = 0;
        let scoreG = 0;
        let scoreH = 0;
        let scoreI = 0;
        let scoreJ = 0;
        let scoreK = 0;
        let scoreL = 0;
        let scoreM = 0;
        let scoreN = 0;
        let scoreO = 0;
        let scoreP = 0;
        let scoreQ = 0;
        let scoreR = 0;
        let scoreS = 0;
        let scoreT = 0;
        let scoreU = 0;
        let scoreV = 0;
        let scoreW = 0;

        response.map((val, index) => {
          val.pertanyaanArr.forEach((value, index) => {
            if (value.jenis === "A") {
              return (scoreA = value.score);
            }
            if (value.jenis === "B") {
              return (scoreB = value.score);
            }
            if (value.jenis === "C") {
              return (scoreC = value.score);
            }
            if (value.jenis === "D") {
              return (scoreD = value.score);
            }
            if (value.jenis === "E") {
              return (scoreE = value.score);
            }
            if (value.jenis === "F") {
              return (scoreF = value.score);
            }
            if (value.jenis === "G") {
              return (scoreG = value.score);
            }
            if (value.jenis === "H") {
              return (scoreH = value.score);
            }
            if (value.jenis === "I") {
              return (scoreI = value.score);
            }
            if (value.jenis === "J") {
              return (scoreJ = value.score);
            }
            if (value.jenis === "K") {
              return (scoreK = value.score);
            }
            if (value.jenis === "L") {
              return (scoreL = value.score);
            }
            if (value.jenis === "M") {
              return (scoreM = value.score);
            }
            if (value.jenis === "N") {
              return (scoreN = value.score);
            }
            if (value.jenis === "O") {
              return (scoreO = value.score);
            }
            if (value.jenis === "P") {
              return (scoreP = value.score);
            }
            if (value.jenis === "Q") {
              return (scoreQ = value.score);
            }
            if (value.jenis === "R") {
              return (scoreR = value.score);
            }
            if (value.jenis === "S") {
              return (scoreS = value.score);
            }
            if (value.jenis === "T") {
              return (scoreT = value.score);
            }
            if (value.jenis === "U") {
              return (scoreU = value.score);
            }
            if (value.jenis === "V") {
              return (scoreV = value.score);
            }
            if (value.jenis === "W") {
              return (scoreW = value.score);
            }
          });
          data.push({
            nama: val.nama,
            karyawanId: val.karyawanId,
            masukkan: val.deskripsi,
            A: scoreA,
            B: scoreB,
            C: scoreC,
            D: scoreD,
            E: scoreE,
            F: scoreF,
            G: scoreG,
            H: scoreH,
            I: scoreI,
            J: scoreJ,
            K: scoreK,
            L: scoreL,
            M: scoreM,
            N: scoreN,
            O: scoreO,
            P: scoreP,
            Q: scoreQ,
            R: scoreR,
            R: scoreR,
            S: scoreS,
            T: scoreT,
            U: scoreU,
            V: scoreV,
            W: scoreW,

            // B: val.pertanyaanArr.forEach((element) => {
            //   if (element.jenis === "B") {
            //     console.log(element.score);
            //     return element.score;
            //   }
            // }),
          });

          // console.log(index, data[index]);
        });

        // res.status(200).json(data);
        let resData = data.map((val) => {
          return {
            Nama: val.nama,
            "Karyawan ID": val.karyawanId,
            Masukkan: val.masukkan,
            "Score A": val.A,
            "Score B": val.B,
            "Score C": val.C,
            "Score D": val.D,
            "Score E": val.E,
            "Score F": val.F,
            "Score G": val.G,
            "Score H": val.H,
            "Score I": val.I,
            "Score J": val.J,
            "Score K": val.K,
            "Score L": val.L,
            "Score M": val.M,
            "Score N": val.N,
            "Score O": val.O,
            "Score P": val.P,
            "Score Q": val.Q,
            "Score R": val.R,
            "Score S": val.S,
            "Score T": val.T,
            "Score U": val.U,
            "Score V": val.V,
            "Score W": val.W,
          };
        });

        const sheetOrder = XLSX.utils.json_to_sheet(resData, {
          header: [
            "Nama",
            "Karyawan ID",
            "Masukkan",
            "Score A",
            "Score B",
            "Score C",
            "Score D",
            "Score E",
            "Score F",
            "Score G",
            "Score H",
            "Score I",
            "Score J",
            "Score K",
            "Score L",
            "Score M",
            "Score N",
            "Score O",
            "Score P",
            "Score Q",
            "Score R",
            "Score S",
            "Score T",
            "Score U",
            "Score V",
            "Score W",
          ],
        });

        const sheetOrderCols = [
          { wpx: 200 }, //Nama
          { wpx: 200 }, //Karyawan ID
          { wpx: 200 },
          { wpx: 100 }, //A
          { wpx: 100 }, //B
          { wpx: 100 },
          { wpx: 100 },
          { wpx: 100 },
          { wpx: 100 },
          { wpx: 100 },
          { wpx: 100 },
          { wpx: 100 },
          { wpx: 100 },
          { wpx: 100 },
          { wpx: 100 },
          { wpx: 100 },
          { wpx: 100 },
          { wpx: 100 },
          { wpx: 100 },
          { wpx: 100 },
          { wpx: 100 },
          { wpx: 100 },
          { wpx: 100 },
          { wpx: 100 },
          { wpx: 100 },
          { wpx: 100 },
          { wpx: 100 },
        ];

        sheetOrder["!cols"] = sheetOrderCols;

        var wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, sheetOrder, `Kuisioner`);
        XLSX.writeFile(wb, "Kuisioner.xlsx");
        let pathFile = path.join(__dirname, `../../Kuisioner.xlsx`);
        res.sendFile(pathFile);
      })
      .catch(next);
  }
}

module.exports = Controller;
