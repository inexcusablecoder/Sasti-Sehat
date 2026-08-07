const Treatment = require('../models/Treatment');

/**
 * AI Service for medical bill processing, OCR parsing simulation, 
 * benchmark comparison, and anomaly detection.
 */
class AIService {
  /**
   * Process uploaded bill file and extract line-item pricing breakdown
   */
  static async analyzeMedicalBill(file, userId = null) {
    const filename = file ? file.originalname : 'Uploaded_Bill.pdf';

    // Fetch standard procedures from DB for benchmark matching
    let treatments = [];
    try {
      treatments = await Treatment.find();
    } catch (e) {
      treatments = [];
    }

    // Default procedure benchmarks if database is not yet populated
    const benchmarkMap = {
      'icu_stay': treatments.find(t => t.code === 'ICU-DAY')?.avgCostNational || 15000,
      'angioplasty': treatments.find(t => t.code === 'ANGIO-01')?.avgCostNational || 180000,
      'cataract': treatments.find(t => t.code === 'CAT-01')?.avgCostNational || 35000,
      'mri': treatments.find(t => t.code === 'MRI-BR')?.avgCostNational || 7500,
      'blood_test': treatments.find(t => t.code === 'CBC-01')?.avgCostNational || 800,
      'pharmacy_kit': 2500,
      'nursing_charges': 3000
    };

    // Simulated OCR parsed line items (realistic hospital billing entries)
    const rawItems = [
      {
        itemDescription: 'ICU Bed Charges (2 Days)',
        chargedAmount: 44000,
        benchmarkAmount: benchmarkMap.icu_stay * 2,
        category: 'Room & Nursing'
      },
      {
        itemDescription: 'Surgical Consumables & PPE Kit (Disposable)',
        chargedAmount: 18500,
        benchmarkAmount: benchmarkMap.pharmacy_kit * 2,
        category: 'Consumables'
      },
      {
        itemDescription: 'MRI Brain Contrast Scan',
        chargedAmount: 14000,
        benchmarkAmount: benchmarkMap.mri,
        category: 'Diagnostics & Radiology'
      },
      {
        itemDescription: 'Complete Blood Count (CBC) + Metabolic Panel',
        chargedAmount: 2800,
        benchmarkAmount: benchmarkMap.blood_test * 2,
        category: 'Pathology'
      },
      {
        itemDescription: 'Nursing & Resident Doctor Care Charges',
        chargedAmount: 9500,
        benchmarkAmount: benchmarkMap.nursing_charges * 2,
        category: 'Professional Fees'
      }
    ];

    let totalClaimedAmount = 0;
    let aiEstimatedFairAmount = 0;

    const itemBreakdown = rawItems.map(item => {
      totalClaimedAmount += item.chargedAmount;
      aiEstimatedFairAmount += item.benchmarkAmount;

      const overchargeAmount = item.chargedAmount - item.benchmarkAmount;
      const isOverpriced = overchargeAmount > item.benchmarkAmount * 0.2; // >20% markup
      const overchargePct = Math.max(0, Math.round(((item.chargedAmount - item.benchmarkAmount) / item.benchmarkAmount) * 100));

      let recommendation = 'Price matches national fair market benchmark.';
      if (isOverpriced) {
        if (item.category === 'Consumables') {
          recommendation = `Inflated consumable billing. Request itemized receipts under NPPA guidelines (Potential saving: ₹${overchargeAmount.toLocaleString('en-IN')}).`;
        } else if (item.category === 'Diagnostics & Radiology') {
          recommendation = `Diagnostics charged ${overchargePct}% above standard city rates. Ask hospital management to match NABH standard rates.`;
        } else {
          recommendation = `Overcharged by approximately ${overchargePct}%. You have grounds to dispute this charge before final settlement.`;
        }
      }

      return {
        itemDescription: item.itemDescription,
        chargedAmount: item.chargedAmount,
        benchmarkAmount: item.benchmarkAmount,
        isOverpriced,
        overchargePercentage: overchargePct,
        category: item.category,
        recommendation
      };
    });

    const potentialSavings = Math.max(0, totalClaimedAmount - aiEstimatedFairAmount);

    const summary = `AI Analysis detected ${itemBreakdown.filter(i => i.isOverpriced).length} overpriced billing items out of ${itemBreakdown.length} total line items. Recommended fair market cost is ₹${aiEstimatedFairAmount.toLocaleString('en-IN')}, offering a potential savings of ₹${potentialSavings.toLocaleString('en-IN')}.`;

    return {
      originalFilename: filename,
      fileUrl: file ? `/uploads/${file.filename}` : '/uploads/sample-bill.pdf',
      totalClaimedAmount,
      aiEstimatedFairAmount,
      potentialSavings,
      status: 'completed',
      hospitalDetected: 'Metro Specialty Healthcare Center',
      summary,
      itemBreakdown
    };
  }

  /**
   * Out-of-pocket medical expense estimator model
   */
  static estimateOutofPocketExpense({ treatmentCode, city, insuranceCoveragePct = 0, copayAmount = 0 }) {
    // Standard baseline multiplier by tier
    const cityTierMultiplier = {
      mumbai: 1.25,
      delhi: 1.25,
      bangalore: 1.2,
      pune: 1.1,
      hyderabad: 1.1,
      chennai: 1.1,
      other: 1.0
    };

    const multiplier = cityTierMultiplier[city?.toLowerCase()] || 1.0;
    
    // Standard procedure baselines in INR
    const procedureBaselines = {
      'ANGIO-01': 180000,
      'CAT-01': 35000,
      'KNEE-01': 220000,
      'MRI-BR': 7500,
      'APP-01': 65000,
      'GALL-01': 75000
    };

    const baseCost = procedureBaselines[treatmentCode?.toUpperCase()] || 85000;
    const estimatedHospitalCost = Math.round(baseCost * multiplier);

    const coveredByInsurance = Math.round(estimatedHospitalCost * (insuranceCoveragePct / 100));
    const netEstimatedOutofPocket = Math.max(0, estimatedHospitalCost - coveredByInsurance + Number(copayAmount));

    return {
      procedureCode: treatmentCode,
      targetCity: city || 'Mumbai',
      estimatedHospitalCost,
      insuranceCoveragePct,
      coveredByInsurance,
      copayAmount,
      netEstimatedOutofPocket,
      breakdown: {
        surgeonAndOTFees: Math.round(estimatedHospitalCost * 0.45),
        roomAndBedCharges: Math.round(estimatedHospitalCost * 0.25),
        medicinesAndConsumables: Math.round(estimatedHospitalCost * 0.18),
        diagnosticsAndLabs: Math.round(estimatedHospitalCost * 0.12)
      },
      fairPriceAdvice: `Estimated total package in ${city || 'Mumbai'} ranges between ₹${Math.round(estimatedHospitalCost * 0.9).toLocaleString('en-IN')} and ₹${Math.round(estimatedHospitalCost * 1.15).toLocaleString('en-IN')}. Always request an all-inclusive package quote before admission.`
    };
  }
}

module.exports = AIService;
