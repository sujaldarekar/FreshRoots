const mongoose = require('mongoose');

const productRatingSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
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

productRatingSchema.index({ productId: 1 });
productRatingSchema.index({ customerId: 1 });
productRatingSchema.index({ productId: 1, customerId: 1, orderId: 1 }, { unique: true });

module.exports = mongoose.model('ProductRating', productRatingSchema);
