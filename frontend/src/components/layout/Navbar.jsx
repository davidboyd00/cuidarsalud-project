import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Heart, User, LogOut, LayoutDashboard } from 'lucide-react';
import { Button } from '../common';
import useAuthStore from '../../context/authStore';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, isAdmin } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const isHomePage = location.pathname === '/';

  const scrollToSection = (id) => {
    if (!isHomePage) {
      navigate('/');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { label: 'Servicios', action: () => scrollToSection('servicios') },
    { label: 'Nosotros', action: () => scrollToSection('nosotros') },
    { label: 'Testimonios', action: () => scrollToSection('testimonios') },
    { label: 'Contacto', action: () => scrollToSection('contacto') },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || !isHomePage
          ? 'bg-white/95 backdrop-blur-lg shadow-sm border-b border-slate-100'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-500/30">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-xl text-slate-800">CuidarSalud</div>
              <div className="text-xs text-slate-500 tracking-wider uppercase">
                Enfermería a Domicilio
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={link.action}
                className="nav-link"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {isAdmin() && (
                  <Link to="/admin" className="nav-link flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    Admin
                  </Link>
                )}
                <Link to="/mi-cuenta" className="nav-link flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {user?.firstName}
                </Link>
                <button
                  onClick={handleLogout}
                  className="nav-link flex items-center gap-2 text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Iniciar Sesión</Button>
                </Link>
                <Link to="/registro">
                  <Button>Registrarse</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 shadow-lg">
          <div className="px-4 py-6 space-y-3">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={link.action}
                className="block w-full text-left nav-link"
              >
                {link.label}
              </button>
            ))}
            
            <hr className="my-4 border-slate-200" />
            
            {isAuthenticated ? (
              <>
                {isAdmin() && (
                  <Link
                    to="/admin"
                    className="block nav-link flex items-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Panel Admin
                  </Link>
                )}
                <Link
                  to="/mi-cuenta"
                  className="block nav-link flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  Mi Cuenta
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left nav-link text-red-600"
                >
                  <LogOut className="w-4 h-4 inline mr-2" />
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <div className="space-y-3 pt-2">
                <Link to="/login" className="block">
                  <Button variant="secondary" className="w-full">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link to="/registro" className="block">
                  <Button className="w-full">Registrarse</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
