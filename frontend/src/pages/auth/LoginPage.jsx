import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Heart, Eye, EyeOff } from 'lucide-react';
import { Button, Input } from '../../components/common';
import useAuthStore from '../../context/authStore';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      toast.success('¡Bienvenido!');
      navigate(from, { replace: true });
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-500 rounded-xl flex items-center justify-center text-white">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-xl text-slate-800">CuidarSalud</div>
              <div className="text-xs text-slate-500 tracking-wider uppercase">
                Enfermería a Domicilio
              </div>
            </div>
          </Link>

          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Bienvenido de vuelta
          </h1>
          <p className="text-slate-500 mb-8">
            Ingresa tus credenciales para acceder a tu cuenta
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              type="email"
              placeholder="tu@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />

            <div className="relative">
              <Input
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[38px] text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-slate-600">Recordarme</span>
              </label>
              <a href="#" className="text-sm text-primary-600 hover:underline">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Iniciar Sesión
            </Button>
          </form>

          <p className="mt-8 text-center text-slate-500">
            ¿No tienes cuenta?{' '}
            <Link to="/registro" className="text-primary-600 font-semibold hover:underline">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Visual */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-600 to-teal-500 items-center justify-center p-12">
        <div className="max-w-md text-white text-center">
          <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <Heart className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-bold mb-4">
            Tu salud en las mejores manos
          </h2>
          <p className="text-white/80 leading-relaxed">
            Accede a tu cuenta para gestionar tus citas, ver tu historial de servicios 
            y mantenerte conectado con nuestro equipo de profesionales.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
