const router = require('express').Router();
const c = require('../controllers/rideController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', c.searchRides);                                            // public search
router.get('/mine', protect, authorize('driver'), c.myRides);              // must be above /:id
router.get('/:id', c.getRide);
router.post('/', protect, authorize('driver'), c.createRide);
router.patch('/:id/complete', protect, authorize('driver'), c.completeRide);
router.delete('/:id', protect, authorize('driver'), c.cancelRide);

module.exports = router;
