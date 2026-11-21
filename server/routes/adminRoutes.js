const router = require('express').Router();
const c = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// every admin route needs login + admin role (RBAC)
router.use(protect, authorize('admin'));

router.get('/users', c.getUsers);
router.delete('/users/:id', c.deleteUser);
router.get('/stats', c.getStats);

module.exports = router;
