const mongoose = require('mongoose');

const farmerAnalyticsSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    productName: { type: String },
    productionCost: { type: Number, default: 0 },
    transportationCost: { type: Number, default: 0 },
    laborCost: { type: Number, default: 0 },
    totalInvestment: { type: Number, default: 0 },
    expectedRevenue: { type: Number, default: 0 },
    actualRevenue: { type: Number, default: 0 },
    profitMargin: { type: Number, default: 0 }, // percentage
    profit: { type: Number, default: 0 },
    loss: { type: Number, default: 0 },
    isLoss: { type: Boolean, default: false },
    month: { type: Number, min: 1, max: 12 },
    year: { type: Number },
  },
  { timestamps: true }
);

farmerAnalyticsSchema.index({ farmerId: 1 });

module.exports = mongoose.model('FarmerAnalytics', farmerAnalyticsSchema);
