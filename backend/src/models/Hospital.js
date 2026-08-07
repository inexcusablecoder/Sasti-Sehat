const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a hospital name'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'Please add a city'],
      trim: true,
      index: true
    },
    address: {
      type: String,
      required: [true, 'Please add hospital address'],
      trim: true
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 4.0
    },
    isVerified: {
      type: Boolean,
      default: true
    },
    contactPhone: {
      type: String,
      trim: true
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [72.8777, 19.076] // Default Mumbai coordinates
      }
    },
    accreditation: {
      type: String,
      default: 'NABH Accredited'
    },
    bedCapacity: {
      type: Number,
      default: 200
    }
  },
  {
    timestamps: true
  }
);

hospitalSchema.index({ name: 'text', city: 'text', address: 'text' });
hospitalSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Hospital', hospitalSchema);
