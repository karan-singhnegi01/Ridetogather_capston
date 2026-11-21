const Ride = require('../models/Ride');
const Booking = require('../models/Booking');
const asyncHandler = require('../utils/asyncHandler');

// POST /api/bookings  (passenger)  body: { rideId, seats }
exports.createBooking = asyncHandler(async (req, res) => {
  const { rideId } = req.body;
  const seats = Number(req.body.seats) || 1;

  const ride = await Ride.findById(rideId);
  if (!ride || ride.status !== 'open') {
    res.status(404);
    throw new Error('Ride not available');
  }
  if (ride.driver.equals(req.user._id)) {
    res.status(400);
    throw new Error('You cannot book your own ride');
  }
  if (seats < 1 || seats > ride.availableSeats) {
    res.status(400);
    throw new Error(`Only ${ride.availableSeats} seat(s) available`);
  }

  let booking = await Booking.findOne({ ride: rideId, passenger: req.user._id });
  if (booking) {
    // allow booking again only if the old one was cancelled
    if (booking.status !== 'cancelled') {
      res.status(409);
      throw new Error(`You already have a ${booking.status} request for this ride`);
    }
    booking.status = 'pending';
    booking.seats = seats;
    await booking.save();
  } else {
    booking = await Booking.create({ ride: rideId, passenger: req.user._id, seats });
  }
  res.status(201).json({ success: true, booking });
});

// GET /api/bookings/mine  (passenger)
exports.myBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ passenger: req.user._id })
    .populate({ path: 'ride', populate: { path: 'driver', select: 'name phone' } })
    .sort({ createdAt: -1 });
  res.json({ success: true, bookings });
});

// GET /api/bookings/requests  (driver) -> requests on the driver's rides
exports.driverRequests = asyncHandler(async (req, res) => {
  const myRides = await Ride.find({ driver: req.user._id }).select('_id');
  const bookings = await Booking.find({ ride: { $in: myRides.map((r) => r._id) } })
    .populate('ride', 'source destination departureTime fare')
    .populate('passenger', 'name phone')
    .sort({ createdAt: -1 });
  res.json({ success: true, bookings });
});

// PATCH /api/bookings/:id/respond  (driver)  body: { action: 'accept' | 'reject' }
exports.respondBooking = asyncHandler(async (req, res) => {
  const { action } = req.body;
  if (!['accept', 'reject'].includes(action)) {
    res.status(400);
    throw new Error("Action must be 'accept' or 'reject'");
  }
  const booking = await Booking.findById(req.params.id).populate('ride');
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  if (!booking.ride.driver.equals(req.user._id)) {
    res.status(403);
    throw new Error('This request is not for your ride');
  }
  if (booking.status !== 'pending') {
    res.status(400);
    throw new Error(`Request is already ${booking.status}`);
  }

  if (action === 'accept') {
    // reduce seats only if enough seats are still left
    const updated = await Ride.findOneAndUpdate(
      { _id: booking.ride._id, status: 'open', availableSeats: { $gte: booking.seats } },
      { $inc: { availableSeats: -booking.seats } }
    );
    if (!updated) {
      res.status(400);
      throw new Error('Not enough seats left to accept this request');
    }
    booking.status = 'accepted';
  } else {
    booking.status = 'rejected';
  }
  await booking.save();
  res.json({ success: true, message: `Request ${booking.status}`, booking });
});

// PATCH /api/bookings/:id/cancel  (passenger)
exports.cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    res.status(404);
    throw new Error('Booking not found');
  }
  if (!booking.passenger.equals(req.user._id)) {
    res.status(403);
    throw new Error('This is not your booking');
  }
  if (!['pending', 'accepted'].includes(booking.status)) {
    res.status(400);
    throw new Error(`Booking is already ${booking.status}`);
  }
  // give the seats back if the driver had already accepted
  if (booking.status === 'accepted') {
    await Ride.findByIdAndUpdate(booking.ride, { $inc: { availableSeats: booking.seats } });
  }
  booking.status = 'cancelled';
  await booking.save();
  res.json({ success: true, message: 'Booking cancelled', booking });
});
