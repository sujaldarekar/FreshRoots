const Order = require('../models/Order');
const Product = require('../models/Product');

const getDeliveryCost = (distanceKm) => {
  if (distanceKm <= 5) return 20;
  if (distanceKm <= 10) return 40;
  if (distanceKm <= 20) return 60;
  if (distanceKm <= 50) return 100;
  return 150;
};

const createOrder = async (req, res) => {
  try {
    const { products, deliveryAddress, distance = 0, paymentMethod, notes } = req.body;

    if (!products || products.length === 0)
      return res.status(400).json({ message: 'No products in order' });

    let totalPrice = 0;
    const orderProducts = [];

    for (const item of products) {
      const product = await Product.findById(item.productId).populate('farmerId', 'name');
      if (!product) return res.status(404).json({ message: `Product not found: ${item.productId}` });
      if (product.quantity < item.quantity)
        return res.status(400).json({ message: `Insufficient stock for ${product.productName}` });

      totalPrice += product.price * item.quantity;
      orderProducts.push({
        productId: product._id,
        productName: product.productName,
        quantity: item.quantity,
        price: product.price,
        farmerId: product.farmerId._id,
        farmerName: product.farmerId.name,
      });

      // Deduct stock
      await Product.findByIdAndUpdate(product._id, {
        $inc: { quantity: -item.quantity, soldCount: item.quantity },
      });
    }

    const deliveryCost = getDeliveryCost(Number(distance));
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + (distance > 20 ? 3 : 2));

    const order = await Order.create({
      userId: req.user._id,
      products: orderProducts,
      totalPrice,
      deliveryCost,
      distance: Number(distance),
      deliveryAddress,
      paymentMethod: paymentMethod || 'Cash on Delivery',
      estimatedDelivery,
      notes,
    });

    const populated = await Order.findById(order._id)
      .populate('userId', 'name email')
      .populate('products.farmerId', 'name farmName');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .populate('products.farmerId', 'name farmName')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFarmerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ 'products.farmerId': req.user._id })
      .populate('userId', 'name email address phone')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'name email address phone')
      .populate('products.farmerId', 'name farmName phone');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const isOwner = order.userId._id.toString() === req.user._id.toString();
    const isFarmerInOrder = order.products.some(
      (p) => p.farmerId._id && p.farmerId._id.toString() === req.user._id.toString()
    );
    if (!isOwner && !isFarmerInOrder && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status))
      return res.status(400).json({ message: 'Invalid status value' });

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus: status },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createOrder, getUserOrders, getFarmerOrders, getOrderById, updateOrderStatus };
