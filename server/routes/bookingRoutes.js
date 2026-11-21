const router = require('express').Router();
const c = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', authorize('passenger'), c.createBooking);
router.get('/mine', authorize('passenger'), c.myBookings);
router.get('/requests', authorize('driver'), c.driverRequests);
router.patch('/:id/respond', authorize('driver'), c.respondBooking);
router.patch('/:id/cancel', authorize('passenger'), c.cancelBooking);

module.exports = router;
