const express = require('express');
const router = express.Router();
const { depositFunds, buyAsset,sellAsset } = require('../controllers/tradeController');
const { requireAuth } = require('../middleware/auth');

router.post('/deposit', requireAuth, depositFunds);
router.post('/buy', requireAuth, buyAsset);
router.post('/sell', requireAuth, sellAsset);

module.exports = router;