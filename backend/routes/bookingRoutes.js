const router = require('express').Router();
const { createBooking, myBookings, cancelBooking } = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/', createBooking);
router.get('/me', myBookings);
router.patch('/:id/cancel', cancelBooking);

module.exports = router;
