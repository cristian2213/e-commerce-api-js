const express = require('express');
const router = express.Router();
const {
  getUserStatistics,
} = require('../../../services/v1/statistics/connections');
const verifyToken = require('../../../middlewares/v1/auth/verifyToken');
router.get('/user', verifyToken, getUserStatistics);

module.exports = router;
