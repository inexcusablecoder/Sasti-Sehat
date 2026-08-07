const mongoose = require('mongoose');
const Treatment = require('../models/Treatment');
const HospitalTreatment = require('../models/HospitalTreatment');

// Fallback in-memory treatment dataset when MongoDB service is offline
const fallbackTreatments = [
  {
    _id: '65c1234567890123456789a1',
    code: 'ANGIO-01',
    title: 'Coronary Angioplasty (with 1 Drug-Eluting Stent)',
    category: 'Cardiology',
    description: 'Minimally invasive procedure to open clogged heart arteries using a balloon and single drug-eluting stent.',
    avgCostNational: 180000,
    fairCostMin: 140000,
    fairCostMax: 220000
  },
  {
    _id: '65c1234567890123456789a2',
    code: 'CAT-01',
    title: 'Cataract Surgery with Monofocal IOL Lens',
    category: 'Ophthalmology',
    description: 'Phacoemulsification cataract removal with implantation of standard monofocal intraocular lens.',
    avgCostNational: 35000,
    fairCostMin: 25000,
    fairCostMax: 45000
  },
  {
    _id: '65c1234567890123456789a3',
    code: 'KNEE-01',
    title: 'Total Knee Replacement (Single Joint)',
    category: 'Orthopedics',
    description: 'Surgical replacement of damaged knee joint components with imported high-durability implant.',
    avgCostNational: 220000,
    fairCostMin: 180000,
    fairCostMax: 260000
  },
  {
    _id: '65c1234567890123456789a4',
    code: 'MRI-BR',
    title: 'MRI Scan Brain (with & without Contrast)',
    category: 'Diagnostics & Imaging',
    description: 'High-resolution 1.5T/3T MRI brain scan including contrast dye imaging and radiologist reporting.',
    avgCostNational: 7500,
    fairCostMin: 5500,
    fairCostMax: 9500
  },
  {
    _id: '65c1234567890123456789a5',
    code: 'APP-01',
    title: 'Laparoscopic Appendectomy',
    category: 'General Surgery',
    description: 'Keyhole laparoscopic removal of inflamed appendix including 2-day hospital stay and anesthesia.',
    avgCostNational: 65000,
    fairCostMin: 50000,
    fairCostMax: 80000
  }
];

// @desc    Get all treatments (search by title, code, category)
// @route   GET /api/v1/treatments
// @access  Public
const getTreatments = async (req, res) => {
  try {
    const { category, query } = req.query;

    if (mongoose.connection.readyState !== 1) {
      let filtered = [...fallbackTreatments];
      if (category) {
        filtered = filtered.filter(t => t.category.toLowerCase().includes(category.toLowerCase()));
      }
      if (query) {
        filtered = filtered.filter(t => 
          t.title.toLowerCase().includes(query.toLowerCase()) || 
          t.code.toLowerCase().includes(query.toLowerCase())
        );
      }
      return res.json({
        success: true,
        count: filtered.length,
        data: filtered,
        note: 'MongoDB service offline, returning benchmark dataset'
      });
    }

    const filter = {};
    if (category) filter.category = { $regex: category, $options: 'i' };
    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { code: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } }
      ];
    }

    const treatments = await Treatment.find(filter).sort({ title: 1 });
    res.json({
      success: true,
      count: treatments.length,
      data: treatments
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single treatment details and price benchmark comparison across hospitals
// @route   GET /api/v1/treatments/:id
// @access  Public
const getTreatmentById = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const treatment = fallbackTreatments.find(t => t._id === req.params.id || t.code === req.params.id) || fallbackTreatments[0];
      return res.json({
        success: true,
        data: {
          treatment,
          hospitalPrices: []
        },
        note: 'MongoDB service offline, returning benchmark data'
      });
    }

    const treatment = await Treatment.findById(req.params.id);
    if (!treatment) {
      return res.status(404).json({ success: false, message: 'Treatment procedure not found' });
    }

    const hospitalPrices = await HospitalTreatment.find({ treatment: req.params.id })
      .populate('hospital', 'name city address rating isVerified accreditation');

    res.json({
      success: true,
      data: {
        treatment,
        hospitalPrices
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new treatment procedure benchmark
// @route   POST /api/v1/treatments
// @access  Private/Admin
const createTreatment = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ success: false, message: 'Database writing unavailable: MongoDB service offline' });
    }
    const treatment = await Treatment.create(req.body);
    res.status(201).json({
      success: true,
      data: treatment
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getTreatments,
  getTreatmentById,
  createTreatment
};
