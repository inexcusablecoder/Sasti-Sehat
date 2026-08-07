const express = require('express');
const router = express.Router();
const {
  getHospitals,
  getHospitalById,
  getHospitalCosts,
  createHospital
} = require('../controllers/hospitalController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', getHospitals);
router.post('/', protect, adminOnly, createHospital);
router.get('/:id', getHospitalById);
router.get('/:id/costs', getHospitalCosts);

module.exports = router;
