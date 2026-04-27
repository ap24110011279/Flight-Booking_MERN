const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    amount: { type: Number, required: true },
    method: { type: String, enum: ['UPI', 'CARD'], required: true },
    status: { type: String, enum: ['Success', 'Failed'], required: true },
    txnRef: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
