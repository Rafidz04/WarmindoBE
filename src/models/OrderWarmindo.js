const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    namaKasir: {
      type: String,
    },
    namaPelanggan: {
      type: String,
      required: [true, "Nama Pelanggan harus di isi!"],
    },
  },
  {
    versionKey: false,
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

const schemaVar = mongoose.model("OrderWarmindo", schema);
module.exports = schemaVar;
