const mongoose = require("mongoose");

const stokSchema = new mongoose.Schema(
  {
    kodeBarang: {
      type: String,
    },
    namaBarang: {
      type: String,
      required: [true, "Nama barang harus di isi!"],
    },
    harga: {
      type: Number,
      required: [true, "Harga harus di isi!"],
    },
    minimStock: {
      type: Number,
    },
    totalStock: {
      type: Number,
      required: [true, "Total stock harus di isi!"],
    },
    kategori: {
      type: String,
      required: [true, "Kategori barang harus di isi!"],
    },
    fotoProduk: {
      type: String,
    },
    status: {
      type: String,
      default: "aktif",
    },
  },
  {
    versionKey: false,
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

const stokWarmindo = mongoose.model("StokWarmindo", stokSchema);
module.exports = stokWarmindo;
