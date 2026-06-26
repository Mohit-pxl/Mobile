const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/permission.middleware');
const {
  listStaff,
  updateUserRole,
  deactivateUser,
  listUsers,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/user.controller');

// All user management routes require admin role
router.use(authenticate, requireRole(['admin']));

// GET /api/users — List all users
router.get('/', listUsers);

// POST /api/users — Create a user
router.post('/', createUser);

// PATCH /api/users/:id — Update a user
router.patch('/:id', updateUser);

// DELETE /api/users/:id — Delete a user
router.delete('/:id', deleteUser);

/**
 * @swagger
 * /users/staff:
 *   get:
 *     summary: List staff/admin accounts
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of staff members
 */
// GET /api/users/staff — List staff/admin accounts
router.get('/staff', listStaff);

/**
 * @swagger
 * /users/{id}/role:
 *   patch:
 *     summary: Change user role and permissions
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: User role updated
 */
// PATCH /api/users/:id/role — Change user role + permissions
router.patch('/:id/role', updateUserRole);

/**
 * @swagger
 * /users/{id}/deactivate:
 *   patch:
 *     summary: Deactivate a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deactivated
 */
// PATCH /api/users/:id/deactivate — Deactivate a user
router.patch('/:id/deactivate', deactivateUser);

module.exports = router;
