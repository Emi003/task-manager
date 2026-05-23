const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getHabits, createHabit, updateHabit, deleteHabit, toggleToday, getStats } = require('../controllers/habitController');

router.use(auth);
router.get('/',            getHabits);
router.post('/',           createHabit);
router.put('/:id',         updateHabit);
router.delete('/:id',      deleteHabit);
router.post('/:id/toggle', toggleToday);
router.get('/:id/stats',   getStats);

module.exports = router;
