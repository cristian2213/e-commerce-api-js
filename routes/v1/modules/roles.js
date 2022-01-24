const express = require('express');
const router = express.Router();
const { getRoles } = require('../../../services/v1/roles/roles');

router.get('/get-roles', getRoles);

module.exports = router;
