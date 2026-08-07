const mongoose = require('mongoose');

const billItemSchema = new mongoose.Schema({
  itemDescription: {
    type: String,
    required: true
  },
  chargedAmount: {
    type: Number,
    required: true
  },
  benchmarkAmount: {
    type: Number,
    required: true
  },
  isOverpriced: {
    type: Boolean,
    default: false
  },
  overchargePercentage: {
    type: Number,
    default: 0
  },
  category: {
    type: String,
    default: 'General Charges'
  },
  recommendation: {
    type: String
  }
});

const billAnalysisSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false // Allow anonymous bill checks or authenticated user checks
    },
    originalFilename: {
      type: String,
      required: true
    },
    fileUrl: {
      type: String,
      required: true
    },
    totalClaimedAmount: {
      type: Number,
      required: true
    },
    aiEstimatedFairAmount: {
      type: Number,
      required: true
    },
    potentialSavings: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'completed'
    },
    summary: {
      type: String
    },
    hospitalDetected: {
      type: String,
      default: 'Detected Medical Provider'
    },
    itemBreakdown: [billItemSchema],
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('BillAnalysis', billAnalysisSchema);
