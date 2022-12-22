const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    nama: {
      type: String,
      required: [true, 'Nama kategory harus di isi!'],
    },
  },
  {
    versionKey: false,
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
);

const schemaVar = mongoose.model('CSKategory', schema);
module.exports = schemaVar;
