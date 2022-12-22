const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    nama: {
      type: String,
      required: [true, "Nama user harus di isi!"],
    },
    karyawanId: {
      type: String,
      required: [true, "ID user harus di isi!"],
    },
    deskripsi: {
      type: String,
    },
    score: {
      type: Number,
      default: 0,
    },
    bobotTotal: {
      type: Number,
      default: 0,
    },
    periode: {
      type: String,
    },
    pertanyaanArr: [
      {
        pertanyaan: String,
        jenis: String,
        score: Number,
      },
    ],
  },
  {
    versionKey: false,
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

const schemaVar = mongoose.model("Kuisioner", schema);
module.exports = schemaVar;
