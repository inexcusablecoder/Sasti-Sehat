const mongoose = require('mongoose');
const BillAnalysis = require('../models/BillAnalysis');
const AIService = require('../services/aiService');

// @desc    Upload bill for AI OCR & Anomaly Analysis
// @route   POST /api/v1/bills/upload
// @access  Public / Optional Auth
const uploadAndAnalyzeBill = async (req, res) => {
  try {
    const file = req.file;

    // Execute AI Service analysis engine
    const analysisResult = await AIService.analyzeMedicalBill(file, req.user ? req.user._id : null);

    let savedReport = analysisResult;

    if (mongoose.connection.readyState === 1) {
      savedReport = await BillAnalysis.create({
        user: req.user ? req.user._id : null,
        originalFilename: analysisResult.originalFilename,
        fileUrl: analysisResult.fileUrl,
        totalClaimedAmount: analysisResult.totalClaimedAmount,
        aiEstimatedFairAmount: analysisResult.aiEstimatedFairAmount,
        potentialSavings: analysisResult.potentialSavings,
        status: analysisResult.status,
        summary: analysisResult.summary,
        hospitalDetected: analysisResult.hospitalDetected,
        itemBreakdown: analysisResult.itemBreakdown
      });
    }

    res.status(201).json({
      success: true,
      message: 'Medical bill analyzed successfully',
      data: savedReport
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's past bill analyses
// @route   GET /api/v1/bills
// @access  Private
const getUserBills = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({
        success: true,
        count: 0,
        data: [],
        note: 'MongoDB service offline'
      });
    }
    const bills = await BillAnalysis.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: bills.length,
      data: bills
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single bill analysis report by ID
// @route   GET /api/v1/bills/:id
// @access  Public
const getBillById = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const mockBill = await AIService.analyzeMedicalBill(null);
      return res.json({
        success: true,
        data: mockBill
      });
    }
    const bill = await BillAnalysis.findById(req.params.id);
    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill analysis report not found' });
    }
    res.json({
      success: true,
      data: bill
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  uploadAndAnalyzeBill,
  getUserBills,
  getBillById
};
