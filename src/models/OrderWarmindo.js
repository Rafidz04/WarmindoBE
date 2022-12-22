const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    idStock: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StockWarmindo',
    },
    namaPelanggan: {
      type: String,
      required: [true, 'Nama Pelanggan harus di isi!'],
    },
    kuantitas: {
      type: Number,
      required: [true, "Harga harus di isi!"],
    },
    totalKuantitas: {
      type: Number,
      required: [true, "Total Harga harus di isi!"],
    },
  },
  {
    versionKey: false,
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
);

const schemaVar = mongoose.model('OrderWarmindo', schema);
module.exports = schemaVar;