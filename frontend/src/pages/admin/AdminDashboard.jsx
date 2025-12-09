import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Users,
  Stethoscope,
  MessageSquare,
  TrendingUp,
  ArrowUpRight,
  Clock,
} from 'lucide-react';
import { Loading } from '../../components/common';
import { appointmentsAPI, usersAPI, servicesAPI, contactAPI } from '../../services/api';

const StatCard = ({ title, value, icon: Icon, trend, color, link }) => (
  <Link
    to={link}
    className="card hover:border-primary-200 group"
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-slate-500 mb-1">{title}</p>
        <p className="text-3xl font-bold text-slate-800">{value}</p>
        {trend && (
          <p className="text-sm text-green-600 flex items-center gap-1 mt-2">
            <TrendingUp className="w-4 h-4" />
            {trend}
          </p>
        )}
      </div>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center text-sm text-primary-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
      Ver detalles
      <ArrowUpRight className="w-4 h-4 ml-1" />
    </div>
  </Link>
);

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    appointments: { today: 0, pending: 0, total: 0 },
    users: { total: 0, newThisMonth: 0 },
    services: 0,
    messages: 0,
  });
  const [recentAppointments, setRecentAppointments] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appointmentStats, userStats, services, appointments, messages] = await Promise.all([
          appointmentsAPI.getStats(),
          usersAPI.getStats(),
          servicesAPI.getAll(),
          appointmentsAPI.getAll({ limit: 5 }),
          contactAPI.getAll({ unread: true, limit: 1 }),
        ]);

        setStats({
          appointments: appointmentStats.data.data,
          users: userStats.data.data,
          services: services.data.count,
          messages: messages.data.pagination.total,
        });
        setRecentAppointments(appointments.data.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <Loading />;
  }

  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-700',
    CONFIRMED: 'bg-blue-100 text-blue-700',
    IN_PROGRESS: 'bg-purple-100 text-purple-700',
    COMPLETED: 'bg-green-100 text-green-700',
    CANCELLED: 'bg-red-100 text-red-700',
  };

  const statusLabels = {
    PENDING: 'Pendiente',
    CONFIRMED: 'Confirmada',
    IN_PROGRESS: 'En Progreso',
    COMPLETED: 'Completada',
    CANCELLED: 'Cancelada',
  };

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Citas Hoy"
          value={stats.appointments.today}
          icon={Calendar}
          color="bg-blue-100 text-blue-600"
          link="/admin/citas"
        />
        <StatCard
          title="Citas Pendientes"
          value={stats.appointments.pending}
          icon={Clock}
          color="bg-yellow-100 text-yellow-600"
          link="/admin/citas?status=PENDING"
        />
        <StatCard
          title="Usuarios"
          value={stats.users.total}
          icon={Users}
          trend={`+${stats.users.newThisMonth} este mes`}
          color="bg-green-100 text-green-600"
          link="/admin/usuarios"
        />
        <StatCard
          title="Mensajes Nuevos"
          value={stats.messages}
          icon={MessageSquare}
          color="bg-purple-100 text-purple-600"
          link="/admin/mensajes"
        />
      </div>

      {/* Recent Appointments */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-800">Citas Recientes</h2>
          <Link
            to="/admin/citas"
            className="text-sm text-primary-600 font-medium hover:underline"
          >
            Ver todas
          </Link>
        </div>

        {recentAppointments.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No hay citas recientes</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Paciente</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Servicio</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Fecha</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Hora</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Estado</th>
                </tr>
              </thead>
              <tbody>
                {recentAppointments.map((appointment) => (
                  <tr key={appointment.id} className="border-b border-slate-50 hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-semibold">
                          {appointment.user?.firstName?.[0]}{appointment.user?.lastName?.[0]}
                        </div>
                        <div>
                          <div className="font-medium text-slate-800">
                            {appointment.user?.firstName} {appointment.user?.lastName}
                          </div>
                          <div className="text-sm text-slate-500">{appointment.user?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{appointment.service?.title}</td>
                    <td className="py-3 px-4 text-slate-600">
                      {new Date(appointment.date).toLocaleDateString('es-CL')}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{appointment.time}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[appointment.status]}`}>
                        {statusLabels[appointment.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          to="/admin/servicios"
          className="card flex items-center gap-4 hover:border-primary-200"
        >
          <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">Gestionar Servicios</h3>
            <p className="text-sm text-slate-500">{stats.services} servicios activos</p>
          </div>
        </Link>

        <Link
          to="/admin/contenido"
          className="card flex items-center gap-4 hover:border-primary-200"
        >
          <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-xl flex items-center justify-center">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">Editar Contenido</h3>
            <p className="text-sm text-slate-500">Actualiza la página principal</p>
          </div>
        </Link>

        <Link
          to="/admin/configuracion"
          className="card flex items-center gap-4 hover:border-primary-200"
        >
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">Configuración</h3>
            <p className="text-sm text-slate-500">Ajustes del sitio</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
