const express = require('express');
const router = express.Router();
const {
  getTreatments,
  getTreatmentById,
  createTreatment
} = require('../controllers/treatmentController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', getTreatments);
router.post('/', protect, adminOnly, createTreatment);
router.get('/:id', getTreatmentById);

module.exports = router;
