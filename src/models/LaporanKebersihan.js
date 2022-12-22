const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    dilaporkanOleh: {
      type: String,
    },
    inTime: {
      type: Boolean,
    },
    latitude: {
      type: String,
    },
    longitude: {
      type: String,
    },
    keterangan: {
      type: String,
    },
    ruangan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ruangan",
    },
    gedung: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gedung",
    },
    jamShift: {
      type: Number,
    },
    tanggalDibuat: {
      type: Date,
    },
    tanggalKunjungan: {
      type: Date,
    },
    status: {
      type: String,
      default: "Belum Dikunjungi",
    },
  },
  {
    versionKey: false,
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

const schemaVar = mongoose.model("LaporanKebersihan", schema);
module.exports = schemaVar;
