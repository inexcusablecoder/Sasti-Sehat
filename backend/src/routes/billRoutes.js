const express = require('express');
const router = express.Router();
const { uploadAndAnalyzeBill, getUserBills, getBillById } = require('../controllers/billController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/upload', optionalAuth, upload.single('bill'), uploadAndAnalyzeBill);
router.get('/', protect, getUserBills);
router.get('/:id', getBillById);

module.exports = router;
