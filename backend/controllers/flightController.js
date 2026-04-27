const Flight = require('../models/Flight');

// GET /api/flights?source=&destination=&date=&airline=&maxPrice=&sort=
exports.searchFlights = async (req, res) => {
  const { source, destination, date, airline, maxPrice, sort } = req.query;
  const q = {};
  if (source) q.source = new RegExp(`^${source}$`, 'i');
  if (destination) q.destination = new RegExp(`^${destination}$`, 'i');
  if (airline) q.airlineName = new RegExp(airline, 'i');
  if (maxPrice) q.price = { $lte: Number(maxPrice) };

  if (date) {
    const d = new Date(date);
    const start = new Date(d.setHours(0, 0, 0, 0));
    const end = new Date(d.setHours(23, 59, 59, 999));
    q.departureTime = { $gte: start, $lte: end };
  }

  let cursor = Flight.find(q);
  if (sort === 'price') cursor = cursor.sort({ price: 1 });
  else if (sort === 'duration') cursor = cursor.sort({ durationMinutes: 1 });
  else cursor = cursor.sort({ departureTime: 1 });

  const flights = await cursor.lean();
  res.json({ count: flights.length, flights });
};

exports.getFlight = async (req, res) => {
  const flight = await Flight.findById(req.params.id);
  if (!flight) return res.status(404).json({ message: 'Flight not found' });
  res.json(flight);
};

// Admin only
exports.createFlight = async (req, res) => {
  const flight = await Flight.create(req.body);
  res.status(201).json(flight);
};
