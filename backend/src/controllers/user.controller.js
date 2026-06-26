const { param, body, validationResult } = require('express-validator');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { paginate } = require('../utils/pagination');

/**
 * GET /api/users/staff
 * List all staff and admin accounts.
 */
const listStaff = async (req, res, next) => {
  try {
    const { skip, limit, buildMeta } = paginate(req.query);

    const filter = { role: { $in: ['staff', 'admin'] } };

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-__v')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    return successResponse(res, users, 200, buildMeta(total));
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/users/:id/role
 * Admin-only: change a user's role and permissions.
 */
const updateUserRole = [
  param('id').isMongoId().withMessage('Invalid user ID'),
  body('role')
    .optional()
    .isIn(['customer', 'staff', 'admin'])
    .withMessage('Role must be customer, staff, or admin'),
  body('permissions').optional().isObject().withMessage('Permissions must be an object'),

  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 'Validation failed.', 400, errors.array());
      }

      const { id } = req.params;
      const { role, permissions } = req.body;

      // Cannot modify own role
      if (id === req.user._id.toString()) {
        return errorResponse(res, 'Cannot modify your own role.', 400);
      }

      const user = await User.findById(id);
      if (!user) {
        return errorResponse(res, 'User not found.', 404);
      }

      if (role) user.role = role;
      if (permissions) {
        if (typeof permissions.canViewCostPrice === 'boolean')
          user.permissions.canViewCostPrice = permissions.canViewCostPrice;
        if (typeof permissions.canEditPrice === 'boolean')
          user.permissions.canEditPrice = permissions.canEditPrice;
        if (typeof permissions.canViewReports === 'boolean')
          user.permissions.canViewReports = permissions.canViewReports;
        if (typeof permissions.canManageStaff === 'boolean')
          user.permissions.canManageStaff = permissions.canManageStaff;
      }

      await user.save();

      return successResponse(res, user);
    } catch (error) {
      next(error);
    }
  },
];

/**
 * PATCH /api/users/:id/deactivate
 * Admin-only: deactivate a user account.
 */
const deactivateUser = [
  param('id').isMongoId().withMessage('Invalid user ID'),

  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 'Validation failed.', 400, errors.array());
      }

      const { id } = req.params;

      if (id === req.user._id.toString()) {
        return errorResponse(res, 'Cannot deactivate your own account.', 400);
      }

      const user = await User.findById(id);
      if (!user) {
        return errorResponse(res, 'User not found.', 404);
      }

      user.isActive = false;
      await user.save();

      return successResponse(res, { message: 'User deactivated successfully.' });
    } catch (error) {
      next(error);
    }
  },
];

/**
 * GET /api/users
 * List all users.
 */
const listUsers = async (req, res, next) => {
  try {
    const { skip, limit, buildMeta } = paginate(req.query);
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    
    const [users, total] = await Promise.all([
      User.find(filter).select('-password -__v').sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);
    return successResponse(res, users, 200, buildMeta(total));
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/users
 * Create a user (admin override).
 */
const createUser = [
  body('name').notEmpty().trim().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('role').isIn(['customer', 'staff', 'admin']).withMessage('Role must be customer, staff, or admin'),
  
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return errorResponse(res, 'Validation failed.', 400, errors.array());

      const { name, email, phone, role } = req.body;
      const existingUser = await User.findOne({ email });
      if (existingUser) return errorResponse(res, 'User with this email already exists.', 400);

      // Create a dummy password for manually created users
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      const user = await User.create({ name, email, phone, role, password: hashedPassword });
      const userObj = user.toObject();
      delete userObj.password;
      return successResponse(res, userObj, 201);
    } catch (error) {
      next(error);
    }
  }
];

/**
 * PATCH /api/users/:id
 * Update a user.
 */
const updateUser = [
  param('id').isMongoId().withMessage('Invalid user ID'),
  
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return errorResponse(res, 'Validation failed.', 400, errors.array());

      const { name, email, phone, role } = req.body;
      const user = await User.findById(req.params.id);
      if (!user) return errorResponse(res, 'User not found.', 404);

      if (name) user.name = name;
      if (email) user.email = email;
      if (phone) user.phone = phone;
      if (role && req.user.role === 'admin') user.role = role;

      await user.save();
      const userObj = user.toObject();
      delete userObj.password;
      
      return successResponse(res, userObj);
    } catch (error) {
      next(error);
    }
  }
];

/**
 * DELETE /api/users/:id
 * Delete a user.
 */
const deleteUser = [
  param('id').isMongoId().withMessage('Invalid user ID'),
  
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return errorResponse(res, 'Validation failed.', 400, errors.array());

      if (req.params.id === req.user._id.toString()) {
        return errorResponse(res, 'Cannot delete your own account.', 400);
      }

      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) return errorResponse(res, 'User not found.', 404);

      return successResponse(res, { message: 'User deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
];

/**
 * POST /api/staff
 * Create a staff member.
 */
const createStaff = [
  body('name').notEmpty().trim().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('role').isIn(['staff', 'admin']).withMessage('Role must be staff or admin'),
  
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return errorResponse(res, 'Validation failed.', 400, errors.array());

      const { name, email, role } = req.body;
      const existingUser = await User.findOne({ email });
      if (existingUser) return errorResponse(res, 'User with this email already exists.', 400);

      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      const user = await User.create({ name, email, role, password: hashedPassword });
      const userObj = user.toObject();
      delete userObj.password;
      return successResponse(res, userObj, 201);
    } catch (error) {
      next(error);
    }
  }
];

/**
 * PATCH /api/staff/:id/permissions
 * Update staff permissions.
 */
const updateStaffPermissions = [
  param('id').isMongoId().withMessage('Invalid staff ID'),
  body('permissions').isObject().withMessage('Permissions must be an object'),
  
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return errorResponse(res, 'Validation failed.', 400, errors.array());

      const user = await User.findById(req.params.id);
      if (!user) return errorResponse(res, 'User not found.', 404);
      
      const { permissions } = req.body;
      if (typeof permissions.canViewCostPrice === 'boolean') user.permissions.canViewCostPrice = permissions.canViewCostPrice;
      if (typeof permissions.canEditPrice === 'boolean') user.permissions.canEditPrice = permissions.canEditPrice;
      if (typeof permissions.canViewReports === 'boolean') user.permissions.canViewReports = permissions.canViewReports;
      if (typeof permissions.canManageStaff === 'boolean') user.permissions.canManageStaff = permissions.canManageStaff;

      await user.save();
      return successResponse(res, user);
    } catch (error) {
      next(error);
    }
  }
];

module.exports = { 
  listStaff, 
  updateUserRole, 
  deactivateUser,
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  createStaff,
  updateStaffPermissions
};
