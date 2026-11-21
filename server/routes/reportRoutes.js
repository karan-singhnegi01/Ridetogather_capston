const router = require('express').Router();
const c = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/earnings', protect, authorize('driver'), c.driverEarnings);
router.get('/popular-routes', protect, c.popularRoutes);

module.exports = router;
