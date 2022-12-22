const mongoose = require("mongoose");

const stokSchema = new mongoose.Schema(
  {
    namaBarang:{
        type: String,
        required: [true, "Nama barang harus di isi!"],
    },
    harga: {
      type: Number,
      required: [true, "Harga harus di isi!"],
    },
    kategori: {
      type: String,
      required: [true, "Kategori barang harus di isi!"],
    },
  },
  {
    versionKey: false,
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);


const stokWarmindo = mongoose.model("StokWarmindo", stokSchema);
module.exports = stokWarmindo;