const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

const makeTokens = (user) => ({
  accessToken: jwt.sign({ id: user._id, role: user.role }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' }),
  refreshToken: jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' }),
});

// creates tokens, saves refresh token in DB and sends response
const sendAuth = async (res, user, status = 200) => {
  const { accessToken, refreshToken } = makeTokens(user);
  await User.findByIdAndUpdate(user._id, { refreshToken });
  res.status(status).json({
    success: true,
    accessToken,
    refreshToken,
    user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role },
  });
};

// POST /api/auth/register
exports.register = asyncHandler(async (req, res) => {
  const { name, email, phone, password, role } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required');
  }
  if (role === 'admin') {
    res.status(403);
    throw new Error('You cannot register as admin');
  }
  if (await User.findOne({ email: email.toLowerCase() })) {
    res.status(409);
    throw new Error('Email already registered');
  }
  const user = await User.create({
    name,
    email,
    phone,
    password,
    role: role === 'driver' ? 'driver' : 'passenger',
  });
  await sendAuth(res, user, 201);
});

// POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required');
  }
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }
  await sendAuth(res, user);
});

// POST /api/auth/refresh  -> gives a new access token using the refresh token
exports.refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    res.status(401);
    throw new Error('Refresh token missing');
  }
  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user || user.refreshToken !== refreshToken) {
    res.status(401);
    throw new Error('Refresh token is not valid');
  }
  await sendAuth(res, user);
});

// POST /api/auth/logout
exports.logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
  res.json({ success: true, message: 'Logged out' });
});

// GET /api/auth/me
exports.me = asyncHandler(async (req, res) => {
  const u = req.user;
  res.json({ success: true, user: { id: u._id, name: u.name, email: u.email, phone: u.phone, role: u.role } });
});
