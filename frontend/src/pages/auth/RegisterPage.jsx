import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Eye, EyeOff } from 'lucide-react';
import { Button, Input } from '../../components/common';
import useAuthStore from '../../context/authStore';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = 'El nombre es requerido';
    if (!formData.lastName) newErrors.lastName = 'El apellido es requerido';
    if (!formData.email) newErrors.email = 'El email es requerido';
    if (!formData.password) newErrors.password = 'La contraseña es requerida';
    if (formData.password.length < 6) newErrors.password = 'Mínimo 6 caracteres';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const { confirmPassword, ...userData } = formData;
    const result = await register(userData);

    if (result.success) {
      toast.success('¡Cuenta creada exitosamente!');
      navigate('/');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-600 to-teal-500 items-center justify-center p-12">
        <div className="max-w-md text-white text-center">
          <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <Heart className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-bold mb-4">
            Únete a nuestra familia
          </h2>
          <p className="text-white/80 leading-relaxed">
            Crea tu cuenta para acceder a todos nuestros servicios de enfermería 
            profesional y agendar citas fácilmente.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 mb-8">
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

          <h1 className="text-3xl font-bold text-slate-800 mb-2">Crear cuenta</h1>
          <p className="text-slate-500 mb-8">Completa el formulario para registrarte</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Nombre"
                placeholder="Juan"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                error={errors.firstName}
                required
              />
              <Input
                label="Apellido"
                placeholder="Pérez"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                error={errors.lastName}
                required
              />
            </div>

            <Input
              label="Email"
              type="email"
              placeholder="juan@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={errors.email}
              required
            />

            <Input
              label="Teléfono"
              type="tel"
              placeholder="+56 9 XXXX XXXX"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />

            <div className="relative">
              <Input
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                error={errors.password}
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

            <Input
              label="Confirmar Contraseña"
              type={showPassword ? 'text' : 'password'}
              placeholder="Repite tu contraseña"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              error={errors.confirmPassword}
              required
            />

            <div className="pt-2">
              <Button type="submit" className="w-full" isLoading={isLoading}>
                Crear Cuenta
              </Button>
            </div>
          </form>

          <p className="mt-8 text-center text-slate-500">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-primary-600 font-semibold hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
