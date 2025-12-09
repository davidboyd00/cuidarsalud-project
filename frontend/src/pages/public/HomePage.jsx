import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  Stethoscope,
  Syringe,
  Home,
  Clock,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Check,
  Star,
  ArrowRight,
  Bandage,
} from 'lucide-react';
import { Button, Modal, Input, Loading } from '../../components/common';
import { servicesAPI, reviewsAPI, contentAPI, contactAPI } from '../../services/api';
import useAuthStore from '../../context/authStore';
import toast from 'react-hot-toast';

const iconMap = {
  heart: Heart,
  stethoscope: Stethoscope,
  syringe: Syringe,
  home: Home,
  clock: Clock,
  bandage: Bandage,
};

const HomePage = () => {
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sendingContact, setSendingContact] = useState(false);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, reviewsRes, contentRes] = await Promise.all([
          servicesAPI.getAll({ active: true }),
          reviewsAPI.getPublic({ featured: true }),
          contentAPI.getAll('home'),
        ]);
        setServices(servicesRes.data.data);
        setReviews(reviewsRes.data.data);
        setContent(contentRes.data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setSendingContact(true);
    try {
      await contactAPI.send(contactForm);
      toast.success('Mensaje enviado correctamente');
      setContactForm({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al enviar mensaje');
    } finally {
      setSendingContact(false);
    }
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  const heroContent = content.hero || {};
  const aboutContent = content.about || {};
  const contactContent = content.contact || {};

  return (
    <div>
      {/* Hero Section */}
      <section className="min-h-screen relative overflow-hidden flex items-center pt-20">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-teal-50" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-200/30 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="animate-fade-in-up">
              <span className="badge mb-6">
                <span className="w-2 h-2 bg-primary-500 rounded-full" />
                {heroContent.badge || 'Atención 24/7 a Domicilio'}
              </span>

              <h1 className="section-title text-5xl lg:text-6xl mb-6">
                {heroContent.title || 'Cuidado profesional de enfermería en'}{' '}
                <span className="gradient-text">
                  {heroContent.titleHighlight || 'la comodidad de tu hogar'}
                </span>
              </h1>

              <p className="text-lg text-slate-600 leading-relaxed mb-8 max-w-xl">
                {heroContent.description ||
                  'Equipo de enfermeras profesionales certificadas. Curaciones, inyecciones, control de signos vitales y cuidado integral con la más alta calidad.'}
              </p>

              <div className="flex flex-wrap gap-4 mb-12">
                <a href="#servicios">
                  <Button size="lg" leftIcon={<Calendar className="w-5 h-5" />}>
                    {heroContent.primaryButton || 'Agendar Ahora'}
                  </Button>
                </a>
                <a href="#nosotros">
                  <Button variant="secondary" size="lg">
                    {heroContent.secondaryButton || 'Conocer Más'}
                  </Button>
                </a>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-8">
                {(heroContent.stats || [
                  { number: '500+', label: 'Pacientes Atendidos' },
                  { number: '15+', label: 'Profesionales' },
                  { number: '98%', label: 'Satisfacción' },
                ]).map((stat, i) => (
                  <div key={i}>
                    <div className="text-3xl font-bold text-primary-600">{stat.number}</div>
                    <div className="text-sm text-slate-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual */}
            <div className="relative animate-fade-in-up animate-delay-200">
              <div className="bg-gradient-to-br from-primary-600 to-teal-500 rounded-3xl p-8 text-white relative overflow-hidden animate-float">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10">
                  <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                    <Stethoscope className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Atención Inmediata</h3>
                  <p className="text-white/90 mb-6">
                    Nuestro equipo está disponible las 24 horas para atender tus necesidades de salud.
                  </p>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5" />
                    <span className="text-xl font-semibold">{heroContent.phone || '+56 9 1234 5678'}</span>
                  </div>
                </div>
              </div>

              {/* Floating Card */}
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3 animate-fade-in animate-delay-300">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                  <Check className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-semibold text-slate-800">Profesionales Certificados</div>
                  <div className="text-sm text-slate-500">100% verificados</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="servicios" className="section bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-primary-600 font-semibold text-sm tracking-wider uppercase">
              Nuestros Servicios
            </span>
            <h2 className="section-title mt-3">Atención integral para tu bienestar</h2>
            <p className="section-subtitle mx-auto mt-4">
              Ofrecemos una amplia gama de servicios de enfermería profesional adaptados a tus necesidades.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => {
              const Icon = iconMap[service.icon] || Heart;
              return (
                <div
                  key={service.id}
                  className="card animate-fade-in-up"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-teal-100 rounded-2xl flex items-center justify-center text-primary-600 mb-5">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-3">{service.title}</h3>
                  <p className="text-slate-500 leading-relaxed mb-5">
                    {service.shortDescription || service.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary-600">
                      ${Number(service.price).toLocaleString()}
                      {service.priceType === 'HOURLY' && '/hora'}
                    </span>
                    {isAuthenticated ? (
                      <Link to={`/agendar/${service.slug}`}>
                        <Button size="sm">Agendar</Button>
                      </Link>
                    ) : (
                      <Link to="/login">
                        <Button size="sm">Agendar</Button>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="nosotros" className="section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-primary-600 font-semibold text-sm tracking-wider uppercase">
                {aboutContent.subtitle || 'Sobre Nosotros'}
              </span>
              <h2 className="section-title mt-3 mb-6">
                {aboutContent.title || 'Cuidamos de ti como si fueras de nuestra familia'}
              </h2>
              <p className="text-slate-600 leading-relaxed mb-8">
                {aboutContent.description ||
                  'Somos un equipo de profesionales de enfermería con más de 10 años de experiencia.'}
              </p>

              <div className="space-y-4">
                {(aboutContent.features || [
                  'Personal certificado y con experiencia verificable',
                  'Equipamiento médico de última generación',
                  'Disponibilidad 24/7 para emergencias',
                  'Seguimiento continuo del paciente',
                ]).map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center text-primary-600">
                      <Check className="w-4 h-4" />
                    </div>
                    <span className="text-slate-700">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mt-10">
                <a href="#contacto">
                  <Button rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Contáctanos
                  </Button>
                </a>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-primary-100 to-teal-100 rounded-3xl" />
              <div className="absolute inset-8 bg-white rounded-2xl shadow-2xl flex items-center justify-center">
                <Heart className="w-32 h-32 text-primary-200" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonios" className="section bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-primary-400 font-semibold text-sm tracking-wider uppercase">
              Testimonios
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-bold mt-3">
              Lo que dicen nuestros pacientes
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review, i) => (
              <div
                key={review.id}
                className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-300 leading-relaxed mb-6">"{review.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center font-bold">
                    {review.name[0]}
                  </div>
                  <div>
                    <div className="font-semibold">{review.name}</div>
                    <div className="text-sm text-slate-400">{review.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contacto" className="section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <span className="text-primary-600 font-semibold text-sm tracking-wider uppercase">
                {contactContent.subtitle || 'Contáctanos'}
              </span>
              <h2 className="section-title mt-3 mb-6">
                {contactContent.title || 'Estamos aquí para ayudarte'}
              </h2>
              <p className="text-slate-600 leading-relaxed mb-8">
                {contactContent.description ||
                  'No dudes en comunicarte con nosotros. Responderemos todas tus consultas.'}
              </p>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-600">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Teléfono</div>
                    <div className="text-lg font-semibold text-slate-800">
                      {contactContent.phone || '+56 9 1234 5678'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-600">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Email</div>
                    <div className="text-lg font-semibold text-slate-800">
                      {contactContent.email || 'contacto@cuidarsalud.com'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-600">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Ubicación</div>
                    <div className="text-lg font-semibold text-slate-800">
                      {contactContent.address || 'Santiago, Chile'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="card">
              <h3 className="text-xl font-semibold text-slate-800 mb-6">Envíanos un mensaje</h3>
              <form onSubmit={handleContactSubmit} className="space-y-5">
                <Input
                  label="Nombre"
                  placeholder="Tu nombre"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="tu@email.com"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  required
                />
                <Input
                  label="Teléfono"
                  type="tel"
                  placeholder="+56 9 XXXX XXXX"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                />
                <div>
                  <label className="label">Mensaje</label>
                  <textarea
                    className="input min-h-[120px] resize-none"
                    placeholder="¿En qué podemos ayudarte?"
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" isLoading={sendingContact}>
                  Enviar Mensaje
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
