import { Link } from 'react-router-dom';
import { Heart, Phone, Mail, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-400 rounded-xl flex items-center justify-center text-white">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <div className="font-bold text-xl text-white">CuidarSalud</div>
                <div className="text-xs text-slate-400 tracking-wider uppercase">
                  Enfermería a Domicilio
                </div>
              </div>
            </Link>
            <p className="text-slate-400 leading-relaxed">
              Brindamos servicios de enfermería profesional en la comodidad de tu hogar. 
              Cuidamos de ti y tu familia con dedicación y profesionalismo.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-6">Enlaces Rápidos</h4>
            <ul className="space-y-3">
              {['Servicios', 'Nosotros', 'Testimonios', 'Contacto'].map((item) => (
                <li key={item}>
                  <a
                    href={`#${item.toLowerCase()}`}
                    className="hover:text-primary-400 transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-6">Servicios</h4>
            <ul className="space-y-3">
              {[
                'Curaciones',
                'Inyecciones',
                'Control de Signos Vitales',
                'Cuidado Domiciliario',
                'Cuidado Post-Operatorio',
              ].map((item) => (
                <li key={item}>
                  <a href="#servicios" className="hover:text-primary-400 transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-6">Contacto</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary-400" />
                <span>+56 9 1234 5678</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary-400" />
                <span>contacto@cuidarsalud.com</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary-400 mt-0.5" />
                <span>Santiago, Chile</span>
              </li>
            </ul>

            {/* Social Links */}
            <div className="flex items-center gap-4 mt-6">
              {[
                { icon: Facebook, href: '#' },
                { icon: Instagram, href: '#' },
                { icon: Twitter, href: '#' },
              ].map(({ icon: Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-primary-600 hover:text-white transition-all"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-400 text-sm">
            © {currentYear} CuidarSalud. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-6 text-sm">
            <a href="#" className="hover:text-primary-400 transition-colors">
              Términos y Condiciones
            </a>
            <a href="#" className="hover:text-primary-400 transition-colors">
              Política de Privacidad
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
