const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getProfile, updateProfile } = require('../controllers/profileController');

router.use(auth);
router.get('/', getProfile);
router.put('/', updateProfile);

module.exports = router;
