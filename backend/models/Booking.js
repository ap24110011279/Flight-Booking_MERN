const mongoose = require('mongoose');

const passengerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 1, max: 120 },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    seatNumber: { type: String, required: true },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    flightId: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight', required: true },
    // Group-booking support: 1 to 10 passengers per booking
    passengers: {
      type: [passengerSchema],
      validate: [
        {
          validator: (arr) => Array.isArray(arr) && arr.length >= 1 && arr.length <= 10,
          message: 'A booking must have between 1 and 10 passengers',
        },
      ],
      required: true,
    },
    // Convenience field — comma-separated list of seats for quick display
    seatNumbers: { type: [String], required: true },
    bookingDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['PendingPayment', 'Confirmed', 'Cancelled'],
      default: 'PendingPayment',
    },
    paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' },
    amount: { type: Number, required: true }, // total for all passengers
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
