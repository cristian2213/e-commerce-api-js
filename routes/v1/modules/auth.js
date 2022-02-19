const express = require('express');
const router = express.Router();
const {
  signUpReq,
  signInReq,
} = require('../../../requests/v1/auth/authRequests');
const { confirmTokenReq } = require('../../../requests/v1/users/users');
const {
  signUp,
  signIn,
  confirmAccount,
  signOut,
} = require('../../../services/v1/auth/auth');
const verifyToken = require('../../../middlewares/v1/auth/verifyToken');

router.post('/signup', signUpReq, signUp);

router.post('/signin', signInReq, signIn);

router.get('/signout', verifyToken, signOut);

router.get('/confirm-email/:token', confirmTokenReq, confirmAccount);

module.exports = router;
