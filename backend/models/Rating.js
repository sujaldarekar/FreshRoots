const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    rating: { type: Number, min: 1, max: 5, required: true },
    review: { type: String, maxlength: 500 },
  },
  { timestamps: true }
);

ratingSchema.index({ farmerId: 1 });
ratingSchema.index({ customerId: 1 });

module.exports = mongoose.model('Rating', ratingSchema);
