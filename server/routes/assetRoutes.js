const express = require('express');
const router = express.Router();
const { getAssets } = require('../controllers/assetController');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, getAssets);

module.exports = router;