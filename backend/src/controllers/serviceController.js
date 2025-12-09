const prisma = require('../config/database');
const { ApiError, asyncHandler } = require('../middleware');

/**
 * Generate slug from title
 */
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

/**
 * @desc    Get all services (public)
 * @route   GET /api/services
 * @access  Public
 */
const getServices = asyncHandler(async (req, res) => {
  const { active } = req.query;

  const where = {};
  if (active === 'true') {
    where.isActive = true;
  }

  const services = await prisma.service.findMany({
    where,
    orderBy: { order: 'asc' },
  });

  res.json({
    success: true,
    data: services,
    count: services.length,
  });
});

/**
 * @desc    Get single service
 * @route   GET /api/services/:id
 * @access  Public
 */
const getService = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const service = await prisma.service.findFirst({
    where: {
      OR: [{ id }, { slug: id }],
    },
  });

  if (!service) {
    throw new ApiError(404, 'Servicio no encontrado.');
  }

  res.json({
    success: true,
    data: service,
  });
});

/**
 * @desc    Create service
 * @route   POST /api/services
 * @access  Admin
 */
const createService = asyncHandler(async (req, res) => {
  const { title, description, shortDescription, icon, price, priceType, duration, isActive, order } = req.body;

  // Generate slug
  let slug = generateSlug(title);
  
  // Check if slug exists and append number if needed
  const existingService = await prisma.service.findUnique({ where: { slug } });
  if (existingService) {
    slug = `${slug}-${Date.now()}`;
  }

  const service = await prisma.service.create({
    data: {
      title,
      slug,
      description,
      shortDescription,
      icon,
      price,
      priceType: priceType || 'FIXED',
      duration,
      isActive: isActive !== false,
      order: order || 0,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Servicio creado exitosamente.',
    data: service,
  });
});

/**
 * @desc    Update service
 * @route   PUT /api/services/:id
 * @access  Admin
 */
const updateService = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, shortDescription, icon, price, priceType, duration, isActive, order } = req.body;

  // Check if service exists
  const existingService = await prisma.service.findUnique({ where: { id } });
  if (!existingService) {
    throw new ApiError(404, 'Servicio no encontrado.');
  }

  // Update slug if title changed
  let slug = existingService.slug;
  if (title && title !== existingService.title) {
    slug = generateSlug(title);
    const slugExists = await prisma.service.findFirst({
      where: { slug, NOT: { id } },
    });
    if (slugExists) {
      slug = `${slug}-${Date.now()}`;
    }
  }

  const service = await prisma.service.update({
    where: { id },
    data: {
      title,
      slug,
      description,
      shortDescription,
      icon,
      price,
      priceType,
      duration,
      isActive,
      order,
    },
  });

  res.json({
    success: true,
    message: 'Servicio actualizado exitosamente.',
    data: service,
  });
});

/**
 * @desc    Delete service
 * @route   DELETE /api/services/:id
 * @access  Admin
 */
const deleteService = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) {
    throw new ApiError(404, 'Servicio no encontrado.');
  }

  await prisma.service.delete({ where: { id } });

  res.json({
    success: true,
    message: 'Servicio eliminado exitosamente.',
  });
});

/**
 * @desc    Reorder services
 * @route   PUT /api/services/reorder
 * @access  Admin
 */
const reorderServices = asyncHandler(async (req, res) => {
  const { orders } = req.body; // Array of { id, order }

  if (!Array.isArray(orders)) {
    throw new ApiError(400, 'Se requiere un array de órdenes.');
  }

  // Update all services in a transaction
  await prisma.$transaction(
    orders.map(({ id, order }) =>
      prisma.service.update({
        where: { id },
        data: { order },
      })
    )
  );

  res.json({
    success: true,
    message: 'Orden de servicios actualizado.',
  });
});

module.exports = {
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
  reorderServices,
};
