const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getLinks, createLink, deleteLink } = require('../controllers/linkController');

router.use(auth);
router.get('/',     getLinks);
router.post('/',    createLink);
router.delete('/:id', deleteLink);

module.exports = router;
