const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    idOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OrderWarmin',
    },
    idStock: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StockWarmindo',
    },
    kategori:{
type:String,
require:[true,"Kategori wajib diisi"]
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

const schemaVar = mongoose.model('ListOrderWarmindo', schema);
module.exports = schemaVar;