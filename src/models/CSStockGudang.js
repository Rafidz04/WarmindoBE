const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    kode: {
      type: String,
      required: [true, "Kode item harus di isi!"],
    },
    nama: {
      type: String,
      required: [true, "Nama item harus di isi!"],
    },
    satuan: {
      type: String,
      required: [true, "Satuan item harus di isi!"],
    },
    stock: {
      type: Number,
      required: [true, "Stock item harus di isi!"],
    },
    kategori: {
      type: String,
      required: [true, "Kategori item harus di isi!"],
    },
    brand: {
      type: String,
      required: [true, "Brand item harus di isi!"],
    },
    spek: {
      type: String,
      required: [true, "Speck item harus di isi!"],
    },
    status: {
      type: String,
      default: "Full",
      enum: ["Full", "Process"],
    },
    minStock: {
      type: Number,
    },
    idStock: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CSStock",
    },
  },
  {
    versionKey: false,
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

const schemaVar = mongoose.model("CSStockGudang", schema);
module.exports = schemaVar;
