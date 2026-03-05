const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const { createAlert, getAlerts, deleteAlert } = require('./alerts.controller');

router.use(protect);
router.post('/', createAlert);
router.get('/', getAlerts);
router.delete('/:id', deleteAlert);

module.exports = router;