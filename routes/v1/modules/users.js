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
  updatePassword,
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

router.get('/get-users', verifyToken, getUsers);

router.get('/get-user/:id', verifyToken, getUserReq, getUser);

router.post('/create', verifyToken, createUserReq, createUser);

router.put('/update-user/:id', verifyToken, updateUserReq, updateUser);

router.delete('/delete-user/:id', verifyToken, deleteUserReq, deleteUser);

router.post('/reset-password', resetPasswordReq, resetPassword);

router.get('/reset-password/:token', confirmTokenReq, confirmToken);

router.post('/reset-password/:token', updatePasswordReq, updatePassword);

module.exports = router;
