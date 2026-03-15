const User = require('../models/User');
const Product = require('../models/Product');
const Rating = require('../models/Rating');

// Haversine formula — returns distance in km
const haversine = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const getAllFarmers = async (req, res) => {
  try {
    const farmers = await User.find({ role: 'farmer', isActive: true })
      .select('-password')
      .sort({ rating: -1 });

    const result = await Promise.all(
      farmers.map(async (farmer) => {
        const productCount = await Product.countDocuments({
          farmerId: farmer._id,
          isAvailable: true,
          quantity: { $gt: 0 },
        });
        return { ...farmer.toObject(), productCount };
      })
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getNearbyFarmers = async (req, res) => {
  try {
    const { lat, lng, radius = 100 } = req.query;
    if (!lat || !lng)
      return res.status(400).json({ message: 'lat and lng query parameters are required' });

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const radiusKm = Number(radius);

    let farmers;
    try {
      // Use geospatial index
      farmers = await User.find({
        role: 'farmer',
        isActive: true,
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: [userLng, userLat] },
            $maxDistance: radiusKm * 1000,
          },
        },
      })
        .select('-password')
        .limit(30);
    } catch {
      // Fallback: fetch all and filter manually
      farmers = await User.find({ role: 'farmer', isActive: true }).select('-password');
    }

    const withDistance = await Promise.all(
      farmers.map(async (farmer) => {
        const [fLng, fLat] = farmer.location?.coordinates || [0, 0];
        const distance = Math.round(haversine(userLat, userLng, fLat, fLng) * 10) / 10;

        const products = await Product.find({
          farmerId: farmer._id,
          isAvailable: true,
          quantity: { $gt: 0 },
        })
          .select('productName category price freshness image quantity')
          .limit(4);

        return { ...farmer.toObject(), distance, products };
      })
    );

    withDistance.sort((a, b) => a.distance - b.distance);
    res.json(withDistance.filter((f) => f.distance <= radiusKm));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFarmerProfile = async (req, res) => {
  try {
    const farmer = await User.findOne({ _id: req.params.id, role: 'farmer' }).select('-password');
    if (!farmer) return res.status(404).json({ message: 'Farmer not found' });

    const products = await Product.find({ farmerId: req.params.id, isAvailable: true });
    const ratings = await Rating.find({ farmerId: req.params.id })
      .populate('customerId', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ farmer, products, ratings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const rateFarmer = async (req, res) => {
  try {
    const { rating, review, orderId } = req.body;
    if (!rating || rating < 1 || rating > 5)
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });

    const farmer = await User.findOne({ _id: req.params.id, role: 'farmer' });
    if (!farmer) return res.status(404).json({ message: 'Farmer not found' });

    const existing = await Rating.findOne({
      farmerId: req.params.id,
      customerId: req.user._id,
      orderId,
    });
    if (existing) {
      existing.rating = Number(rating);
      existing.review = review || existing.review;
      await existing.save();
    } else {
      await Rating.create({
        farmerId: req.params.id,
        customerId: req.user._id,
        orderId: orderId || null,
        rating: Number(rating),
        review: review || '',
      });
    }

    const allRatings = await Rating.find({ farmerId: req.params.id });
    const avg = allRatings.reduce((s, r) => s + r.rating, 0) / allRatings.length;

    await User.findByIdAndUpdate(req.params.id, {
      rating: Math.round(avg * 10) / 10,
      totalRatings: allRatings.length,
    });

    res.json({ message: 'Rating submitted', averageRating: Math.round(avg * 10) / 10 });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid farmer id' });
    }
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllFarmers, getNearbyFarmers, getFarmerProfile, rateFarmer };
