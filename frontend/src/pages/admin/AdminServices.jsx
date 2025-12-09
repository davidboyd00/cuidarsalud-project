import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react';
import { Button, Modal, Input, Loading } from '../../components/common';
import { servicesAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AdminServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    icon: 'heart',
    price: '',
    priceType: 'FIXED',
    duration: '',
    isActive: true,
  });

  const icons = ['heart', 'stethoscope', 'syringe', 'home', 'clock', 'bandage'];
  const priceTypes = [
    { value: 'FIXED', label: 'Precio Fijo' },
    { value: 'HOURLY', label: 'Por Hora' },
    { value: 'CONSULTATION', label: 'A Consultar' },
  ];

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await servicesAPI.getAll();
      setServices(response.data.data);
    } catch (error) {
      toast.error('Error al cargar servicios');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (service = null) => {
    if (service) {
      setEditingService(service);
      setFormData({
        title: service.title,
        description: service.description,
        shortDescription: service.shortDescription || '',
        icon: service.icon || 'heart',
        price: service.price,
        priceType: service.priceType,
        duration: service.duration || '',
        isActive: service.isActive,
      });
    } else {
      setEditingService(null);
      setFormData({
        title: '',
        description: '',
        shortDescription: '',
        icon: 'heart',
        price: '',
        priceType: 'FIXED',
        duration: '',
        isActive: true,
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingService) {
        await servicesAPI.update(editingService.id, formData);
        toast.success('Servicio actualizado');
      } else {
        await servicesAPI.create(formData);
        toast.success('Servicio creado');
      }
      setShowModal(false);
      fetchServices();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al guardar');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este servicio?')) return;
    try {
      await servicesAPI.delete(id);
      toast.success('Servicio eliminado');
      fetchServices();
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Servicios</h1>
          <p className="text-slate-500">Gestiona los servicios disponibles</p>
        </div>
        <Button onClick={() => handleOpenModal()} leftIcon={<Plus className="w-5 h-5" />}>
          Nuevo Servicio
        </Button>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Servicio</th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Precio</th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Duración</th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">Estado</th>
              <th className="text-right py-4 px-6 text-sm font-semibold text-slate-600">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center">
                      {service.icon?.[0]?.toUpperCase() || 'S'}
                    </div>
                    <div>
                      <div className="font-medium text-slate-800">{service.title}</div>
                      <div className="text-sm text-slate-500 truncate max-w-xs">
                        {service.shortDescription}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className="font-semibold text-slate-800">
                    ${Number(service.price).toLocaleString()}
                  </span>
                  {service.priceType === 'HOURLY' && (
                    <span className="text-slate-500 text-sm">/hora</span>
                  )}
                </td>
                <td className="py-4 px-6 text-slate-600">
                  {service.duration ? `${service.duration} min` : '-'}
                </td>
                <td className="py-4 px-6">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      service.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {service.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenModal(service)}
                      className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-primary-600"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="p-2 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Título"
            placeholder="Nombre del servicio"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div>
            <label className="label">Descripción corta</label>
            <textarea
              className="input min-h-[80px] resize-none"
              placeholder="Breve descripción para las tarjetas"
              value={formData.shortDescription}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
            />
          </div>

          <div>
            <label className="label">Descripción completa</label>
            <textarea
              className="input min-h-[120px] resize-none"
              placeholder="Descripción detallada del servicio"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Icono</label>
              <select
                className="input"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              >
                {icons.map((icon) => (
                  <option key={icon} value={icon}>
                    {icon}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Tipo de precio</label>
              <select
                className="input"
                value={formData.priceType}
                onChange={(e) => setFormData({ ...formData, priceType: e.target.value })}
              >
                {priceTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Precio"
              type="number"
              placeholder="25000"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />

            <Input
              label="Duración (minutos)"
              type="number"
              placeholder="60"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            />
          </div>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              className="w-5 h-5 rounded border-slate-300 text-primary-600"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            />
            <span className="text-slate-700">Servicio activo</span>
          </label>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingService ? 'Guardar Cambios' : 'Crear Servicio'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminServices;
