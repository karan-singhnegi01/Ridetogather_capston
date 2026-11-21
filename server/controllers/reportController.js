const Booking = require('../models/Booking');
const Ride = require('../models/Ride');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/reports/earnings  (driver)
// aggregation: accepted bookings -> join rides -> group per ride
exports.driverEarnings = asyncHandler(async (req, res) => {
  const perRide = await Booking.aggregate([
    { $match: { status: 'accepted' } },
    { $lookup: { from: 'rides', localField: 'ride', foreignField: '_id', as: 'ride' } },
    { $unwind: '$ride' },
    { $match: { 'ride.driver': req.user._id } },
    {
      $group: {
        _id: '$ride._id',
        route: { $first: { $concat: ['$ride.source', ' to ', '$ride.destination'] } },
        departureTime: { $first: '$ride.departureTime' },
        passengers: { $sum: '$seats' },
        earnings: { $sum: { $multiply: ['$seats', '$ride.fare'] } },
      },
    },
    { $sort: { departureTime: -1 } },
  ]);

  const totalEarnings = perRide.reduce((sum, r) => sum + r.earnings, 0);
  const totalPassengers = perRide.reduce((sum, r) => sum + r.passengers, 0);
  res.json({ success: true, totalEarnings, totalPassengers, perRide });
});

// GET /api/reports/popular-routes
// aggregation: group rides by route (case-insensitive) and count
exports.popularRoutes = asyncHandler(async (req, res) => {
  const routes = await Ride.aggregate([
    { $match: { status: { $ne: 'cancelled' } } },
    {
      $group: {
        _id: { from: { $toLower: '$source' }, to: { $toLower: '$destination' } },
        rides: { $sum: 1 },
        avgFare: { $avg: '$fare' },
      },
    },
    { $sort: { rides: -1 } },
    { $limit: 5 },
    {
      $project: {
        _id: 0,
        from: '$_id.from',
        to: '$_id.to',
        rides: 1,
        avgFare: { $round: ['$avgFare', 0] },
      },
    },
  ]);
  res.json({ success: true, routes });
});
