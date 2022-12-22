const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    namaKaryawan: {
      type: String,
      required: [true, "Nama harus di isi!"],
    },
    jabatan: {
      type: String,
      required: [true, "Jabatan harus di isi!"],
    },
    diajukanOleh: {
      type: String,
      required: [true, "Nama harus di isi!"],
    },
    diresponOleh: {
      type: String,
    },
    jenisKejadian: {
      type: String,
      required: [true, "Jenis Pelanggaran harus di isi!"],
    },
    deskripsi: {
      type: String,
      required: [true, "Deskripsi pembinaan harus di isi!"],
    },
    status: {
      type: String,
      enum: ["Penanganan", "Done"],
      default: "Penanganan",
    },
    solvedDate: {
      type: Date,
    },
    solvedInTime: {
      type: Boolean,
    },
    startDate: {
      type: Date,
      required: [true, "Tanggal kejadian harus di isi!"],
    },
    deadlineDate: {
      type: Date,
      required: [true, "Tanggal target selesai pembinaan harus di isi!"],
    },
    dokumentasiAwalArr: [String],
    dokumentasiAkhirArr: [String],
    keterangan: {
      type: String,
    },
  },
  {
    versionKey: false,
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

const schemaVar = mongoose.model("Safety", schema);
module.exports = schemaVar;
