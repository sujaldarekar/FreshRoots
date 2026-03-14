const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

const safeUser = (user, token) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone || '',
  address: user.address || '',
  location: user.location,
  farmName: user.farmName || '',
  farmDescription: user.farmDescription || '',
  avatar: user.avatar || '',
  rating: user.rating,
  totalRatings: user.totalRatings,
  token,
});

const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone,
      address,
      coordinates,
      location,
      farmName,
      farmDescription,
    } = req.body;

    const cleanName = name?.trim();
    const cleanEmail = email?.trim().toLowerCase();
    const cleanPhone = phone?.trim();
    const cleanAddress = address?.trim();
    const cleanFarmName = farmName?.trim();
    const cleanFarmDescription = farmDescription?.trim();
    const cleanRole = role || 'customer';

    if (!cleanName || !cleanEmail || !password)
      return res.status(400).json({ message: 'Name, email, and password are required' });

    if (!['customer', 'farmer', 'admin'].includes(cleanRole)) {
      return res.status(400).json({ message: 'Invalid user role' });
    }

    if (cleanRole === 'farmer' && !cleanFarmName) {
      return res.status(400).json({ message: 'Farm name is required for farmer accounts' });
    }

    const exists = await User.findOne({ email: cleanEmail });
    if (exists) return res.status(409).json({ message: 'Email already registered' });

    const userData = {
      name: cleanName,
      email: cleanEmail,
      password,
      role: cleanRole,
      phone: cleanPhone,
      address: cleanAddress,
    };
    
    // Handle location from coordinates array or location object
    if (Array.isArray(coordinates) && coordinates.length === 2) {
      userData.location = { type: 'Point', coordinates: coordinates.map(Number) };
    } else if (location && location.coordinates && Array.isArray(location.coordinates)) {
      userData.location = { type: 'Point', coordinates: location.coordinates };
    }
    
    if (cleanRole === 'farmer') {
      userData.farmName = cleanFarmName;
      userData.farmDescription = cleanFarmDescription;
    }

    const user = await User.create(userData);
    const token = generateToken(user._id);
    console.log('✅ User created successfully:', user._id);
    res.status(201).json(safeUser(user, token));
  } catch (error) {
    console.error('❌ Registration error:', error.message);
    console.error('Full error:', error);

    if (error.code === 11000) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    if (error.name === 'ValidationError') {
      const firstError = Object.values(error.errors || {})[0]?.message || 'Validation failed';
      return res.status(400).json({ message: firstError });
    }

    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email?.trim().toLowerCase();

    if (!cleanEmail || !password)
      return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email: cleanEmail });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });

    if (!user.isActive)
      return res.status(403).json({ message: 'Account is deactivated. Contact support.' });

    const token = generateToken(user._id);
    res.json(safeUser(user, token));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone, address, coordinates, farmName, farmDescription } = req.body;
    const updateData = { name, phone, address };
    if (farmName !== undefined) updateData.farmName = farmName;
    if (farmDescription !== undefined) updateData.farmDescription = farmDescription;
    if (Array.isArray(coordinates) && coordinates.length === 2) {
      updateData.location = { type: 'Point', coordinates: coordinates.map(Number) };
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, login, getMe, updateProfile };
