const Ride = require('../models/Ride');
const Booking = require('../models/Booking');
const asyncHandler = require('../utils/asyncHandler');

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// POST /api/rides  (driver)
exports.createRide = asyncHandler(async (req, res) => {
  const { source, destination, departureTime, fare, totalSeats } = req.body;
  const ride = await Ride.create({
    driver: req.user._id,
    source,
    destination,
    departureTime,
    fare,
    totalSeats,
  });
  res.status(201).json({ success: true, ride });
});

// GET /api/rides?source=&destination=&date=&seats=&maxFare=&sort=&page=&limit=
exports.searchRides = asyncHandler(async (req, res) => {
  const { source, destination, date, seats, maxFare, sort } = req.query;
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 6, 20);

  const now = new Date();
  const filter = { status: 'open', availableSeats: { $gt: 0 }, departureTime: { $gt: now } };

  if (source) filter.source = new RegExp(escapeRegex(source), 'i');
  if (destination) filter.destination = new RegExp(escapeRegex(destination), 'i');
  if (date) {
    const start = new Date(`${date}T00:00:00`);
    const end = new Date(`${date}T23:59:59.999`);
    filter.departureTime = { $gte: start > now ? start : now, $lte: end };
  }
  if (seats) filter.availableSeats = { $gte: Number(seats) };
  if (maxFare) filter.fare = { $lte: Number(maxFare) };

  const sortOptions = {
    fare_asc: { fare: 1 },
    fare_desc: { fare: -1 },
    time: { departureTime: 1 },
  };

  const total = await Ride.countDocuments(filter);
  const rides = await Ride.find(filter)
    .populate('driver', 'name phone')
    .sort(sortOptions[sort] || sortOptions.time)
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({ success: true, rides, page, pages: Math.ceil(total / limit), total });
});

// GET /api/rides/mine  (driver)
exports.myRides = asyncHandler(async (req, res) => {
  const rides = await Ride.find({ driver: req.user._id }).sort({ departureTime: -1 });
  res.json({ success: true, rides });
});

// GET /api/rides/:id
exports.getRide = asyncHandler(async (req, res) => {
  const ride = await Ride.findById(req.params.id).populate('driver', 'name phone');
  if (!ride) {
    res.status(404);
    throw new Error('Ride not found');
  }
  res.json({ success: true, ride });
});

// helper: find ride and make sure the logged in driver owns it
const getOwnRide = async (req, res) => {
  const ride = await Ride.findById(req.params.id);
  if (!ride) {
    res.status(404);
    throw new Error('Ride not found');
  }
  if (!ride.driver.equals(req.user._id)) {
    res.status(403);
    throw new Error('This is not your ride');
  }
  return ride;
};

// PATCH /api/rides/:id/complete  (driver)
exports.completeRide = asyncHandler(async (req, res) => {
  const ride = await getOwnRide(req, res);
  if (ride.status !== 'open') {
    res.status(400);
    throw new Error(`Ride is already ${ride.status}`);
  }
  ride.status = 'completed';
  await ride.save();
  res.json({ success: true, ride });
});

// DELETE /api/rides/:id  (driver) -> cancels the ride and its bookings
exports.cancelRide = asyncHandler(async (req, res) => {
  const ride = await getOwnRide(req, res);
  if (ride.status !== 'open') {
    res.status(400);
    throw new Error(`Ride is already ${ride.status}`);
  }
  ride.status = 'cancelled';
  await ride.save();
  await Booking.updateMany(
    { ride: ride._id, status: { $in: ['pending', 'accepted'] } },
    { status: 'cancelled' }
  );
  res.json({ success: true, message: 'Ride cancelled' });
});
