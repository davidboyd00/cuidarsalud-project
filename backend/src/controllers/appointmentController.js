const prisma = require('../config/database');
const { ApiError, asyncHandler } = require('../middleware');
const config = require('../config');

/**
 * @desc    Get all appointments (admin)
 * @route   GET /api/appointments
 * @access  Admin/Staff
 */
const getAllAppointments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, date, serviceId } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = {};
  if (status) where.status = status;
  if (serviceId) where.serviceId = serviceId;
  if (date) {
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);
    where.date = {
      gte: startDate,
      lt: endDate,
    };
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
            priceType: true,
          },
        },
      },
      orderBy: [{ date: 'desc' }, { time: 'asc' }],
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
 * @route   GET /api/appointments/my
 * @access  Private
 */
const getMyAppointments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where = { userId: req.user.id };
  if (status) where.status = status;

  const [appointments, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      include: {
        service: {
          select: {
            id: true,
            title: true,
            price: true,
            priceType: true,
            icon: true,
          },
        },
      },
      orderBy: [{ date: 'desc' }, { time: 'asc' }],
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
 * @desc    Get single appointment
 * @route   GET /api/appointments/:id
 * @access  Private
 */
const getAppointment = asyncHandler(async (req, res) => {
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

  // Check access
  if (req.user.role === 'USER' && appointment.userId !== req.user.id) {
    throw new ApiError(403, 'No tiene permiso para ver esta cita.');
  }

  res.json({
    success: true,
    data: appointment,
  });
});

/**
 * @desc    Create appointment
 * @route   POST /api/appointments
 * @access  Private
 */
const createAppointment = asyncHandler(async (req, res) => {
  const { serviceId, date, time, address, notes } = req.body;

  // Verify service exists
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service || !service.isActive) {
    throw new ApiError(404, 'Servicio no encontrado o no disponible.');
  }

  // Check if slot is available (basic check)
  const existingAppointment = await prisma.appointment.findFirst({
    where: {
      date: new Date(date),
      time,
      status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] },
    },
  });

  if (existingAppointment) {
    throw new ApiError(409, 'Este horario ya no está disponible.');
  }

  const appointment = await prisma.appointment.create({
    data: {
      userId: req.user.id,
      serviceId,
      date: new Date(date),
      time,
      address,
      notes,
    },
    include: {
      service: {
        select: {
          id: true,
          title: true,
          price: true,
          priceType: true,
        },
      },
    },
  });

  res.status(201).json({
    success: true,
    message: 'Cita agendada exitosamente.',
    data: appointment,
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

  const validStatuses = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
  if (!validStatuses.includes(status)) {
    throw new ApiError(400, 'Estado inválido.');
  }

  const appointment = await prisma.appointment.findUnique({ where: { id } });
  if (!appointment) {
    throw new ApiError(404, 'Cita no encontrada.');
  }

  const updated = await prisma.appointment.update({
    where: { id },
    data: { status },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
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
 * @desc    Cancel appointment (user)
 * @route   PUT /api/appointments/:id/cancel
 * @access  Private
 */
const cancelAppointment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const appointment = await prisma.appointment.findUnique({ where: { id } });
  if (!appointment) {
    throw new ApiError(404, 'Cita no encontrada.');
  }

  // Check ownership
  if (req.user.role === 'USER' && appointment.userId !== req.user.id) {
    throw new ApiError(403, 'No tiene permiso para cancelar esta cita.');
  }

  // Check if can be cancelled
  if (['COMPLETED', 'CANCELLED'].includes(appointment.status)) {
    throw new ApiError(400, 'Esta cita no puede ser cancelada.');
  }

  const updated = await prisma.appointment.update({
    where: { id },
    data: { status: 'CANCELLED' },
  });

  res.json({
    success: true,
    message: 'Cita cancelada exitosamente.',
    data: updated,
  });
});

/**
 * @desc    Get available slots
 * @route   GET /api/appointments/slots
 * @access  Public
 */
const getAvailableSlots = asyncHandler(async (req, res) => {
  const { date, serviceId } = req.query;

  if (!date) {
    throw new ApiError(400, 'La fecha es requerida.');
  }

  const queryDate = new Date(date);
  const dayOfWeek = queryDate.getDay();

  // Define available hours (you can customize this)
  const allSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '14:00', '15:00', '16:00', '17:00', '18:00',
  ];

  // Weekend has fewer slots
  const availableHours = dayOfWeek === 0 
    ? ['10:00', '11:00', '12:00'] // Sunday
    : dayOfWeek === 6 
      ? ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00'] // Saturday
      : allSlots; // Weekdays

  // Get booked slots for this date
  const bookedAppointments = await prisma.appointment.findMany({
    where: {
      date: queryDate,
      status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] },
    },
    select: { time: true },
  });

  const bookedTimes = bookedAppointments.map((a) => a.time);

  const slots = availableHours.map((time) => ({
    time,
    available: !bookedTimes.includes(time),
  }));

  res.json({
    success: true,
    data: {
      date,
      slots,
    },
  });
});

/**
 * @desc    Get appointment stats (admin)
 * @route   GET /api/appointments/stats
 * @access  Admin
 */
const getAppointmentStats = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalAppointments,
    pendingAppointments,
    completedAppointments,
    todayAppointments,
    thisMonthAppointments,
  ] = await Promise.all([
    prisma.appointment.count(),
    prisma.appointment.count({ where: { status: 'PENDING' } }),
    prisma.appointment.count({ where: { status: 'COMPLETED' } }),
    prisma.appointment.count({
      where: {
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    }),
    prisma.appointment.count({
      where: {
        date: {
          gte: new Date(today.getFullYear(), today.getMonth(), 1),
        },
      },
    }),
  ]);

  res.json({
    success: true,
    data: {
      total: totalAppointments,
      pending: pendingAppointments,
      completed: completedAppointments,
      today: todayAppointments,
      thisMonth: thisMonthAppointments,
    },
  });
});

module.exports = {
  getAllAppointments,
  getMyAppointments,
  getAppointment,
  createAppointment,
  updateAppointmentStatus,
  cancelAppointment,
  getAvailableSlots,
  getAppointmentStats,
};
