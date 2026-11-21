const User = require('../models/User');
const Booking = require('../models/Booking');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/admin/users
exports.getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json({ success: true, users });
});

// DELETE /api/admin/users/:id
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  if (user.role === 'admin') {
    res.status(400);
    throw new Error('Admin accounts cannot be deleted');
  }
  await user.deleteOne();
  res.json({ success: true, message: 'User deleted' });
});

// GET /api/admin/stats  (aggregation)
exports.getStats = asyncHandler(async (req, res) => {
  const usersByRole = await User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]);
  const bookingsByStatus = await Booking.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
  res.json({ success: true, usersByRole, bookingsByStatus });
});
