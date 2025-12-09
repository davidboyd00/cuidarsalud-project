const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const { ApiError, asyncHandler } = require('../middleware');

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Admin
 */
const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, role, search } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {};
  if (role) where.role = role;
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: { appointments: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit),
    }),
    prisma.user.count({ where }),
  ]);

  res.json({
    success: true,
    data: users,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

/**
 * @desc    Get single user
 * @route   GET /api/users/:id
 * @access  Admin
 */
const getUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      isActive: true,
      avatar: true,
      createdAt: true,
      updatedAt: true,
      appointments: {
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          service: {
            select: { title: true },
          },
        },
      },
      _count: {
        select: { appointments: true, reviews: true },
      },
    },
  });

  if (!user) {
    throw new ApiError(404, 'Usuario no encontrado.');
  }

  res.json({
    success: true,
    data: user,
  });
});

/**
 * @desc    Create user (admin)
 * @route   POST /api/users
 * @access  Admin
 */
const createUser = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName, phone, role } = req.body;

  // Check if email exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new ApiError(409, 'Ya existe un usuario con este email.');
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      role: role || 'USER',
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Usuario creado exitosamente.',
    data: user,
  });
});

/**
 * @desc    Update user
 * @route   PUT /api/users/:id
 * @access  Admin
 */
const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, phone, role, isActive } = req.body;

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, 'Usuario no encontrado.');
  }

  // Prevent self-demotion
  if (req.user.id === id && role && role !== existing.role) {
    throw new ApiError(400, 'No puede cambiar su propio rol.');
  }

  const user = await prisma.user.update({
    where: { id },
    data: { firstName, lastName, phone, role, isActive },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      role: true,
      isActive: true,
      updatedAt: true,
    },
  });

  res.json({
    success: true,
    message: 'Usuario actualizado.',
    data: user,
  });
});

/**
 * @desc    Reset user password
 * @route   PUT /api/users/:id/reset-password
 * @access  Admin
 */
const resetUserPassword = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new ApiError(404, 'Usuario no encontrado.');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id },
    data: { password: hashedPassword },
  });

  res.json({
    success: true,
    message: 'Contraseña restablecida exitosamente.',
  });
});

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Admin
 */
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Prevent self-deletion
  if (req.user.id === id) {
    throw new ApiError(400, 'No puede eliminar su propia cuenta.');
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new ApiError(404, 'Usuario no encontrado.');
  }

  await prisma.user.delete({ where: { id } });

  res.json({
    success: true,
    message: 'Usuario eliminado.',
  });
});

/**
 * @desc    Get user stats
 * @route   GET /api/users/stats
 * @access  Admin
 */
const getUserStats = asyncHandler(async (req, res) => {
  const [totalUsers, activeUsers, adminUsers, staffUsers] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.user.count({ where: { role: 'ADMIN' } }),
    prisma.user.count({ where: { role: 'STAFF' } }),
  ]);

  // New users this month
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);

  const newUsersThisMonth = await prisma.user.count({
    where: { createdAt: { gte: thisMonth } },
  });

  res.json({
    success: true,
    data: {
      total: totalUsers,
      active: activeUsers,
      admins: adminUsers,
      staff: staffUsers,
      newThisMonth: newUsersThisMonth,
    },
  });
});

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  resetUserPassword,
  deleteUser,
  getUserStats,
};
