const express = require('express');
const router = express.Router();
const usersRoutes = require('./modules/users');
const authRoutes = require('./modules/auth');
const productsRoutes = require('./modules/products');
const logsRoutes = require('./modules/logs');
const rolesRoutes = require('./modules/roles');
const tagsRoutes = require('./modules/tags');
const cartsRoutes = require('./modules/carts');

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/roles', rolesRoutes);
router.use('/products', productsRoutes);
router.use('/logs', logsRoutes);
router.use('/tags', tagsRoutes);
router.use('/carts', cartsRoutes);

module.exports = router;
