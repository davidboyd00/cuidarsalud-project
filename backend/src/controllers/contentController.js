const prisma = require('../config/database');
const { ApiError, asyncHandler } = require('../middleware');

// ==================== SITE CONTENT ====================

/**
 * @desc    Get all site content
 * @route   GET /api/content
 * @access  Public
 */
const getAllContent = asyncHandler(async (req, res) => {
  const { section } = req.query;

  const where = { isActive: true };
  if (section) where.section = section;

  const content = await prisma.siteContent.findMany({
    where,
    orderBy: { order: 'asc' },
  });

  // Transform to key-value format for easier frontend use
  const contentMap = {};
  content.forEach((item) => {
    contentMap[item.key] = item.content;
  });

  res.json({
    success: true,
    data: contentMap,
  });
});

/**
 * @desc    Get single content by key
 * @route   GET /api/content/:key
 * @access  Public
 */
const getContent = asyncHandler(async (req, res) => {
  const { key } = req.params;

  const content = await prisma.siteContent.findUnique({
    where: { key },
  });

  if (!content) {
    throw new ApiError(404, 'Contenido no encontrado.');
  }

  res.json({
    success: true,
    data: content,
  });
});

/**
 * @desc    Create or update site content
 * @route   PUT /api/content/:key
 * @access  Admin
 */
const upsertContent = asyncHandler(async (req, res) => {
  const { key } = req.params;
  const { section, title, content, order, isActive } = req.body;

  const updated = await prisma.siteContent.upsert({
    where: { key },
    update: {
      section,
      title,
      content,
      order,
      isActive,
    },
    create: {
      key,
      section: section || 'general',
      title,
      content,
      order: order || 0,
      isActive: isActive !== false,
    },
  });

  res.json({
    success: true,
    message: 'Contenido actualizado exitosamente.',
    data: updated,
  });
});

/**
 * @desc    Delete site content
 * @route   DELETE /api/content/:key
 * @access  Admin
 */
const deleteContent = asyncHandler(async (req, res) => {
  const { key } = req.params;

  const content = await prisma.siteContent.findUnique({ where: { key } });
  if (!content) {
    throw new ApiError(404, 'Contenido no encontrado.');
  }

  await prisma.siteContent.delete({ where: { key } });

  res.json({
    success: true,
    message: 'Contenido eliminado exitosamente.',
  });
});

// ==================== SETTINGS ====================

/**
 * @desc    Get all settings
 * @route   GET /api/settings
 * @access  Public
 */
const getAllSettings = asyncHandler(async (req, res) => {
  const settings = await prisma.setting.findMany();

  // Transform to key-value format
  const settingsMap = {};
  settings.forEach((item) => {
    settingsMap[item.key] = item.value;
  });

  res.json({
    success: true,
    data: settingsMap,
  });
});

/**
 * @desc    Get single setting
 * @route   GET /api/settings/:key
 * @access  Public
 */
const getSetting = asyncHandler(async (req, res) => {
  const { key } = req.params;

  const setting = await prisma.setting.findUnique({ where: { key } });

  if (!setting) {
    throw new ApiError(404, 'Configuración no encontrada.');
  }

  res.json({
    success: true,
    data: setting,
  });
});

/**
 * @desc    Update setting
 * @route   PUT /api/settings/:key
 * @access  Admin
 */
const updateSetting = asyncHandler(async (req, res) => {
  const { key } = req.params;
  const { value, description } = req.body;

  const setting = await prisma.setting.upsert({
    where: { key },
    update: { value, description },
    create: { key, value, description },
  });

  res.json({
    success: true,
    message: 'Configuración actualizada.',
    data: setting,
  });
});

// ==================== TEAM MEMBERS ====================

/**
 * @desc    Get all team members
 * @route   GET /api/team
 * @access  Public
 */
const getTeamMembers = asyncHandler(async (req, res) => {
  const { active } = req.query;

  const where = {};
  if (active === 'true') where.isActive = true;

  const members = await prisma.teamMember.findMany({
    where,
    orderBy: { order: 'asc' },
  });

  res.json({
    success: true,
    data: members,
  });
});

/**
 * @desc    Get single team member
 * @route   GET /api/team/:id
 * @access  Public
 */
const getTeamMember = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const member = await prisma.teamMember.findUnique({ where: { id } });

  if (!member) {
    throw new ApiError(404, 'Miembro no encontrado.');
  }

  res.json({
    success: true,
    data: member,
  });
});

/**
 * @desc    Create team member
 * @route   POST /api/team
 * @access  Admin
 */
const createTeamMember = asyncHandler(async (req, res) => {
  const { name, position, bio, image, email, phone, specialties, isActive, order } = req.body;

  const member = await prisma.teamMember.create({
    data: {
      name,
      position,
      bio,
      image,
      email,
      phone,
      specialties: specialties || [],
      isActive: isActive !== false,
      order: order || 0,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Miembro del equipo creado.',
    data: member,
  });
});

/**
 * @desc    Update team member
 * @route   PUT /api/team/:id
 * @access  Admin
 */
const updateTeamMember = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, position, bio, image, email, phone, specialties, isActive, order } = req.body;

  const existing = await prisma.teamMember.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, 'Miembro no encontrado.');
  }

  const member = await prisma.teamMember.update({
    where: { id },
    data: {
      name,
      position,
      bio,
      image,
      email,
      phone,
      specialties,
      isActive,
      order,
    },
  });

  res.json({
    success: true,
    message: 'Miembro actualizado.',
    data: member,
  });
});

/**
 * @desc    Delete team member
 * @route   DELETE /api/team/:id
 * @access  Admin
 */
const deleteTeamMember = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const member = await prisma.teamMember.findUnique({ where: { id } });
  if (!member) {
    throw new ApiError(404, 'Miembro no encontrado.');
  }

  await prisma.teamMember.delete({ where: { id } });

  res.json({
    success: true,
    message: 'Miembro eliminado.',
  });
});

// ==================== REVIEWS ====================

/**
 * @desc    Get approved reviews (public)
 * @route   GET /api/reviews
 * @access  Public
 */
const getReviews = asyncHandler(async (req, res) => {
  const { featured } = req.query;

  const where = { isApproved: true };
  if (featured === 'true') where.isFeatured = true;

  const reviews = await prisma.review.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  res.json({
    success: true,
    data: reviews,
  });
});

/**
 * @desc    Get all reviews (admin)
 * @route   GET /api/reviews/all
 * @access  Admin
 */
const getAllReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, approved } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {};
  if (approved !== undefined) where.isApproved = approved === 'true';

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit),
    }),
    prisma.review.count({ where }),
  ]);

  res.json({
    success: true,
    data: reviews,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

/**
 * @desc    Create review
 * @route   POST /api/reviews
 * @access  Public/Private
 */
const createReview = asyncHandler(async (req, res) => {
  const { name, role, content, rating } = req.body;

  const review = await prisma.review.create({
    data: {
      userId: req.user?.id || null,
      name,
      role,
      content,
      rating,
      isApproved: false, // Requires admin approval
    },
  });

  res.status(201).json({
    success: true,
    message: 'Gracias por tu opinión. Será revisada antes de publicarse.',
    data: review,
  });
});

/**
 * @desc    Update review (admin)
 * @route   PUT /api/reviews/:id
 * @access  Admin
 */
const updateReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isApproved, isFeatured } = req.body;

  const existing = await prisma.review.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(404, 'Reseña no encontrada.');
  }

  const review = await prisma.review.update({
    where: { id },
    data: { isApproved, isFeatured },
  });

  res.json({
    success: true,
    message: 'Reseña actualizada.',
    data: review,
  });
});

/**
 * @desc    Delete review
 * @route   DELETE /api/reviews/:id
 * @access  Admin
 */
const deleteReview = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) {
    throw new ApiError(404, 'Reseña no encontrada.');
  }

  await prisma.review.delete({ where: { id } });

  res.json({
    success: true,
    message: 'Reseña eliminada.',
  });
});

// ==================== CONTACT MESSAGES ====================

/**
 * @desc    Create contact message
 * @route   POST /api/contact
 * @access  Public
 */
const createContactMessage = asyncHandler(async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  const contactMessage = await prisma.contactMessage.create({
    data: { name, email, phone, subject, message },
  });

  res.status(201).json({
    success: true,
    message: 'Mensaje enviado. Nos pondremos en contacto pronto.',
    data: { id: contactMessage.id },
  });
});

/**
 * @desc    Get all contact messages (admin)
 * @route   GET /api/contact
 * @access  Admin
 */
const getContactMessages = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, unread } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {};
  if (unread === 'true') where.isRead = false;

  const [messages, total] = await Promise.all([
    prisma.contactMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit),
    }),
    prisma.contactMessage.count({ where }),
  ]);

  res.json({
    success: true,
    data: messages,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

/**
 * @desc    Mark message as read
 * @route   PUT /api/contact/:id/read
 * @access  Admin
 */
const markMessageAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const message = await prisma.contactMessage.update({
    where: { id },
    data: { isRead: true },
  });

  res.json({
    success: true,
    data: message,
  });
});

/**
 * @desc    Delete contact message
 * @route   DELETE /api/contact/:id
 * @access  Admin
 */
const deleteContactMessage = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await prisma.contactMessage.delete({ where: { id } });

  res.json({
    success: true,
    message: 'Mensaje eliminado.',
  });
});

module.exports = {
  // Content
  getAllContent,
  getContent,
  upsertContent,
  deleteContent,
  // Settings
  getAllSettings,
  getSetting,
  updateSetting,
  // Team
  getTeamMembers,
  getTeamMember,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  // Reviews
  getReviews,
  getAllReviews,
  createReview,
  updateReview,
  deleteReview,
  // Contact
  createContactMessage,
  getContactMessages,
  markMessageAsRead,
  deleteContactMessage,
};
