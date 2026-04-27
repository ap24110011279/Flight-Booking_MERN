const router = require('express').Router();
const { searchFlights, getFlight, createFlight } = require('../controllers/flightController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', searchFlights);
router.get('/:id', getFlight);
router.post('/', protect, adminOnly, createFlight);

module.exports = router;
