const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Flight = require('../models/Flight');

// Simulated payment. POST /api/payments { bookingId, method, simulateFail }
exports.processPayment = async (req, res) => {
  const { bookingId, method, simulateFail } = req.body;
  if (!bookingId || !['UPI', 'CARD'].includes(method))
    return res.status(400).json({ message: 'bookingId and valid method required' });

  const booking = await Booking.findById(bookingId);
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  if (String(booking.userId) !== String(req.user._id))
    return res.status(403).json({ message: 'Not your booking' });

  const success = !simulateFail; // realistic toggle from UI
  const txnRef = 'TXN' + Date.now() + Math.floor(Math.random() * 1000);

  const payment = await Payment.create({
    bookingId,
    amount: booking.amount,
    method,
    status: success ? 'Success' : 'Failed',
    txnRef,
  });

  if (success) {
    booking.paymentStatus = 'Paid';
    // Booking is officially Confirmed only AFTER a successful payment.
    booking.status = 'Confirmed';
    await booking.save();
    // Decrement seats by the number of passengers in this booking
    const seatsToReserve = booking.passengers?.length || 1;
    await Flight.findByIdAndUpdate(booking.flightId, {
      $inc: { seatsAvailable: -seatsToReserve },
    });
  } else {
    // Payment failure → booking is discarded so it never appears in history
    booking.paymentStatus = 'Failed';
    booking.status = 'Cancelled';
    await booking.save();
  }

  res.json({ payment, booking });
};
