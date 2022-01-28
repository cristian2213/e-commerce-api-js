const express = require('express');
const router = express.Router();
const { getLogReq } = require('../../../requests/v1/logs/logs');
const {
  downloadLog,
  getLogs,
  getLog,
  deleteLog,
} = require('../../../services/v1/logs/productsLogs/bulkUploadLog');

router.get('/get-logs', getLogs);
router.get('/get-log/:logId', getLogReq, getLog);
router.delete('/delete-log/:logId', getLogReq, deleteLog);
router.get('/download-log/:logId', getLogReq, downloadLog);

module.exports = router;
