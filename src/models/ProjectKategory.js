const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    jenis: {
      type: String,
      required: [true, 'Jenis Project harus di isi!'],
    },
  },
  {
    versionKey: false,
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
);

const schemaVar = mongoose.model('ProjectKategory', schema);
module.exports = schemaVar;
