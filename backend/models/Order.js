const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    products: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        productName: { type: String },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        farmerName: { type: String },
      },
    ],
    totalPrice: { type: Number, required: true },
    deliveryCost: { type: Number, default: 0 },
    distance: { type: Number, default: 0 },
    orderStatus: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
    deliveryAddress: { type: String },
    paymentMethod: { type: String, default: 'Cash on Delivery' },
    paymentStatus: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' },
    estimatedDelivery: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

orderSchema.index({ userId: 1 });
orderSchema.index({ 'products.farmerId': 1 });
orderSchema.index({ orderStatus: 1 });

module.exports = mongoose.model('Order', orderSchema);
