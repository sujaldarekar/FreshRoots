const Product = require('../models/Product');
const ProductRating = require('../models/ProductRating');
const cloudinary = require('../config/cloudinary');

const hasCloudinaryConfig = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) return false;
  if (cloudName.toLowerCase().includes('your_cloudinary')) return false;
  return true;
};

const uploadToCloudinary = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image', quality: 'auto', fetch_format: 'auto' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80';

const createProduct = async (req, res) => {
  try {
    const {
      productName,
      category,
      quantity,
      price,
      harvestDate,
      freshness,
      description,
      marketPrice,
    } = req.body;

    if (!productName || !category || !quantity || !price)
      return res.status(400).json({ message: 'productName, category, quantity, and price are required' });

    let imageUrl = PLACEHOLDER_IMAGE;
    let imagePublicId = '';

    if (req.file && hasCloudinaryConfig()) {
      try {
        const result = await uploadToCloudinary(req.file.buffer, 'freshroots/products');
        imageUrl = result.secure_url;
        imagePublicId = result.public_id;
      } catch (uploadError) {
        console.error('Image upload failed, using placeholder image:', uploadError.message);
      }
    } else if (req.file && !hasCloudinaryConfig()) {
      console.warn('Cloudinary is not configured correctly. Saving product with placeholder image.');
    }

    const product = await Product.create({
      productName,
      category,
      image: imageUrl,
      imagePublicId,
      quantity: Number(quantity),
      price: Number(price),
      harvestDate: harvestDate || null,
      freshness: freshness || 'Fresh',
      description: description || '',
      marketPrice: marketPrice ? Number(marketPrice) : 0,
      farmerId: req.user._id,
    });

    const populated = await Product.findById(product._id).populate(
      'farmerId',
      'name farmName location rating'
    );
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProducts = async (req, res) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      freshness,
      search,
      page = 1,
      limit = 12,
    } = req.query;

    const filter = { isAvailable: true, quantity: { $gt: 0 } };
    if (category) filter.category = category;
    if (freshness) filter.freshness = freshness;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (search) {
      filter.$or = [
        { productName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('farmerId', 'name farmName location rating address')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(filter),
    ]);

    res.json({
      products,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      'farmerId',
      'name farmName location rating address phone'
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFarmerProducts = async (req, res) => {
  try {
    const products = await Product.find({ farmerId: req.params.farmerId }).sort({
      createdAt: -1,
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.farmerId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized to edit this product' });

    const {
      productName,
      category,
      quantity,
      price,
      harvestDate,
      freshness,
      description,
      isAvailable,
      marketPrice,
    } = req.body;

    let imageUrl = product.image;
    let imagePublicId = product.imagePublicId;

    if (req.file && hasCloudinaryConfig()) {
      if (product.imagePublicId) {
        try { await cloudinary.uploader.destroy(product.imagePublicId); } catch { /* ignore */ }
      }
      try {
        const result = await uploadToCloudinary(req.file.buffer, 'freshroots/products');
        imageUrl = result.secure_url;
        imagePublicId = result.public_id;
      } catch (uploadError) {
        console.error('Image upload failed during update. Keeping previous image:', uploadError.message);
      }
    } else if (req.file && !hasCloudinaryConfig()) {
      console.warn('Cloudinary is not configured correctly. Keeping existing product image.');
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      {
        productName: productName || product.productName,
        category: category || product.category,
        image: imageUrl,
        imagePublicId,
        quantity: quantity !== undefined ? Number(quantity) : product.quantity,
        price: price !== undefined ? Number(price) : product.price,
        harvestDate: harvestDate || product.harvestDate,
        freshness: freshness || product.freshness,
        description: description !== undefined ? description : product.description,
        isAvailable: isAvailable !== undefined ? isAvailable : product.isAvailable,
        marketPrice: marketPrice !== undefined ? Number(marketPrice) : product.marketPrice,
      },
      { new: true }
    ).populate('farmerId', 'name farmName');

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.farmerId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized to delete this product' });

    if (product.imagePublicId) {
      try { await cloudinary.uploader.destroy(product.imagePublicId); } catch { /* ignore */ }
    }
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProductRatings = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).select('_id');
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const ratings = await ProductRating.find({ productId: req.params.id })
      .populate('customerId', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(ratings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const rateProduct = async (req, res) => {
  try {
    const { rating, review, orderId } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const product = await Product.findById(req.params.id).select('farmerId');
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const existing = await ProductRating.findOne({
      productId: req.params.id,
      customerId: req.user._id,
      orderId: orderId || null,
    });

    if (existing) {
      existing.rating = Number(rating);
      existing.review = review || existing.review;
      await existing.save();
    } else {
      await ProductRating.create({
        productId: req.params.id,
        farmerId: product.farmerId,
        customerId: req.user._id,
        orderId: orderId || null,
        rating: Number(rating),
        review: review || '',
      });
    }

    const allRatings = await ProductRating.find({ productId: req.params.id }).select('rating');
    const avg = allRatings.reduce((sum, item) => sum + item.rating, 0) / allRatings.length;
    const rounded = Math.round(avg * 10) / 10;

    await Product.findByIdAndUpdate(req.params.id, {
      rating: rounded,
      totalRatings: allRatings.length,
    });

    res.json({ message: 'Product rating submitted', averageRating: rounded });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'You already rated this product for this order' });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid product id' });
    }
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  getFarmerProducts,
  updateProduct,
  deleteProduct,
  getProductRatings,
  rateProduct,
};
