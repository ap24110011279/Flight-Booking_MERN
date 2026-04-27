const router = require('express').Router();
const { processPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.post('/', protect, processPayment);

module.exports = router;
