const prisma = require('../config/database');
const { ApiError, asyncHandler } = require('../middleware');
const { v4: uuidv4 } = require('uuid');

// ==================== HELPERS ====================

/**
 * Validar RUT chileno
 */
const validateRut = (rut) => {
  if (!rut || typeof rut !== 'string') return false;
  
  // Limpiar RUT
  const cleanRut = rut.replace(/[.-]/g, '').toUpperCase();
  
  if (cleanRut.length < 8 || cleanRut.length > 9) return false;
  
  const body = cleanRut.slice(0, -1);
  const verifier = cleanRut.slice(-1);
  
  // Calcular dígito verificador
  let sum = 0;
  let multiplier = 2;
  
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  
  const expectedVerifier = 11 - (sum % 11);
  let calculatedVerifier;
  
  if (expectedVerifier === 11) calculatedVerifier = '0';
  else if (expectedVerifier === 10) calculatedVerifier = 'K';
  else calculatedVerifier = expectedVerifier.toString();
  
  return verifier === calculatedVerifier;
};

/**
 * Formatear RUT
 */
const formatRut = (rut) => {
  const cleanRut = rut.replace(/[.-]/g, '').toUpperCase();
  const body = cleanRut.slice(0, -1);
  const verifier = cleanRut.slice(-1);
  
  // Formatear con puntos y guión
  const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formattedBody}-${verifier}`;
};

/**
 * Generar slots disponibles para una fecha
 */
const generateSlotsForDate = async (date, serviceId = null) => {
  const queryDate = new Date(date);
  const dayOfWeek = queryDate.getDay();
  
  // Obtener configuración de slots para este día
  const slotConfigs = await prisma.availableSlot.findMany({
    where: {
      dayOfWeek,
      isActive: true,
      OR: [
        { serviceId: null },
        { serviceId: serviceId },
      ],
    },
  });
  
  if (slotConfigs.length === 0) {
    // Si no hay configuración, usar horarios por defecto
    const defaultSlots = dayOfWeek === 0 
      ? [] // Domingo cerrado
      : dayOfWeek === 6 
        ? [{ startTime: '09:00', endTime: '14:00', slotDuration: 60 }] // Sábado
        : [{ startTime: '08:00', endTime: '18:00', slotDuration: 60 }]; // Lun-Vie
    
    slotConfigs.push(...defaultSlots.map(s => ({ ...s, maxBookings: 1 })));
  }
  
  // Verificar si la fecha está bloqueada
  const blockedDate = await prisma.blockedDate.findFirst({
    where: {
      date: {
        gte: new Date(queryDate.setHours(0, 0, 0, 0)),
        lt: new Date(queryDate.setHours(23, 59, 59, 999)),
      },
    },
  });
  
  if (blockedDate?.isFullDay) {
    return [];
  }
  
  // Generar slots
  const slots = [];
  
  for (const config of slotConfigs) {
    const [startHour, startMin] = config.startTime.split(':').map(Number);
    const [endHour, endMin] = config.endTime.split(':').map(Number);
    const duration = config.slotDuration || 60;
    
    let currentTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;
    
    while (currentTime + duration <= endTime) {
      const hour = Math.floor(currentTime / 60);
      const min = currentTime % 60;
      const slotStart = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
      
      const slotEndMin = currentTime + duration;
      const slotEndHour = Math.floor(slotEndMin / 60);
      const slotEndMinute = slotEndMin % 60;
      const slotEnd = `${slotEndHour.toString().padStart(2, '0')}:${slotEndMinute.toString().padStart(2, '0')}`;
      
      // Verificar si está bloqueado parcialmente
      const isBlocked = blockedDate && !blockedDate.isFullDay &&
        blockedDate.startTime <= slotStart && blockedDate.endTime >= slotEnd;
      
      if (!isBlocked) {
        slots.push({
          startTime: slotStart,
          endTime: slotEnd,
          maxBookings: config.maxBookings || 1,
        });
      }
      
      currentTime += duration;
    }
  }
  
  return slots;
};

// ==================== CONTROLLERS ====================

/**
 * @desc    Obtener slots disponibles para una fecha
 * @route   GET /api/booking/slots
 * @access  Public
 */
const getAvailableSlots = asyncHandler(async (req, res) => {
  const { date, serviceId } = req.query;
  
  if (!date) {
    throw new ApiError(400, 'La fecha es requerida');
  }
  
  const queryDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // No permitir fechas pasadas
  if (queryDate < today) {
    return res.json({
      success: true,
      data: {
        date,
        slots: [],
        message: 'No se pueden agendar citas en fechas pasadas',
      },
    });
  }
  
  // Generar todos los slots posibles para esta fecha
  const allSlots = await generateSlotsForDate(date, serviceId);
  
  // Obtener citas existentes para esta fecha
  const startOfDay = new Date(queryDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(queryDate);
  endOfDay.setHours(23, 59, 59, 999);
  
  const existingAppointments = await prisma.appointment.findMany({
    where: {
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
      status: {
        in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'],
      },
      ...(serviceId && { serviceId }),
    },
    select: {
      startTime: true,
      endTime: true,
    },
  });
  
  // Marcar disponibilidad de cada slot
  const slotsWithAvailability = allSlots.map((slot) => {
    const bookingsInSlot = existingAppointments.filter(
      (apt) => apt.startTime === slot.startTime
    ).length;
    
    return {
      ...slot,
      available: bookingsInSlot < slot.maxBookings,
      bookingsCount: bookingsInSlot,
    };
  });
  
  // Si es hoy, filtrar slots que ya pasaron
  if (queryDate.toDateString() === new Date().toDateString()) {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    slotsWithAvailability.forEach((slot) => {
      if (slot.startTime <= currentTime) {
        slot.available = false;
      }
    });
  }
  
  res.json({
    success: true,
    data: {
      date,
      serviceId,
      slots: slotsWithAvailability,
    },
  });
});

/**
 * @desc    Obtener fechas con disponibilidad (para el calendario)
 * @route   GET /api/booking/calendar
 * @access  Public
 */
const getCalendarAvailability = asyncHandler(async (req, res) => {
  const { month, year, serviceId } = req.query;
  
  const queryMonth = parseInt(month) || new Date().getMonth() + 1;
  const queryYear = parseInt(year) || new Date().getFullYear();
  
  // Obtener primer y último día del mes
  const startDate = new Date(queryYear, queryMonth - 1, 1);
  const endDate = new Date(queryYear, queryMonth, 0);
  
  // Obtener fechas bloqueadas
  const blockedDates = await prisma.blockedDate.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
      isFullDay: true,
    },
    select: {
      date: true,
    },
  });
  
  const blockedDateStrings = blockedDates.map(
    (b) => b.date.toISOString().split('T')[0]
  );
  
  // Generar array con disponibilidad por día
  const days = [];
  const currentDate = new Date(startDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  while (currentDate <= endDate) {
    const dateString = currentDate.toISOString().split('T')[0];
    const dayOfWeek = currentDate.getDay();
    
    let available = true;
    let reason = null;
    
    // Verificar si es fecha pasada
    if (currentDate < today) {
      available = false;
      reason = 'past';
    }
    // Verificar si está bloqueada
    else if (blockedDateStrings.includes(dateString)) {
      available = false;
      reason = 'blocked';
    }
    // Verificar si es domingo (cerrado por defecto)
    else if (dayOfWeek === 0) {
      available = false;
      reason = 'closed';
    }
    
    days.push({
      date: dateString,
      dayOfWeek,
      available,
      reason,
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  res.json({
    success: true,
    data: {
      month: queryMonth,
      year: queryYear,
      days,
    },
  });
});

/**
 * @desc    Crear cita pública (sin login)
 * @route   POST /api/booking
 * @access  Public
 */
const createPublicBooking = asyncHandler(async (req, res) => {
  const { 
    serviceId, 
    date, 
    startTime, 
    patientName, 
    patientRut, 
    patientEmail, 
    patientPhone,
    notes,
    address,
  } = req.body;
  
  // Validaciones
  if (!serviceId || !date || !startTime || !patientName || !patientRut || !patientEmail) {
    throw new ApiError(400, 'Todos los campos obligatorios deben ser completados');
  }
  
  // Validar RUT
  if (!validateRut(patientRut)) {
    throw new ApiError(400, 'El RUT ingresado no es válido');
  }
  
  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(patientEmail)) {
    throw new ApiError(400, 'El correo electrónico no es válido');
  }
  
  // Verificar que el servicio existe y está activo
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
  });
  
  if (!service || !service.isActive) {
    throw new ApiError(404, 'El servicio seleccionado no está disponible');
  }
  
  // Verificar disponibilidad del slot
  const queryDate = new Date(date);
  const startOfDay = new Date(queryDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(queryDate);
  endOfDay.setHours(23, 59, 59, 999);
  
  const existingAppointment = await prisma.appointment.findFirst({
    where: {
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
      startTime,
      status: {
        in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'],
      },
    },
  });
  
  if (existingAppointment) {
    throw new ApiError(409, 'Este horario ya no está disponible. Por favor, selecciona otro.');
  }
  
  // Verificar que no tenga otra cita el mismo día con el mismo RUT
  const existingPatientAppointment = await prisma.appointment.findFirst({
    where: {
      patientRut: formatRut(patientRut),
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
      status: {
        in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'],
      },
    },
  });
  
  if (existingPatientAppointment) {
    throw new ApiError(409, 'Ya tienes una cita agendada para este día');
  }
  
  // Calcular hora de término
  const duration = service.duration || 60;
  const [startHour, startMin] = startTime.split(':').map(Number);
  const endMinutes = startHour * 60 + startMin + duration;
  const endHour = Math.floor(endMinutes / 60);
  const endMin = endMinutes % 60;
  const endTime = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;
  
  // Crear la cita
  const appointment = await prisma.appointment.create({
    data: {
      serviceId,
      date: startOfDay,
      startTime,
      endTime,
      patientName: patientName.trim(),
      patientRut: formatRut(patientRut),
      patientEmail: patientEmail.toLowerCase().trim(),
      patientPhone: patientPhone?.trim() || null,
      notes: notes?.trim() || null,
      address: address?.trim() || null,
      status: 'PENDING',
      cancelToken: uuidv4(),
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
  });
  
  // TODO: Enviar email de confirmación
  // await sendConfirmationEmail(appointment);
  
  res.status(201).json({
    success: true,
    message: 'Cita agendada exitosamente. Recibirás un correo de confirmación.',
    data: {
      id: appointment.id,
      service: appointment.service.title,
      date: appointment.date,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      patientName: appointment.patientName,
      patientEmail: appointment.patientEmail,
      status: appointment.status,
      cancelToken: appointment.cancelToken,
      // URL para cancelar
      cancelUrl: `/cancelar-cita/${appointment.cancelToken}`,
    },
  });
});

/**
 * @desc    Obtener cita por token de cancelación
 * @route   GET /api/booking/cancel/:token
 * @access  Public
 */
const getBookingByToken = asyncHandler(async (req, res) => {
  const { token } = req.params;
  
  const appointment = await prisma.appointment.findUnique({
    where: { cancelToken: token },
    include: {
      service: {
        select: {
          id: true,
          title: true,
          price: true,
        },
      },
    },
  });
  
  if (!appointment) {
    throw new ApiError(404, 'Cita no encontrada');
  }
  
  res.json({
    success: true,
    data: {
      id: appointment.id,
      service: appointment.service.title,
      date: appointment.date,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      patientName: appointment.patientName,
      status: appointment.status,
      canCancel: ['PENDING', 'CONFIRMED'].includes(appointment.status),
    },
  });
});

/**
 * @desc    Cancelar cita por token
 * @route   POST /api/booking/cancel/:token
 * @access  Public
 */
const cancelBookingByToken = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { reason } = req.body;
  
  const appointment = await prisma.appointment.findUnique({
    where: { cancelToken: token },
    include: {
      service: true,
    },
  });
  
  if (!appointment) {
    throw new ApiError(404, 'Cita no encontrada');
  }
  
  if (!['PENDING', 'CONFIRMED'].includes(appointment.status)) {
    throw new ApiError(400, 'Esta cita no puede ser cancelada');
  }
  
  // Verificar que no sea muy tarde para cancelar (ej: mínimo 2 horas antes)
  const appointmentDateTime = new Date(appointment.date);
  const [hours, minutes] = appointment.startTime.split(':').map(Number);
  appointmentDateTime.setHours(hours, minutes, 0, 0);
  
  const now = new Date();
  const hoursUntilAppointment = (appointmentDateTime - now) / (1000 * 60 * 60);
  
  if (hoursUntilAppointment < 2) {
    throw new ApiError(400, 'No es posible cancelar con menos de 2 horas de anticipación. Por favor, contáctanos directamente.');
  }
  
  // Cancelar la cita
  const updatedAppointment = await prisma.appointment.update({
    where: { cancelToken: token },
    data: {
      status: 'CANCELLED',
      cancelledAt: new Date(),
      cancelReason: reason?.trim() || 'Cancelada por el paciente',
    },
  });
  
  // TODO: Enviar email de confirmación de cancelación
  // await sendCancellationEmail(updatedAppointment);
  
  res.json({
    success: true,
    message: 'Tu cita ha sido cancelada exitosamente',
    data: {
      id: updatedAppointment.id,
      status: updatedAppointment.status,
    },
  });
});

/**
 * @desc    Buscar citas por RUT o email
 * @route   GET /api/booking/search
 * @access  Public
 */
const searchBookings = asyncHandler(async (req, res) => {
  const { rut, email } = req.query;
  
  if (!rut && !email) {
    throw new ApiError(400, 'Debe proporcionar RUT o email para buscar');
  }
  
  const where = {
    OR: [],
  };
  
  if (rut) {
    if (!validateRut(rut)) {
      throw new ApiError(400, 'El RUT ingresado no es válido');
    }
    where.OR.push({ patientRut: formatRut(rut) });
  }
  
  if (email) {
    where.OR.push({ patientEmail: email.toLowerCase().trim() });
  }
  
  const appointments = await prisma.appointment.findMany({
    where,
    include: {
      service: {
        select: {
          id: true,
          title: true,
          price: true,
        },
      },
    },
    orderBy: { date: 'desc' },
    take: 10,
  });
  
  // No revelar el cancelToken completo, solo indicar si puede cancelar
  const sanitizedAppointments = appointments.map((apt) => ({
    id: apt.id,
    service: apt.service.title,
    date: apt.date,
    startTime: apt.startTime,
    endTime: apt.endTime,
    status: apt.status,
    canCancel: ['PENDING', 'CONFIRMED'].includes(apt.status),
    cancelUrl: ['PENDING', 'CONFIRMED'].includes(apt.status) 
      ? `/cancelar-cita/${apt.cancelToken}` 
      : null,
  }));
  
  res.json({
    success: true,
    data: sanitizedAppointments,
  });
});

module.exports = {
  getAvailableSlots,
  getCalendarAvailability,
  createPublicBooking,
  getBookingByToken,
  cancelBookingByToken,
  searchBookings,
};
