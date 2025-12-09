import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Stethoscope,
  FileText,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  Heart,
  ChevronDown,
  Star,
  UserCog,
} from 'lucide-react';
import useAuthStore from '../../context/authStore';

const menuItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { path: '/admin/citas', icon: Calendar, label: 'Citas' },
  { path: '/admin/servicios', icon: Stethoscope, label: 'Servicios' },
  { path: '/admin/usuarios', icon: Users, label: 'Usuarios' },
  { path: '/admin/equipo', icon: UserCog, label: 'Equipo' },
  { path: '/admin/testimonios', icon: Star, label: 'Testimonios' },
  { path: '/admin/contenido', icon: FileText, label: 'Contenido' },
  { path: '/admin/mensajes', icon: MessageSquare, label: 'Mensajes' },
  { path: '/admin/configuracion', icon: Settings, label: 'Configuración' },
];

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-72 bg-slate-900 z-50 transform transition-transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-400 rounded-xl flex items-center justify-center text-white">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white">CuidarSalud</div>
              <div className="text-xs text-slate-400">Panel Admin</div>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-5rem)]">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path, item.exact);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  active
                    ? 'bg-primary-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}

          <hr className="my-4 border-slate-800" />

          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
          >
            <Heart className="w-5 h-5" />
            <span className="font-medium">Ver Sitio Web</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-72">
        {/* Top Bar */}
        <header className="h-20 bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="h-full px-4 lg:px-8 flex items-center justify-between">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Page Title */}
            <div className="hidden lg:block">
              <h1 className="text-xl font-semibold text-slate-800">
                {menuItems.find((item) => isActive(item.path, item.exact))?.label || 'Admin'}
              </h1>
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-semibold">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="font-medium text-slate-800">
                    {user?.firstName} {user?.lastName}
                  </div>
                  <div className="text-sm text-slate-500">{user?.role}</div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                    <Link
                      to="/mi-cuenta"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-slate-600 hover:bg-slate-50"
                    >
                      <Settings className="w-4 h-4" />
                      Mi Perfil
                    </Link>
                    <hr className="my-2 border-slate-100" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 w-full"
                    >
                      <LogOut className="w-4 h-4" />
                      Cerrar Sesión
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
