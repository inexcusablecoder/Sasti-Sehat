const mongoose = require('mongoose');

const treatmentSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Please add a medical procedure code'],
      unique: true,
      uppercase: true,
      trim: true
    },
    title: {
      type: String,
      required: [true, 'Please add a treatment title'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Please add a medical category'],
      trim: true,
      enum: [
        'Cardiology',
        'Orthopedics',
        'Ophthalmology',
        'Gastroenterology',
        'General Surgery',
        'Neurology',
        'Oncology',
        'Diagnostics & Imaging',
        'Pediatrics'
      ],
      default: 'General Surgery'
    },
    description: {
      type: String,
      trim: true
    },
    avgCostNational: {
      type: Number,
      required: [true, 'Please specify national average cost benchmark in INR']
    },
    fairCostMin: {
      type: Number,
      required: true
    },
    fairCostMax: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true
  }
);

treatmentSchema.index({ title: 'text', category: 'text', code: 'text', description: 'text' });

module.exports = mongoose.model('Treatment', treatmentSchema);
