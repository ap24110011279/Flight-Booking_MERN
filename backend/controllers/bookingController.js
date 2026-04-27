const Booking = require('../models/Booking');
const Flight = require('../models/Flight');

/**
 * POST /api/bookings
 * Body: { flightId, passengers: [{ name, age, gender, seatNumber }] }
 * Supports 1 to 10 passengers in a single booking.
 */
exports.createBooking = async (req, res) => {
  const { flightId, passengers } = req.body;

  if (!flightId || !Array.isArray(passengers) || passengers.length === 0) {
    return res
      .status(400)
      .json({ message: 'flightId and at least one passenger are required' });
  }
  if (passengers.length > 10) {
    return res
      .status(400)
      .json({ message: 'You can book a maximum of 10 passengers per booking' });
  }

  // Validate every passenger
  for (const [i, p] of passengers.entries()) {
    if (!p.name || !p.age || !p.gender || !p.seatNumber) {
      return res.status(400).json({
        message: `Passenger ${i + 1}: name, age, gender and seatNumber are required`,
      });
    }
  }

  // Make sure no duplicate seats inside the request
  const seats = passengers.map((p) => String(p.seatNumber));
  if (new Set(seats).size !== seats.length) {
    return res.status(400).json({ message: 'Duplicate seat selection detected' });
  }

  const flight = await Flight.findById(flightId);
  if (!flight) return res.status(404).json({ message: 'Flight not found' });
  if (flight.seatsAvailable < passengers.length) {
    return res
      .status(400)
      .json({ message: `Only ${flight.seatsAvailable} seats left on this flight` });
  }

  const totalAmount = flight.price * passengers.length;

  const booking = await Booking.create({
    userId: req.user._id,
    flightId,
    passengers,
    seatNumbers: seats,
    amount: totalAmount,
    paymentStatus: 'Pending',
    // IMPORTANT: a booking only becomes "Confirmed" after a successful payment.
    // Until then it stays in "PendingPayment" and is NOT shown in My Bookings.
    status: 'PendingPayment',
  });

  res.status(201).json(booking);
};

// GET /api/bookings/me
// Only return bookings the user has actually paid for (or already cancelled).
// Pending-payment bookings are hidden so users don't see "booked" entries
// just because they clicked a flight without completing payment.
exports.myBookings = async (req, res) => {
  // Auto-clean stale unpaid bookings older than 30 minutes
  await Booking.deleteMany({
    userId: req.user._id,
    status: 'PendingPayment',
    createdAt: { $lt: new Date(Date.now() - 30 * 60 * 1000) },
  });

  const bookings = await Booking.find({
    userId: req.user._id,
    status: { $in: ['Confirmed', 'Cancelled'] },
  })
    .populate('flightId')
    .sort({ createdAt: -1 });
  res.json(bookings);
};

// PATCH /api/bookings/:id/cancel
exports.cancelBooking = async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ message: 'Booking not found' });
  if (String(booking.userId) !== String(req.user._id))
    return res.status(403).json({ message: 'Not your booking' });
  if (booking.status === 'Cancelled')
    return res.status(400).json({ message: 'Already cancelled' });

  booking.status = 'Cancelled';
  await booking.save();

  // free up all seats that were reserved (only if previously paid/decremented)
  if (booking.paymentStatus === 'Paid') {
    await Flight.findByIdAndUpdate(booking.flightId, {
      $inc: { seatsAvailable: booking.passengers.length },
    });
  }

  res.json(booking);
};
