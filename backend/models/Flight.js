const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema(
  {
    flightNumber: { type: String, required: true, unique: true },
    airlineName: { type: String, required: true },
    source: { type: String, required: true, index: true },
    destination: { type: String, required: true, index: true },
    departureTime: { type: Date, required: true },
    arrivalTime: { type: Date, required: true },
    durationMinutes: { type: Number, required: true },
    price: { type: Number, required: true },
    seatsAvailable: { type: Number, default: 60 },
    aircraft: { type: String, default: 'Boeing 737' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Flight', flightSchema);
