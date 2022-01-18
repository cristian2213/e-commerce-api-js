const express = require('express');
const router = express.Router();

router.get('/get-users', (req, res) => {
  console.log('entra');
  res.send('ok');
});

module.exports = router;
