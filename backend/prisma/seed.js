const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed for Centro Benavente...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@centrobenavente.cl' },
    update: {},
    create: {
      email: 'admin@centrobenavente.cl',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'Centro Benavente',
      phone: '+56910155119',
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Eliminar servicios existentes
  await prisma.service.deleteMany({});
  
  // Crear servicios reales de Centro Benavente
  const services = [
    {
      title: 'Curaciones Simples',
      slug: 'curaciones-simples',
      description: 'Atención profesional para heridas menores, cortes superficiales y cuidados básicos de lesiones. Incluye limpieza, desinfección y vendaje con materiales estériles de alta calidad.',
      shortDescription: 'Atención de heridas menores y cortes superficiales',
      icon: 'heart',
      price: 15000, // Precio por confirmar
      priceType: 'FIXED',
      duration: 30,
      resourceType: 'ENFERMERA',
      order: 1,
    },
    {
      title: 'Curaciones Avanzadas',
      slug: 'curaciones-avanzadas',
      description: 'Tratamiento especializado para heridas complejas, úlceras por presión, pie diabético, quemaduras y heridas post-quirúrgicas. Utilizamos técnicas avanzadas de curación y materiales especializados.',
      shortDescription: 'Tratamiento de heridas complejas y úlceras',
      icon: 'heart',
      price: 25000, // Precio por confirmar
      priceType: 'FIXED',
      duration: 45,
      resourceType: 'ENFERMERA',
      order: 2,
    },
    {
      title: 'Retiro de Suturas',
      slug: 'retiro-suturas',
      description: 'Retiro seguro y profesional de puntos de sutura post-quirúrgicos. Evaluamos la cicatrización y brindamos indicaciones de cuidado posterior para una óptima recuperación.',
      shortDescription: 'Retiro profesional de puntos post-quirúrgicos',
      icon: 'scissors',
      price: 12000, // Precio por confirmar
      priceType: 'FIXED',
      duration: 20,
      resourceType: 'ENFERMERA',
      order: 3,
    },
    {
      title: 'Administración de Tratamientos',
      slug: 'administracion-tratamientos',
      description: 'Aplicación de medicamentos inyectables (intramuscular, subcutáneo, intravenoso) según indicación médica. Incluye inyecciones, sueros y tratamientos prescritos por su médico.',
      shortDescription: 'Aplicación de medicamentos e inyecciones',
      icon: 'syringe',
      price: 10000, // Precio por confirmar
      priceType: 'FIXED',
      duration: 25,
      resourceType: 'ENFERMERA',
      order: 4,
    },
    {
      title: 'Procedimientos de Enfermería',
      slug: 'procedimientos-enfermeria',
      description: 'Diversos procedimientos de enfermería incluyendo control de signos vitales, sondajes, instalación de vías, cambio de bolsas colectoras, y otros cuidados especializados.',
      shortDescription: 'Control de signos vitales y procedimientos varios',
      icon: 'stethoscope',
      price: 18000, // Precio por confirmar
      priceType: 'FIXED',
      duration: 40,
      resourceType: 'ENFERMERA',
      order: 5,
    },
    {
      title: 'Traslado Simple de Pacientes',
      slug: 'traslado-pacientes',
      description: 'Servicio de acompañamiento y asistencia en el traslado de pacientes con movilidad reducida. Incluye apoyo para levantarse, caminar y movilizarse de manera segura.',
      shortDescription: 'Asistencia en movilización de pacientes',
      icon: 'car',
      price: 20000, // Precio por confirmar
      priceType: 'FIXED',
      duration: 60,
      resourceType: 'CHOFER',
      order: 6,
    },
  ];

  for (const service of services) {
    await prisma.service.create({
      data: service,
    });
  }
  console.log('✅ Services created:', services.length);

  // Eliminar slots existentes
  await prisma.availableSlot.deleteMany({});
  
  // Crear horarios disponibles para ENFERMERA
  const enfermeraSlots = [
    // Lunes a Viernes - Mañana
    { dayOfWeek: 1, startTime: '08:00', endTime: '13:00', slotDuration: 60, resourceType: 'ENFERMERA' },
    { dayOfWeek: 2, startTime: '08:00', endTime: '13:00', slotDuration: 60, resourceType: 'ENFERMERA' },
    { dayOfWeek: 3, startTime: '08:00', endTime: '13:00', slotDuration: 60, resourceType: 'ENFERMERA' },
    { dayOfWeek: 4, startTime: '08:00', endTime: '13:00', slotDuration: 60, resourceType: 'ENFERMERA' },
    { dayOfWeek: 5, startTime: '08:00', endTime: '13:00', slotDuration: 60, resourceType: 'ENFERMERA' },
    // Lunes a Viernes - Tarde
    { dayOfWeek: 1, startTime: '14:00', endTime: '18:00', slotDuration: 60, resourceType: 'ENFERMERA' },
    { dayOfWeek: 2, startTime: '14:00', endTime: '18:00', slotDuration: 60, resourceType: 'ENFERMERA' },
    { dayOfWeek: 3, startTime: '14:00', endTime: '18:00', slotDuration: 60, resourceType: 'ENFERMERA' },
    { dayOfWeek: 4, startTime: '14:00', endTime: '18:00', slotDuration: 60, resourceType: 'ENFERMERA' },
    { dayOfWeek: 5, startTime: '14:00', endTime: '18:00', slotDuration: 60, resourceType: 'ENFERMERA' },
    // Sábado
    { dayOfWeek: 6, startTime: '09:00', endTime: '14:00', slotDuration: 60, resourceType: 'ENFERMERA' },
  ];
  
  // Crear horarios disponibles para CHOFER
  const choferSlots = [
    { dayOfWeek: 1, startTime: '08:00', endTime: '18:00', slotDuration: 60, resourceType: 'CHOFER' },
    { dayOfWeek: 2, startTime: '08:00', endTime: '18:00', slotDuration: 60, resourceType: 'CHOFER' },
    { dayOfWeek: 3, startTime: '08:00', endTime: '18:00', slotDuration: 60, resourceType: 'CHOFER' },
    { dayOfWeek: 4, startTime: '08:00', endTime: '18:00', slotDuration: 60, resourceType: 'CHOFER' },
    { dayOfWeek: 5, startTime: '08:00', endTime: '18:00', slotDuration: 60, resourceType: 'CHOFER' },
    { dayOfWeek: 6, startTime: '09:00', endTime: '14:00', slotDuration: 60, resourceType: 'CHOFER' },
  ];

  const allSlots = [...enfermeraSlots, ...choferSlots];
  
  for (const slot of allSlots) {
    await prisma.availableSlot.create({
      data: {
        ...slot,
        maxBookings: 1,
        isActive: true,
      },
    });
  }
  console.log('✅ Available slots created:', allSlots.length);

  // Create team members
  await prisma.teamMember.deleteMany({});
  
  const teamMembers = [
    {
      name: 'Equipo Centro Benavente',
      position: 'Profesionales de Salud',
      bio: 'Contamos con un equipo de profesionales de enfermería certificados y con amplia experiencia en atención domiciliaria.',
      specialties: ['Curaciones', 'Procedimientos', 'Cuidados Integrales'],
      order: 1,
    },
  ];

  for (const member of teamMembers) {
    await prisma.teamMember.create({
      data: member,
    });
  }
  console.log('✅ Team members created:', teamMembers.length);

  // Create testimonials/reviews
  await prisma.review.deleteMany({});
  
  const reviews = [
    {
      name: 'María G.',
      role: 'Paciente',
      content: 'Excelente atención. El personal es muy profesional y cuidadoso. Me atendieron las curaciones con mucho cariño. Totalmente recomendados.',
      rating: 5,
      isApproved: true,
      isFeatured: true,
    },
    {
      name: 'Carlos R.',
      role: 'Familiar de paciente',
      content: 'Mi madre necesitaba curaciones diarias y el equipo de Centro Benavente fue puntual, amable y muy capacitado. Nos dieron mucha tranquilidad.',
      rating: 5,
      isApproved: true,
      isFeatured: true,
    },
    {
      name: 'Ana M.',
      role: 'Paciente',
      content: 'Me retiraron los puntos después de mi operación. El procedimiento fue rápido, sin dolor y muy profesional. Los recomiendo totalmente.',
      rating: 5,
      isApproved: true,
      isFeatured: true,
    },
  ];

  for (const review of reviews) {
    await prisma.review.create({
      data: review,
    });
  }
  console.log('✅ Reviews created:', reviews.length);

  // Create site content
  const siteContent = [
    {
      key: 'hero',
      section: 'home',
      title: 'Hero Section',
      content: {
        badge: 'Atención profesional en Ovalle',
        title: 'Procedimientos y atenciones de salud',
        titleHighlight: 'a domicilio',
        description: 'Equipo de profesionales de enfermería certificados. Curaciones, administración de tratamientos, retiro de suturas y más servicios con la calidez que te mereces.',
        primaryButton: 'Agendar Hora',
        secondaryButton: 'WhatsApp',
        phone: '+56 9 1015 5119',
        stats: [
          { number: '500+', label: 'Pacientes' },
          { number: '10+', label: 'Profesionales' },
          { number: '98%', label: 'Satisfacción' },
        ],
      },
      order: 1,
    },
    {
      key: 'about',
      section: 'home',
      title: 'About Section',
      content: {
        subtitle: '¿Por qué elegirnos?',
        title: 'Cuidamos de ti como si fueras de nuestra familia',
        description: 'En Centro Benavente nos comprometemos a brindarte la mejor atención de salud, con profesionalismo y calidez humana.',
        features: [
          'Personal certificado y con experiencia comprobable',
          'Puntualidad y compromiso en cada atención',
          'Trato humano y personalizado',
          'Equipo multidisciplinario a tu disposición',
        ],
      },
      order: 2,
    },
    {
      key: 'contact',
      section: 'home',
      title: 'Contact Section',
      content: {
        subtitle: 'Contacto',
        title: 'Estamos aquí para ayudarte',
        description: '¿Tienes dudas sobre nuestros servicios? Contáctanos y te responderemos a la brevedad.',
        email: 'saludbenavente@gmail.com',
        phone: '+56 9 1015 5119',
        address: 'Benavente 85, Ovalle',
        hours: 'Lun-Vie: 8:00-18:00 | Sáb: 9:00-14:00',
      },
      order: 3,
    },
  ];

  for (const content of siteContent) {
    await prisma.siteContent.upsert({
      where: { key: content.key },
      update: content,
      create: content,
    });
  }
  console.log('✅ Site content created:', siteContent.length);

  // Create settings
  const settings = [
    {
      key: 'site_name',
      value: { 
        name: 'Centro Benavente', 
        tagline: 'Procedimientos y atenciones de salud',
        legalName: 'Procedimientos X-Press SPA',
        rut: '78.022.568-8',
      },
      description: 'Site name and legal info',
    },
    {
      key: 'contact_info',
      value: {
        email: 'saludbenavente@gmail.com',
        phone: '+56 9 1015 5119',
        whatsapp: '+56910155119',
        address: 'Benavente 85, Ovalle, Chile',
      },
      description: 'Contact information',
    },
    {
      key: 'social_media',
      value: {
        instagram: 'https://instagram.com/centrobenavente',
      },
      description: 'Social media links',
    },
    {
      key: 'booking_settings',
      value: {
        minHoursBeforeCancel: 2,
        maxDaysInAdvance: 30,
        defaultSlotDuration: 60,
        allowWeekends: true,
        sundayClosed: true,
      },
      description: 'Booking configuration',
    },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: setting,
      create: setting,
    });
  }
  console.log('✅ Settings created:', settings.length);

  console.log('');
  console.log('🎉 Database seed for Centro Benavente completed!');
  console.log('');
  console.log('📋 Admin credentials:');
  console.log('   Email: admin@centrobenavente.cl');
  console.log('   Password: admin123');
  console.log('');
  console.log('📍 Business info:');
  console.log('   Name: Centro Benavente');
  console.log('   Legal: Procedimientos X-Press SPA');
  console.log('   RUT: 78.022.568-8');
  console.log('   Address: Benavente 85, Ovalle');
  console.log('   Phone: +56 9 1015 5119');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
