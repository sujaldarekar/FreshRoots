const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    productName: { type: String, required: true, trim: true, maxlength: 200 },
    category: {
      type: String,
      enum: ['Vegetable', 'Rice', 'Wheat', 'Fruit', 'Dairy', 'Spice', 'Other'],
      required: true,
    },
    image: { type: String, default: '' },
    imagePublicId: { type: String, default: '' },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, default: 'kg' },
    price: { type: Number, required: true, min: 0 },
    marketPrice: { type: Number, default: 0 }, // average market price for comparison
    harvestDate: { type: Date },
    freshness: {
      type: String,
      enum: ['Fresh', 'Good', 'Average'],
      default: 'Fresh',
    },
    description: { type: String, trim: true, maxlength: 1000 },
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isAvailable: { type: Boolean, default: true },
    soldCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.index({ farmerId: 1 });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ freshness: 1 });

module.exports = mongoose.model('Product', productSchema);
