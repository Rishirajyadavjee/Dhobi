import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Check, ArrowRight, Sparkles, Clock, ShieldCheck, Leaf } from 'lucide-react';

export default function Services() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSelectService = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  };

  const services = [
    {
      title: 'Daily Wash & Fold',
      price: '$2.25',
      unit: 'per lb',
      desc: 'Separated strictly by light and dark. Cold-enzyme plant wash and hand-folded into crisp bundles.',
      image: '/eco_packaging.jpg',
      features: [
        'Color & fiber segregation',
        'Plant-based enzyme detergents',
        '0% chlorine bleach or phthalates',
        'Precision folded for drawer storage',
        'Complimentary canvas hamper on return'
      ],
      featured: false,
    },
    {
      title: 'Artisan Dry Cleaning',
      price: 'From $8.50',
      unit: 'per garment',
      desc: 'Individual inspection, hydrocarbon gentle cleaning, and contour steam finishing on custom busts.',
      image: '/craft_detail.jpg',
      features: [
        '100% perc-free green cleaning',
        'Hand-finished lapels and cuffs',
        'Delicate lining spot inspection',
        'Free button tightening & minor repairs',
        'Delivered on natural cedar hangers'
      ],
      featured: true,
    },
    {
      title: 'Executive Steam Press',
      price: '$3.75',
      unit: 'per shirt',
      desc: 'High-volume dry steam with Teflon-coated soleplates for razor-sharp creases without shiny fabric glaze.',
      image: '/hero_curated.jpg',
      features: [
        'Collar stay reinforcement',
        'Zero glaze or iron sheen',
        'Folded or on wire-free hangers',
        'Touch-up hand brushing included',
        'Turnaround in as fast as 12 hours'
      ],
      featured: false,
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F5] text-stone-800 pt-24 pb-16">
      {/* Header */}
      <section className="max-w-5xl mx-auto px-6 py-12 text-center space-y-4">
        <span className="text-xs uppercase font-bold tracking-widest text-stone-500 bg-stone-200/60 px-3.5 py-1 rounded-full">
          Transparent Care Menu
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-slate-900 tracking-tight">
          Bespoke Garment Pricing
        </h1>
        <p className="text-base sm:text-lg text-stone-600 max-w-2xl mx-auto font-normal">
          No surge multipliers, no hidden delivery fees for hampers above $25. Every load is sanitized separately with zero batch mingling.
        </p>
      </section>

      {/* Services Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, idx) => (
            <div
              key={idx}
              className={`rounded-3xl overflow-hidden bg-white border transition-all duration-300 hover:shadow-card flex flex-col justify-between ${
                service.featured
                  ? 'border-slate-900 shadow-card ring-1 ring-slate-900'
                  : 'border-stone-200/90 shadow-soft'
              }`}
            >
              <div>
                <div className="relative h-48 overflow-hidden bg-stone-100">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
                  {service.featured && (
                    <div className="absolute top-4 right-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-white text-[11px] font-bold tracking-wide uppercase shadow-sm">
                        <Sparkles className="w-3 h-3 text-amber-300" />
                        Signature Tier
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-4 left-5 text-white">
                    <h3 className="font-serif text-2xl font-bold">{service.title}</h3>
                  </div>
                </div>

                <div className="p-6 sm:p-8 space-y-6">
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                    {service.desc}
                  </p>

                  <div className="border-t border-b border-stone-100 py-4">
                    <div className="flex items-baseline gap-2">
                      <span className="font-serif text-3xl font-bold text-slate-900">{service.price}</span>
                      <span className="text-xs text-stone-500 font-medium">{service.unit}</span>
                    </div>
                  </div>

                  <ul className="space-y-3">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-stone-700">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-6 sm:p-8 pt-0">
                <button
                  onClick={handleSelectService}
                  className={`w-full py-3.5 rounded-full font-bold text-xs tracking-wide transition-all duration-200 flex items-center justify-center gap-2 ${
                    service.featured
                      ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-soft hover:-translate-y-0.5'
                      : 'bg-stone-100 text-slate-900 hover:bg-stone-200/80 border border-stone-300/60'
                  }`}
                >
                  <span>Select & Schedule</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Guarantees Bar */}
      <section className="max-w-5xl mx-auto px-6 py-8 border-t border-stone-200/80">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-xs text-stone-600">
          <div className="flex items-center justify-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>Guaranteed 24-48 Hour Turnaround</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% Zero-Loss Protection Warranty</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Leaf className="w-4 h-4 text-emerald-600" />
            <span>100% Non-Toxic Biodegradable Solvents</span>
          </div>
        </div>
      </section>
    </div>
  );
}
