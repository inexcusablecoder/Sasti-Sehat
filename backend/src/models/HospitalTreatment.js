const mongoose = require('mongoose');

const hospitalTreatmentSchema = new mongoose.Schema(
  {
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: true
    },
    treatment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Treatment',
      required: true
    },
    costMin: {
      type: Number,
      required: [true, 'Minimum cost is required']
    },
    costMax: {
      type: Number,
      required: [true, 'Maximum cost is required']
    },
    costAvg: {
      type: Number,
      required: [true, 'Average cost is required']
    },
    notes: {
      type: String,
      default: 'Includes standard room stay, nursing, and basic consumable charges.'
    }
  },
  {
    timestamps: true
  }
);

hospitalTreatmentSchema.index({ hospital: 1, treatment: 1 }, { unique: true });

module.exports = mongoose.model('HospitalTreatment', hospitalTreatmentSchema);
