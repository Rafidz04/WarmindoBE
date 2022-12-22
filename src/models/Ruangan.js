const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    gedung: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gedung',
    },
    area: {
      type: String,
      required: [true, 'Nama Area harus di isi!'],
    },
    idShift: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shift',
    },
    koderuangan: {
      type: String,
    },
  },
  {
    versionKey: false,
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
);

const schemaVar = mongoose.model('Ruangan', schema);
module.exports = schemaVar;
