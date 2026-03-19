const express = require('express');
const router = express.Router();
const { getAssets, getAssetHistory } = require('../controllers/assetController');

router.get('/', getAssets);
router.get('/history/:id', getAssetHistory);

module.exports = router;