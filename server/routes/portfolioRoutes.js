const express = require('express');
const router = express.Router();
const { getPortfolio } = require('../controllers/portfolioController');
const { requireAuth } = require('../middleware/auth');

router.get('/:userId', requireAuth, getPortfolio);

module.exports = router;