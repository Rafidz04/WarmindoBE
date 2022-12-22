const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    kategory: {
      type: String,
      required: [true, 'Nama kategori harus di isi!'],
    },
  },
  {
    versionKey: false,
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
);

const schemaVar = mongoose.model('KategoryProposal', schema);
module.exports = schemaVar;
