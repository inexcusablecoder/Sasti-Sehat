const mongoose = require('mongoose');
const Hospital = require('../models/Hospital');
const HospitalTreatment = require('../models/HospitalTreatment');

const fallbackHospitals = [
  {
    _id: '65c9876543210987654321b1',
    name: 'Apollo Specialty Hospital',
    city: 'Mumbai',
    address: 'Plot No. 13, Off Thane Belapur Road, Navi Mumbai, Maharashtra 400706',
    rating: 4.8,
    isVerified: true,
    contactPhone: '+91 22 3350 3350',
    accreditation: 'JCI & NABH Accredited'
  },
  {
    _id: '65c9876543210987654321b2',
    name: 'Max Super Specialty Hospital',
    city: 'Delhi',
    address: '1, 2, Press Enclave Marg, Saket, New Delhi 110017',
    rating: 4.7,
    isVerified: true,
    contactPhone: '+91 11 2651 5050',
    accreditation: 'NABH Accredited'
  },
  {
    _id: '65c9876543210987654321b3',
    name: 'Manipal Hospital',
    city: 'Bangalore',
    address: '98, HAL Old Airport Rd, Kodihalli, Bengaluru, Karnataka 560017',
    rating: 4.6,
    isVerified: true,
    contactPhone: '+91 80 2502 4444',
    accreditation: 'NABH & NABL Accredited'
  },
  {
    _id: '65c9876543210987654321b4',
    name: 'Ruby Hall Clinic',
    city: 'Pune',
    address: '40, Sassoon Road, Sangamvadi, Pune, Maharashtra 411001',
    rating: 4.5,
    isVerified: true,
    contactPhone: '+91 20 6645 5100',
    accreditation: 'NABH Accredited'
  }
];

// @desc    Get all hospitals (with filters: city, query, minRating)
// @route   GET /api/v1/hospitals
// @access  Public
const getHospitals = async (req, res) => {
  try {
    const { city, query, minRating } = req.query;

    if (mongoose.connection.readyState !== 1) {
      let filtered = [...fallbackHospitals];
      if (city) {
        filtered = filtered.filter(h => h.city.toLowerCase().includes(city.toLowerCase()));
      }
      if (minRating) {
        filtered = filtered.filter(h => h.rating >= Number(minRating));
      }
      if (query) {
        filtered = filtered.filter(h =>
          h.name.toLowerCase().includes(query.toLowerCase()) ||
          h.city.toLowerCase().includes(query.toLowerCase())
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
    if (city) filter.city = { $regex: city, $options: 'i' };
    if (minRating) filter.rating = { $gte: Number(minRating) };
    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { address: { $regex: query, $options: 'i' } },
        { city: { $regex: query, $options: 'i' } }
      ];
    }

    const hospitals = await Hospital.find(filter).sort({ rating: -1 });

    res.json({
      success: true,
      count: hospitals.length,
      data: hospitals
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single hospital by ID
// @route   GET /api/v1/hospitals/:id
// @access  Public
const getHospitalById = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const hospital = fallbackHospitals.find(h => h._id === req.params.id) || fallbackHospitals[0];
      return res.json({
        success: true,
        data: hospital,
        note: 'MongoDB service offline, returning benchmark data'
      });
    }

    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }
    res.json({
      success: true,
      data: hospital
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get hospital treatments & price breakdown
// @route   GET /api/v1/hospitals/:id/costs
// @access  Public
const getHospitalCosts = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({
        success: true,
        hospital: fallbackHospitals[0],
        count: 1,
        data: [
          {
            hospital: fallbackHospitals[0]._id,
            costMin: 165000,
            costMax: 210000,
            costAvg: 185000,
            treatment: {
              code: 'ANGIO-01',
              title: 'Coronary Angioplasty',
              category: 'Cardiology',
              avgCostNational: 180000
            }
          }
        ]
      });
    }

    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    const costs = await HospitalTreatment.find({ hospital: req.params.id })
      .populate('treatment', 'code title category avgCostNational fairCostMin fairCostMax');

    res.json({
      success: true,
      hospital: {
        _id: hospital._id,
        name: hospital.name,
        city: hospital.city,
        rating: hospital.rating
      },
      count: costs.length,
      data: costs
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new hospital
// @route   POST /api/v1/hospitals
// @access  Private/Admin
const createHospital = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ success: false, message: 'Database writing unavailable: MongoDB service offline' });
    }
    const hospital = await Hospital.create(req.body);
    res.status(201).json({
      success: true,
      data: hospital
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getHospitals,
  getHospitalById,
  getHospitalCosts,
  createHospital
};
