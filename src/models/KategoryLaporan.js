const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    nama: {
      type: String,
      required: [true, 'Nama Kategori harus di isi!'],
    },
    punyaUraian: {
      type: Boolean,
      default: true,
    },
  },
  {
    versionKey: false,
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
);

const schemaVar = mongoose.model('KategoryLaporan', schema);
module.exports = schemaVar;
