const express = require('express');
const router = express.Router();

const verifyToken = require('../../../middlewares/v1/auth/verifyToken');
const {
  getUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  resetPassword,
  confirmToken,
} = require('../../../services/v1/users/users');
const {
  getUserReq,
  createUserReq,
  updateUserReq,
  deleteUserReq,
  resetPasswordReq,
  confirmTokenReq,
  updatePasswordReq,
} = require('../../../requests/v1/users/users');

router.get('/get-users', getUsers);

router.get('/get-user/:id', getUserReq, getUser);

router.post('/create', createUserReq, createUser);

router.put('/update-user/:id', verifyToken, updateUserReq, updateUser);

router.delete('/delete-user/:id', verifyToken, deleteUserReq, deleteUser);

// FIXME I'm here
router.post('/reset-password', resetPasswordReq, resetPassword);

router.get('/reset-password/:token', confirmTokenReq, confirmToken);

router.post('/reset-password/:token', updatePasswordReq, updateUser);

module.exports = router;
