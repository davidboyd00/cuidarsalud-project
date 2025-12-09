import { useState, useEffect } from 'react';
import { Save, RefreshCw } from 'lucide-react';
import { Button, Input, Loading } from '../../components/common';
import { contentAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AdminContent = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('hero');
  const [content, setContent] = useState({
    hero: {
      badge: '',
      title: '',
      titleHighlight: '',
      description: '',
      primaryButton: '',
      secondaryButton: '',
      phone: '',
      stats: [
        { number: '', label: '' },
        { number: '', label: '' },
        { number: '', label: '' },
      ],
    },
    about: {
      subtitle: '',
      title: '',
      description: '',
      features: ['', '', '', ''],
    },
    contact: {
      subtitle: '',
      title: '',
      description: '',
      email: '',
      phone: '',
      address: '',
      hours: '',
    },
  });

  const tabs = [
    { id: 'hero', label: 'Sección Hero' },
    { id: 'about', label: 'Sobre Nosotros' },
    { id: 'contact', label: 'Contacto' },
  ];

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const response = await contentAPI.getAll('home');
      const data = response.data.data;
      
      setContent({
        hero: data.hero || content.hero,
        about: data.about || content.about,
        contact: data.contact || content.contact,
      });
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        contentAPI.update('hero', { section: 'home', content: content.hero }),
        contentAPI.update('about', { section: 'home', content: content.about }),
        contentAPI.update('contact', { section: 'home', content: content.contact }),
      ]);
      toast.success('Contenido guardado exitosamente');
    } catch (error) {
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const updateContent = (section, field, value) => {
    setContent((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const updateStat = (index, field, value) => {
    const newStats = [...content.hero.stats];
    newStats[index] = { ...newStats[index], [field]: value };
    updateContent('hero', 'stats', newStats);
  };

  const updateFeature = (index, value) => {
    const newFeatures = [...content.about.features];
    newFeatures[index] = value;
    updateContent('about', 'features', newFeatures);
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Contenido del Sitio</h1>
          <p className="text-slate-500">Edita el contenido de la página principal</p>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={fetchContent} leftIcon={<RefreshCw className="w-4 h-4" />}>
            Recargar
          </Button>
          <Button onClick={handleSave} isLoading={saving} leftIcon={<Save className="w-4 h-4" />}>
            Guardar Todo
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Hero Content */}
      {activeTab === 'hero' && (
        <div className="card space-y-6">
          <h2 className="text-lg font-semibold text-slate-800">Sección Principal (Hero)</h2>
          
          <Input
            label="Badge/Etiqueta"
            placeholder="Atención 24/7 a Domicilio"
            value={content.hero.badge}
            onChange={(e) => updateContent('hero', 'badge', e.target.value)}
          />

          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Título Principal"
              placeholder="Cuidado profesional de enfermería en"
              value={content.hero.title}
              onChange={(e) => updateContent('hero', 'title', e.target.value)}
            />
            <Input
              label="Título Destacado"
              placeholder="la comodidad de tu hogar"
              value={content.hero.titleHighlight}
              onChange={(e) => updateContent('hero', 'titleHighlight', e.target.value)}
            />
          </div>

          <div>
            <label className="label">Descripción</label>
            <textarea
              className="input min-h-[100px] resize-none"
              placeholder="Descripción del servicio..."
              value={content.hero.description}
              onChange={(e) => updateContent('hero', 'description', e.target.value)}
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <Input
              label="Botón Principal"
              placeholder="Agendar Ahora"
              value={content.hero.primaryButton}
              onChange={(e) => updateContent('hero', 'primaryButton', e.target.value)}
            />
            <Input
              label="Botón Secundario"
              placeholder="Conocer Más"
              value={content.hero.secondaryButton}
              onChange={(e) => updateContent('hero', 'secondaryButton', e.target.value)}
            />
            <Input
              label="Teléfono"
              placeholder="+56 9 1234 5678"
              value={content.hero.phone}
              onChange={(e) => updateContent('hero', 'phone', e.target.value)}
            />
          </div>

          <div>
            <label className="label mb-3">Estadísticas</label>
            <div className="grid md:grid-cols-3 gap-4">
              {content.hero.stats.map((stat, index) => (
                <div key={index} className="bg-slate-50 rounded-xl p-4 space-y-3">
                  <Input
                    placeholder="500+"
                    value={stat.number}
                    onChange={(e) => updateStat(index, 'number', e.target.value)}
                  />
                  <Input
                    placeholder="Pacientes Atendidos"
                    value={stat.label}
                    onChange={(e) => updateStat(index, 'label', e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* About Content */}
      {activeTab === 'about' && (
        <div className="card space-y-6">
          <h2 className="text-lg font-semibold text-slate-800">Sección Sobre Nosotros</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Subtítulo"
              placeholder="Sobre Nosotros"
              value={content.about.subtitle}
              onChange={(e) => updateContent('about', 'subtitle', e.target.value)}
            />
            <Input
              label="Título"
              placeholder="Cuidamos de ti como si fueras de nuestra familia"
              value={content.about.title}
              onChange={(e) => updateContent('about', 'title', e.target.value)}
            />
          </div>

          <div>
            <label className="label">Descripción</label>
            <textarea
              className="input min-h-[120px] resize-none"
              placeholder="Descripción sobre la empresa..."
              value={content.about.description}
              onChange={(e) => updateContent('about', 'description', e.target.value)}
            />
          </div>

          <div>
            <label className="label mb-3">Características</label>
            <div className="space-y-3">
              {content.about.features.map((feature, index) => (
                <Input
                  key={index}
                  placeholder={`Característica ${index + 1}`}
                  value={feature}
                  onChange={(e) => updateFeature(index, e.target.value)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Contact Content */}
      {activeTab === 'contact' && (
        <div className="card space-y-6">
          <h2 className="text-lg font-semibold text-slate-800">Sección Contacto</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Subtítulo"
              placeholder="Contáctanos"
              value={content.contact.subtitle}
              onChange={(e) => updateContent('contact', 'subtitle', e.target.value)}
            />
            <Input
              label="Título"
              placeholder="Estamos aquí para ayudarte"
              value={content.contact.title}
              onChange={(e) => updateContent('contact', 'title', e.target.value)}
            />
          </div>

          <div>
            <label className="label">Descripción</label>
            <textarea
              className="input min-h-[80px] resize-none"
              placeholder="Descripción de contacto..."
              value={content.contact.description}
              onChange={(e) => updateContent('contact', 'description', e.target.value)}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Email"
              placeholder="contacto@cuidarsalud.com"
              value={content.contact.email}
              onChange={(e) => updateContent('contact', 'email', e.target.value)}
            />
            <Input
              label="Teléfono"
              placeholder="+56 9 1234 5678"
              value={content.contact.phone}
              onChange={(e) => updateContent('contact', 'phone', e.target.value)}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Dirección"
              placeholder="Santiago, Chile"
              value={content.contact.address}
              onChange={(e) => updateContent('contact', 'address', e.target.value)}
            />
            <Input
              label="Horario"
              placeholder="Lunes a Domingo, 24 horas"
              value={content.contact.hours}
              onChange={(e) => updateContent('contact', 'hours', e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContent;
