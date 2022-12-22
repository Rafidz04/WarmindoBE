const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    perusahaan: {
      type: String,
      required: [true, 'Nama Perusahaan harus di isi!'],
    },
    cabang: {
      type: String,
      required: [true, 'Nama Cabang harus di isi!'],
    },
    gedung: {
      type: String,
      required: [true, 'Nama Gedung harus di isi!'],
    },
  },
  {
    versionKey: false,
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
);

const schemaVar = mongoose.model('Gedung', schema);
module.exports = schemaVar;
