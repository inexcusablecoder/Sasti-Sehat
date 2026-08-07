const express = require('express');
const router = express.Router();
const { estimateExpense } = require('../controllers/aiController');

router.post('/estimate-cost', estimateExpense);

module.exports = router;
