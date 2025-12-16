const prisma = require('../config/database');
const { ApiError, asyncHandler } = require('../middleware');

/**
 * @desc    Get all appointments (admin)
 * @route   GET /api/appointments
 * @access  Admin/Staff
 */
const getAllAppointments = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 50, 
    status, 
    date, 
    serviceId,
    appointmentType,
    search 
  } = req.query;
  
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {};
  
  if (status) where.status = status;
  if (serviceId) where.serviceId = serviceId;
  if (appointmentType) where.appointmentType = appointmentType;
  
  if (date) {
    const queryDate = new Date(date);
    const startOfDay = new Date(queryDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(queryDate);
    endOfDay.setHours(23, 59, 59, 999);
    where.date = {
      gte: startOfDay,
      lte: endOfDay,
    };
  }

  if (search) {
    where.OR = [
      { patientName: { contains: search, mode: 'insensitive' } },
      { patientRut: { contains: search, mode: 'insensitive' } },
      { patientPhone: { contains: search, mode: 'insensitive' } },
      { patientEmail: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [appointments, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        service: {
          select: {
            id: true,
            title: true,
            price: true,
            duration: true,
            resourceType: true,
          },
        },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
      skip,
      take: parseInt(limit),
    }),
    prisma.appointment.count({ where }),
  ]);

  res.json({
    success: true,
    data: appointments,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

/**
 * @desc    Get user appointments
 * @route   GET /api/appointments/mine
 * @access  Private
 */
const getMyAppointments = asyncHandler(async (req, res) => {
  const appointments = await prisma.appointment.findMany({
    where: { 
      OR: [
        { userId: req.user.id },
        { patientEmail: req.user.email },
      ]
    },
    include: {
      service: {
        select: {
          id: true,
          title: true,
          price: true,
          duration: true,
        },
      },
    },
    orderBy: [{ date: 'desc' }, { startTime: 'asc' }],
  });

  res.json({
    success: true,
    data: appointments,
  });
});

/**
 * @desc    Get single appointment
 * @route   GET /api/appointments/:id
 * @access  Admin/Staff
 */
const getAppointmentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
      service: true,
    },
  });

  if (!appointment) {
    throw new ApiError(404, 'Cita no encontrada.');
  }

  res.json({
    success: true,
    data: appointment,
  });
});

/**
 * @desc    Update appointment
 * @route   PUT /api/appointments/:id
 * @access  Admin/Staff
 */
const updateAppointment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const appointment = await prisma.appointment.findUnique({
    where: { id },
  });

  if (!appointment) {
    throw new ApiError(404, 'Cita no encontrada');
  }

  const updatedAppointment = await prisma.appointment.update({
    where: { id },
    data: updateData,
    include: {
      service: true,
    },
  });

  res.json({
    success: true,
    message: 'Cita actualizada exitosamente',
    data: updatedAppointment,
  });
});

/**
 * @desc    Update appointment status
 * @route   PUT /api/appointments/:id/status
 * @access  Admin/Staff
 */
const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];
  if (!validStatuses.includes(status)) {
    throw new ApiError(400, 'Estado inválido.');
  }

  const appointment = await prisma.appointment.findUnique({ where: { id } });
  if (!appointment) {
    throw new ApiError(404, 'Cita no encontrada.');
  }

  const updateData = { status };

  if (status === 'CONFIRMED' && !appointment.confirmedAt) {
    updateData.confirmedAt = new Date();
  }
  if (status === 'CANCELLED' && !appointment.cancelledAt) {
    updateData.cancelledAt = new Date();
    updateData.cancelReason = 'Cancelada por administrador';
  }

  const updated = await prisma.appointment.update({
    where: { id },
    data: updateData,
    include: {
      service: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  res.json({
    success: true,
    message: 'Estado de la cita actualizado.',
    data: updated,
  });
});

/**
 * @desc    Delete appointment
 * @route   DELETE /api/appointments/:id
 * @access  Admin
 */
const deleteAppointment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const appointment = await prisma.appointment.findUnique({
    where: { id },
  });

  if (!appointment) {
    throw new ApiError(404, 'Cita no encontrada');
  }

  await prisma.appointment.delete({
    where: { id },
  });

  res.json({
    success: true,
    message: 'Cita eliminada exitosamente',
  });
});

module.exports = {
  getAllAppointments,
  getMyAppointments,
  getAppointmentById,
  updateAppointment,
  updateAppointmentStatus,
  deleteAppointment,
};