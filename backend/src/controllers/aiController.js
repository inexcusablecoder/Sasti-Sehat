const AIService = require('../services/aiService');

// @desc    Estimate out-of-pocket medical procedure expense
// @route   POST /api/v1/ai/estimate-cost
// @access  Public
const estimateExpense = async (req, res) => {
  try {
    const { treatmentCode, city, insuranceCoveragePct, copayAmount } = req.body;

    if (!treatmentCode) {
      return res.status(400).json({ success: false, message: 'Please provide a treatment code (e.g. ANGIO-01, CAT-01, KNEE-01)' });
    }

    const estimation = AIService.estimateOutofPocketExpense({
      treatmentCode,
      city,
      insuranceCoveragePct,
      copayAmount
    });

    res.json({
      success: true,
      data: estimation
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { estimateExpense };
