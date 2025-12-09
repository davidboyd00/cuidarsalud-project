const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@cuidarsalud.com' },
    update: {},
    create: {
      email: 'admin@cuidarsalud.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'CuidarSalud',
      phone: '+56912345678',
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create services
  const services = [
    {
      title: 'Curaciones',
      slug: 'curaciones',
      description: 'Atención profesional de heridas, úlceras por presión, quemaduras y cuidados post-quirúrgicos con técnicas estériles y materiales de alta calidad. Nuestro equipo está capacitado para manejar todo tipo de heridas, desde las más simples hasta las más complejas.',
      shortDescription: 'Atención profesional de heridas y cuidados post-quirúrgicos',
      icon: 'bandage',
      price: 25000,
      priceType: 'FIXED',
      duration: 45,
      order: 1,
    },
    {
      title: 'Inyecciones',
      slug: 'inyecciones',
      description: 'Aplicación segura de medicamentos intramusculares, subcutáneos e intravenosos. Incluye administración de tratamientos prescritos por su médico con todas las medidas de bioseguridad.',
      shortDescription: 'Aplicación segura de medicamentos inyectables',
      icon: 'syringe',
      price: 15000,
      priceType: 'FIXED',
      duration: 20,
      order: 2,
    },
    {
      title: 'Control de Signos Vitales',
      slug: 'control-signos-vitales',
      description: 'Monitoreo completo de presión arterial, frecuencia cardíaca, temperatura, saturación de oxígeno y glucemia capilar. Ideal para pacientes con enfermedades crónicas o en seguimiento médico.',
      shortDescription: 'Monitoreo completo de signos vitales',
      icon: 'stethoscope',
      price: 20000,
      priceType: 'FIXED',
      duration: 30,
      order: 3,
    },
    {
      title: 'Cuidado Domiciliario',
      slug: 'cuidado-domiciliario',
      description: 'Atención integral en la comodidad de su hogar. Ideal para pacientes en recuperación, adultos mayores o personas con movilidad reducida. Incluye asistencia en actividades diarias, administración de medicamentos y acompañamiento.',
      shortDescription: 'Atención integral en la comodidad de su hogar',
      icon: 'home',
      price: 40000,
      priceType: 'HOURLY',
      duration: 60,
      order: 4,
    },
    {
      title: 'Cuidado Post-Operatorio',
      slug: 'cuidado-post-operatorio',
      description: 'Seguimiento especializado después de cirugías. Incluye manejo del dolor, cuidado de heridas, prevención de complicaciones y rehabilitación temprana siguiendo las indicaciones de su médico tratante.',
      shortDescription: 'Seguimiento especializado después de cirugías',
      icon: 'heart',
      price: 50000,
      priceType: 'CONSULTATION',
      duration: 60,
      order: 5,
    },
    {
      title: 'Turno de Enfermería',
      slug: 'turno-enfermeria',
      description: 'Personal de enfermería disponible por turnos de 8, 12 o 24 horas para pacientes que requieren atención continua. Ideal para hospitalización domiciliaria o cuidados paliativos.',
      shortDescription: 'Personal por turnos para atención continua',
      icon: 'clock',
      price: 80000,
      priceType: 'FIXED',
      duration: 480,
      order: 6,
    },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: service,
      create: service,
    });
  }
  console.log('✅ Services created:', services.length);

  // Create team members
  const teamMembers = [
    {
      name: 'Dra. María González',
      position: 'Directora de Enfermería',
      bio: 'Más de 15 años de experiencia en cuidados críticos y gestión de equipos de salud.',
      specialties: ['Cuidados Intensivos', 'Gestión en Salud', 'Educación en Enfermería'],
      order: 1,
    },
    {
      name: 'Enf. Carlos Rodríguez',
      position: 'Enfermero Jefe',
      bio: 'Especialista en cuidados domiciliarios y atención geriátrica con 10 años de experiencia.',
      specialties: ['Geriatría', 'Cuidados Paliativos', 'Heridas Complejas'],
      order: 2,
    },
    {
      name: 'Enf. Ana Martínez',
      position: 'Coordinadora de Servicios',
      bio: 'Experta en coordinación de atención domiciliaria y seguimiento de pacientes.',
      specialties: ['Coordinación', 'Atención Domiciliaria', 'Pediatría'],
      order: 3,
    },
  ];

  for (const member of teamMembers) {
    await prisma.teamMember.create({
      data: member,
    });
  }
  console.log('✅ Team members created:', teamMembers.length);

  // Create testimonials/reviews
  const reviews = [
    {
      name: 'María González',
      role: 'Paciente',
      content: 'Excelente servicio. La enfermera que me atendió fue muy profesional y cuidadosa con las curaciones de mi madre. Totalmente recomendados.',
      rating: 5,
      isApproved: true,
      isFeatured: true,
    },
    {
      name: 'Carlos Rodríguez',
      role: 'Familiar de paciente',
      content: 'Contratamos el servicio de cuidado domiciliario para mi padre. El personal es puntual, amable y muy capacitado. Nos dieron mucha tranquilidad.',
      rating: 5,
      isApproved: true,
      isFeatured: true,
    },
    {
      name: 'Ana Martínez',
      role: 'Paciente',
      content: 'Después de mi cirugía necesitaba ayuda con las curaciones. El equipo fue increíble, siempre llegaron a tiempo y con todos los materiales necesarios.',
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
        badge: 'Atención 24/7 a Domicilio',
        title: 'Cuidado profesional de enfermería en',
        titleHighlight: 'la comodidad de tu hogar',
        description: 'Equipo de enfermeras profesionales certificadas. Curaciones, inyecciones, control de signos vitales y cuidado integral con la más alta calidad y calidez humana.',
        primaryButton: 'Agendar Ahora',
        secondaryButton: 'Conocer Más',
        phone: '+56 9 1234 5678',
        stats: [
          { number: '500+', label: 'Pacientes Atendidos' },
          { number: '15+', label: 'Profesionales' },
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
        subtitle: 'Sobre Nosotros',
        title: 'Cuidamos de ti como si fueras de nuestra familia',
        description: 'Somos un equipo de profesionales de enfermería con más de 10 años de experiencia brindando atención de salud a domicilio. Nuestro compromiso es ofrecer un servicio de calidad, con calidez humana y respeto por cada paciente.',
        features: [
          'Personal certificado y con experiencia verificable',
          'Equipamiento médico de última generación',
          'Disponibilidad 24/7 para emergencias',
          'Seguimiento continuo del paciente',
        ],
      },
      order: 2,
    },
    {
      key: 'contact',
      section: 'home',
      title: 'Contact Section',
      content: {
        subtitle: 'Contáctanos',
        title: 'Estamos aquí para ayudarte',
        description: 'No dudes en comunicarte con nosotros. Responderemos todas tus consultas a la brevedad.',
        email: 'contacto@cuidarsalud.com',
        phone: '+56 9 1234 5678',
        address: 'Santiago, Chile',
        hours: 'Lunes a Domingo, 24 horas',
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
      value: { name: 'CuidarSalud', tagline: 'Enfermería a Domicilio' },
      description: 'Site name and tagline',
    },
    {
      key: 'contact_info',
      value: {
        email: 'contacto@cuidarsalud.com',
        phone: '+56 9 1234 5678',
        whatsapp: '+56912345678',
        address: 'Santiago, Chile',
      },
      description: 'Contact information',
    },
    {
      key: 'social_media',
      value: {
        facebook: 'https://facebook.com/cuidarsalud',
        instagram: 'https://instagram.com/cuidarsalud',
        twitter: 'https://twitter.com/cuidarsalud',
      },
      description: 'Social media links',
    },
    {
      key: 'business_hours',
      value: {
        monday: '24 horas',
        tuesday: '24 horas',
        wednesday: '24 horas',
        thursday: '24 horas',
        friday: '24 horas',
        saturday: '24 horas',
        sunday: '24 horas',
      },
      description: 'Business hours',
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

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
