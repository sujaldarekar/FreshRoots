const FarmerAnalytics = require('../models/FarmerAnalytics');

const createAnalytics = async (req, res) => {
  try {
    const {
      productId,
      productName,
      productionCost,
      transportationCost,
      laborCost,
      expectedRevenue,
    } = req.body;

    const pc = Number(productionCost) || 0;
    const tc = Number(transportationCost) || 0;
    const lc = Number(laborCost) || 0;
    const rev = Number(expectedRevenue) || 0;

    const totalInvestment = pc + tc + lc;
    const profit = rev - totalInvestment;
    const isLoss = profit < 0;
    const profitMargin = totalInvestment > 0 ? (profit / totalInvestment) * 100 : 0;

    const analytics = await FarmerAnalytics.create({
      farmerId: req.user._id,
      productId: productId || null,
      productName: productName || '',
      productionCost: pc,
      transportationCost: tc,
      laborCost: lc,
      totalInvestment,
      expectedRevenue: rev,
      profitMargin: Math.round(profitMargin * 100) / 100,
      profit: isLoss ? 0 : Math.round(profit * 100) / 100,
      loss: isLoss ? Math.round(Math.abs(profit) * 100) / 100 : 0,
      isLoss,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    });

    res.status(201).json(analytics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFarmerAnalytics = async (req, res) => {
  try {
    const analytics = await FarmerAnalytics.find({ farmerId: req.user._id })
      .populate('productId', 'productName category price')
      .sort({ createdAt: -1 });

    const totalInvestment = analytics.reduce((s, a) => s + a.totalInvestment, 0);
    const totalRevenue = analytics.reduce((s, a) => s + a.expectedRevenue, 0);
    const totalProfit = analytics.reduce((s, a) => s + a.profit, 0);
    const totalLoss = analytics.reduce((s, a) => s + a.loss, 0);

    res.json({ analytics, summary: { totalInvestment, totalRevenue, totalProfit, totalLoss } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateAnalytics = async (req, res) => {
  try {
    const record = await FarmerAnalytics.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Analytics record not found' });
    if (record.farmerId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    const { productionCost, transportationCost, laborCost, expectedRevenue } = req.body;
    const pc = Number(productionCost) || 0;
    const tc = Number(transportationCost) || 0;
    const lc = Number(laborCost) || 0;
    const rev = Number(expectedRevenue) || 0;
    const totalInvestment = pc + tc + lc;
    const profit = rev - totalInvestment;
    const isLoss = profit < 0;
    const profitMargin = totalInvestment > 0 ? (profit / totalInvestment) * 100 : 0;

    const updated = await FarmerAnalytics.findByIdAndUpdate(
      req.params.id,
      {
        productionCost: pc,
        transportationCost: tc,
        laborCost: lc,
        totalInvestment,
        expectedRevenue: rev,
        profitMargin: Math.round(profitMargin * 100) / 100,
        profit: isLoss ? 0 : Math.round(profit * 100) / 100,
        loss: isLoss ? Math.round(Math.abs(profit) * 100) / 100 : 0,
        isLoss,
      },
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteAnalytics = async (req, res) => {
  try {
    const record = await FarmerAnalytics.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Analytics record not found' });
    if (record.farmerId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    await FarmerAnalytics.findByIdAndDelete(req.params.id);
    res.json({ message: 'Analytics record deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createAnalytics, getFarmerAnalytics, updateAnalytics, deleteAnalytics };
