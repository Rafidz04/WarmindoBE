const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    idStockGudang: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CSStockGudang",
    },
    idOrderGudang: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CSOrderGudang",
    },
    // hargaSatuan: {
    //   type: Number,
    //   required: [true, "Harga harus diisi"],
    // },
    Qty: {
      type: Number,
      required: [true, "Jumlah unit harus di isi!"],
    },
    diPesan: {
      type: Number,
      required: [true, "Jumlah dipesan harus di isi!"],
    },
    // totalHarga: {
    //   type: Number,
    //   required: [true, "Harga harus diisi"],
    // },
  },
  {
    versionKey: false,
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

const schemaVar = mongoose.model("CSOrderStockGudang", schema);
module.exports = schemaVar;
