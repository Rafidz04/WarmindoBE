const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    nopeg: {
      type: String,
    },
    nama: {
      type: String,
    },
    jabatan: {
      type: String,
    },
    tanggal: {
      type: Date,
    },
    checkIn: {
      type: String,
    },
    checkOut: {
      type: String,
    },
    keterangan: {
      type: String,
    },
  },
  {
    versionKey: false,
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

const schemaVar = mongoose.model("AbsenKaryawan", schema);
module.exports = schemaVar;
