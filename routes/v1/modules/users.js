const express = require('express');
const router = express.Router();
const { getUsers, createUser } = require('../../../services/v1/users/users');

router.get('/get-users', getUsers);
router.post('/create', createUser);

module.exports = router;
