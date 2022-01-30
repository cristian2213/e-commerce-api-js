const express = require('express');
const usersRoutes = require('./modules/users');
const authRoutes = require('./modules/auth');
const productsRoutes = require('./modules/products');
const logsRoutes = require('./modules/logs');
const rolesRoutes = require('./modules/roles');
const tagsRoutes = require('./modules/tags');
const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/roles', rolesRoutes);
router.use('/products', productsRoutes);
router.use('/logs', logsRoutes);
router.use('/tags', tagsRoutes);

module.exports = router;
