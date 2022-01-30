const express = require('express');
const router = express.Router();
const {
  getTag,
  getTags,
  createTag,
  deleteTag,
  updateTag,
} = require('../../../services/v1/tags/tags');

router.post('/create-tag', createTag);
router.get('/get-tags', getTags);
router.get('/get-tag/:tagId', getTag);
router.put('/update-tag/:tagId', updateTag);
router.delete('/delete-tag/:tagId', deleteTag);

module.exports = router;
