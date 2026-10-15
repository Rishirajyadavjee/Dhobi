import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Truck,
  ArrowRight,
  ChevronRight,
  Star,
  Package,
  Shirt,
  Calendar,
  Plus,
  Minus,
  Droplets,
  Check,
  ChevronDown,
  Leaf,
  MapPin,
} from 'lucide-react';

interface HomeProps {
  onLoginClick?: () => void;
}

// 4 Signature Services with authentic atelier details
const SERVICES_DATA = [
  {
    id: 'wash-fold',
    name: 'Daily Wash & Fold',
    tagline: 'Your weekly wardrobe, sorted with zero compromise.',
    price: '$2.25',
    unit: 'per lb',
    turnaround: '24 Hours',
    temperature: 'Cold / 30°C Eco Cycle',
    detergent: 'Hypoallergenic plant enzymes',
    description: 'Separated strictly into darks, whites, and colors. Washed in gentle reverse-drum cycles, tumble-dried on low heat, and folded into razor-crisp bundles ready for your drawer.',
    tags: ['Color segregation', '0% chlorine bleach', 'Crisp bundle pack', 'Scent-free available'],
    image: '/eco_packaging.jpg',
    badge: 'Most Popular',
  },
  {
    id: 'dry-clean',
    name: 'Artisan Dry Cleaning',
    tagline: 'Specialty care for wool, silks, suits, and eveningwear.',
    price: '$8.50',
    unit: 'per garment',
    turnaround: '48 Hours',
    temperature: 'Non-toxic hydrocarbon',
    detergent: 'Perc-free biodegradable solvent',
    description: 'Each piece receives an individual pre-spotting inspection, gentle liquid-CO2 or hydrocarbon cleaning, and hand-finished pressing on custom contour busts to preserve shoulder silhouette.',
    tags: ['Tailored jackets', 'Hand-steamed lapels', 'Free minor button repairs', 'Return on cedar hanger'],
    image: '/craft_detail.jpg',
    badge: 'Atelier Quality',
  },
  {
    id: 'steam-press',
    name: 'Hand Steam & Press',
    tagline: 'For business shirts and trousers that command respect.',
    price: '$3.75',
    unit: 'per shirt',
    turnaround: 'Same Day Available',
    temperature: 'High-volume dry steam',
    detergent: 'Natural organic starch (optional)',
    description: 'Eliminates fabric stress caused by commercial hot plates. We use multi-stage dry steam irons with Teflon shoes that guarantee zero surface shine or melted buttons.',
    tags: ['Collar & cuff precision', 'Zero fabric sheen', 'Folded or on wire-free hangers', 'French cuffs handled with care'],
    image: '/hero_curated.jpg',
    badge: 'Executive',
  },
  {
    id: 'delicates-linen',
    name: 'Linens, Bedding & Cashmere',
    tagline: 'Deep sanitization for duvets, heavy linens, and fine knits.',
    price: '$18.00',
    unit: 'per set',
    turnaround: '36 Hours',
    temperature: 'Ozone-sanitized gentle bath',
    detergent: 'Equestrian-grade wool wash',
    description: 'Thermal wash that eliminates 99.9% of dust mites and allergens while preserving down fluffiness and knit elasticity. Air dried flat in temperature-controlled rooms.',
    tags: ['Allergen elimination', 'Fluff-restoring tumble', 'Flat knit dry', 'King & Queen sets'],
    image: '/eco_packaging.jpg',
    badge: 'Hypoallergenic',
  },
];

// Interactive 5-Step Wardrobe Protocol
const PROTOCOL_STEPS = [
  {
    number: '01',
    title: 'Doorstep Hamper Handover',
    short: 'No weighing, no plastic bags. We give you heavy-duty canvas hampers with personalized ID tags.',
    detail: 'Our electric courier arrives at your chosen 60-minute window. You leave the hamper at your concierge, doorstep, or hand it over in seconds.',
  },
  {
    number: '02',
    title: '7-Point In-Take Fabric Audit',
    short: 'Pocket inspection, loose button check, fabric content reading, and UV stain spot tagging.',
    detail: 'Every garment is logged into your digital care sheet. We alert you via SMS if we find coins, valuables, or vulnerable embellishments.',
  },
  {
    number: '03',
    title: 'Custom Eco-Enzyme Wash',
    short: 'Tailored temperature curves and zero harsh perchloroethylene or caustic bleaches.',
    detail: 'Water is softened on-site and treated with micro-filtered ozone. Dark colors remain deep and rich; whites stay radiant without fiber damage.',
  },
  {
    number: '04',
    title: 'Teflon-Shoe Hand Press',
    short: 'Steamed on tension formers to restore original garment drape without iron glaze.',
    detail: 'Master pressers hand-finish collars, plackets, pleats, and seams. Knits and sweaters are dried flat on air mesh racks to avoid sagging.',
  },
  {
    number: '05',
    title: 'Crisp Return in Reusable Totes',
    short: 'Delivered in sealed, breathable recycled canvas garment bags, ready for your closet.',
    detail: 'Hang garments straight into your wardrobe or slide neatly organized linen bundles right into drawers. No plastic wrap mountain in your trash.',
  },
];

// Authentic Reviews
const REVIEWS = [
  {
    name: 'Dr. Elena Vance',
    role: 'Pediatric Surgeon & Wardrobe Collector',
    city: 'Mayfair',
    quote: 'Commercial laundries ruined two of my bespoke silk blouses with scorched buttons. Aura treated my wardrobe like a vintage archive. The collar pressing is razor sharp without that cheap shiny glaze.',
    rating: 5,
    tag: 'Silk & Tailored Wear',
  },
  {
    name: 'Marcus Sterling',
    role: 'Architect & Studio Principal',
    city: 'Tribeca',
    quote: 'The bag estimator is spot-on, and having the hamper picked up at 7 PM and delivered back by 6 PM the next day saves me at least 4 hours every weekend. My raw denim has never faded prematurely.',
    rating: 5,
    tag: 'Weekly Wash & Fold',
  },
  {
    name: 'Sophie & Liam Chen',
    role: 'Young Family & Eco-Living Advocates',
    city: 'Kensington',
    quote: 'Our newborn has hypersensitive skin, so regular commercial detergents were out of the question. Aura’s zero-scent plant enzyme wash is truly clean. The reusable canvas totes are such a thoughtful touch.',
    rating: 5,
    tag: 'Family & Sensitive Skin',
  },
];

// FAQs
const FAQS = [
  {
    q: 'Do I need to separate colors and delicates before collection?',
    a: 'Not at all. Place all your everyday laundry in your Aura hamper. In our sorting laboratory, certified fabric specialists individually sort items by fabric composition, color stability, and wash temperatures.',
  },
  {
    q: 'What kind of detergents and solvents do you use?',
    a: 'We use non-toxic, plant-based surfactant formulas enriched with natural enzymes (protease, amylase) that dissolve organic grime at low temperatures (30°C). For dry cleaning, we use 100% perchloroethylene-free liquid hydrocarbon and ozone technology.',
  },
  {
    q: 'How does the Doorstep Canvas Hamper system work?',
    a: 'On your very first booking, you can hand your clothes in any bag or basket. We return them inside our signature reusable heavy-duty canvas tote with your personalized brass ID tag, which becomes your permanent laundry hamper.',
  },
  {
    q: 'Can I add special instructions for persistent stains or delicate items?',
    a: 'Yes! When booking online or via your dashboard, you can leave custom notes (e.g. "treat red wine stain on left lapel" or "hang shirts, do not fold"). You can also attach photos of specific stains for our spot specialists.',
  },
  {
    q: 'What if I am not home during the delivery window?',
    a: 'You can authorize contactless delivery to your concierge, front porch, or secure parcel locker. All garments are sealed inside weatherproof, breathable outer protective covers.',
  },
];

export default function Home({ onLoginClick }: HomeProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Active state for Service Studio Tabs
  const [activeServiceId, setActiveServiceId] = useState('wash-fold');

  // Interactive Smart Calculator State
  const [bagsCount, setBagsCount] = useState(1);
  const [shirtsCount, setShirtsCount] = useState(2);
  const [suitsCount, setSuitsCount] = useState(1);

  // Active step in Protocol
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Sticky Bar visibility based on scroll
  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 480) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBookPickup = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      onLoginClick?.();
    }
  };

  // Calculator computations
  // 1 Regular Bag ≈ $32 (approx 14 lbs @ $2.25/lb)
  // 1 Pressed Shirt = $3.75
  // 1 Dry Clean Suit/Garment = $8.50
  const estimatedTotal = (bagsCount * 32.0 + shirtsCount * 3.75 + suitsCount * 8.5).toFixed(2);
  const estimatedPounds = bagsCount * 14;

  const currentService = SERVICES_DATA.find((s) => s.id === activeServiceId) || SERVICES_DATA[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F5] text-stone-800 selection:bg-slate-900 selection:text-white">
      {/* ---------------------------------------------------- */}
      {/* 1. HERO SECTION: Human Editorial Aesthetic */}
      {/* ---------------------------------------------------- */}
      <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden border-b border-stone-200/70">
        {/* Subtle background ambient warmth */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-100/40 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-blue-100/30 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Editorial Headline & Actions */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Live Status Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-100 border border-stone-200/80 text-stone-700 text-xs font-medium tracking-wide shadow-xs transition-all hover:bg-stone-200/60">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-subtle" />
                <span>Next pickup window: <strong className="font-semibold text-stone-900">Today, 5:30 PM – 7:00 PM</strong></span>
                <span className="text-stone-300">•</span>
                <span className="text-stone-500 hidden sm:inline">Free doorstep bag handover</span>
              </div>

              {/* Main Headline */}
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-slate-900 leading-[1.12] tracking-tight">
                Garment care for people who{' '}
                <span className="italic font-normal underline decoration-amber-300/80 underline-offset-6">
                  love their clothes.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-stone-600 text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
                Bespoke wash & fold, hand-finished dry cleaning, and gentle steam pressing. 
                Collected from your doorstep in reusable canvas hampers, sanitized with cold plant-enzymes, 
                and returned crisp in 24 hours.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <button
                  onClick={handleBookPickup}
                  className="inline-flex items-center justify-center gap-2.5 bg-slate-900 hover:bg-slate-800 text-white px-7 py-3.5 rounded-full font-medium text-sm tracking-wide shadow-card hover:shadow-floating transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Calendar className="w-4 h-4 text-amber-300" />
                  <span>Book Doorstep Pickup</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <a
                  href="#calculator"
                  className="inline-flex items-center justify-center gap-2 bg-stone-100 hover:bg-stone-200/80 text-stone-800 border border-stone-300/70 px-6 py-3.5 rounded-full font-medium text-sm tracking-wide transition-all duration-200"
                >
                  <span>Estimate My Laundry</span>
                  <ChevronDown className="w-4 h-4 text-stone-500" />
                </a>
              </div>

              {/* Authentic Trust Signals (Zero Generic AI Buzzwords) */}
              <div className="pt-4 grid grid-cols-3 gap-3 border-t border-stone-200/80 text-xs text-stone-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>0% Caustic Chlorine</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>7-Point Fabric Check</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Guaranteed 24h Turn</span>
                </div>
              </div>
            </div>

            {/* Right Column: Authentic Editorial Photo with Tactile Badges */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                
                {/* Main Hero Photo Card */}
                <div className="relative rounded-2xl overflow-hidden shadow-card border border-stone-200/80 bg-white group">
                  <img
                    src="/hero_curated.jpg"
                    alt="Pristine pressed garments on wooden hangers in sunlit atelier"
                    className="w-full h-[420px] object-cover object-center transition-transform duration-700 group-hover:scale-102"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />

                  {/* Overlaid caption inside photo */}
                  <div className="absolute bottom-4 left-4 right-4 text-white p-3 rounded-xl bg-slate-900/60 backdrop-blur-md border border-white/20 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold tracking-wide">Daily Wash & Fold Batch #142</p>
                      <p className="text-[11px] text-stone-300">Bergamot wash • Finished on natural oak hangers</p>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-white/20 text-white">
                      Verified
                    </span>
                  </div>
                </div>

                {/* Floating Tactile Card 1: Hand-Pressed Badge */}
                <div className="absolute -top-5 -left-4 sm:-left-6 bg-white/95 backdrop-blur-md border border-stone-200/90 rounded-xl p-3.5 shadow-floating flex items-center gap-3 animate-float-gentle max-w-[210px]">
                  <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-900">Zero-Shine Steam</p>
                    <p className="text-[10px] text-stone-500">Teflon soleplates protect silk & wool fibres</p>
                  </div>
                </div>

                {/* Floating Tactile Card 2: Live Turnaround */}
                <div className="hidden sm:flex absolute -bottom-4 -right-4 bg-white/95 backdrop-blur-md border border-stone-200/90 rounded-xl p-3.5 shadow-floating items-center gap-3 max-w-[220px]">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Doorstep Collection</p>
                    <p className="text-[10px] text-stone-500">Reusable canvas hampers delivered free</p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 2. REAL-WORLD METRICS BAR: Physical Craft Numbers */}
      {/* ---------------------------------------------------- */}
      <section className="bg-stone-100/70 border-b border-stone-200/60 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <span className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">18,400+</span>
              <p className="text-xs uppercase tracking-wider text-stone-500 font-semibold">Garments Revived This Year</p>
            </div>
            <div className="space-y-1">
              <span className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">30°C</span>
              <p className="text-xs uppercase tracking-wider text-stone-500 font-semibold">Cold-Enzyme Fiber Wash</p>
            </div>
            <div className="space-y-1">
              <span className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">0%</span>
              <p className="text-xs uppercase tracking-wider text-stone-500 font-semibold">Carcinogenic Solvents (Perc-Free)</p>
            </div>
            <div className="space-y-1">
              <span className="font-serif text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">4.96 / 5</span>
              <p className="text-xs uppercase tracking-wider text-stone-500 font-semibold">From 2,100+ Wardrobe Audits</p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 3. INTERACTIVE SERVICE STUDIO WITH SMOOTH TAB TRANSITIONS */}
      {/* ---------------------------------------------------- */}
      <section className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase font-bold tracking-widest text-stone-500 bg-stone-200/60 px-3 py-1 rounded-full">
            Our Care Menu
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-slate-900 mt-3 font-normal">
            Every garment has its own biology.
          </h2>
          <p className="text-stone-600 text-sm sm:text-base mt-3">
            Choose your care tier below. Every piece is treated in specialized machines, never mixed with external laundry.
          </p>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="flex justify-center mb-10 overflow-x-auto pb-2">
          <div className="inline-flex p-1.5 rounded-full bg-stone-200/70 border border-stone-300/60 gap-1 shadow-inner">
            {SERVICES_DATA.map((service) => {
              const isSelected = activeServiceId === service.id;
              return (
                <button
                  key={service.id}
                  onClick={() => setActiveServiceId(service.id)}
                  className={`px-4 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-medium tracking-wide transition-all duration-300 whitespace-nowrap ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-soft scale-102 font-semibold'
                      : 'text-stone-600 hover:text-slate-900 hover:bg-stone-100/60'
                  }`}
                >
                  {service.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Service Presentation Card (Smooth Switch) */}
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-card overflow-hidden transition-all duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Visual Photo preview for selected service */}
            <div className="lg:col-span-5 relative min-h-[320px] lg:min-h-full">
              <img
                key={currentService.id}
                src={currentService.image}
                alt={currentService.name}
                className="w-full h-full object-cover object-center absolute inset-0 transition-opacity duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md mb-2 inline-block">
                  {currentService.badge}
                </span>
                <h3 className="font-serif text-2xl font-bold">{currentService.name}</h3>
                <p className="text-xs text-stone-200 mt-1">{currentService.tagline}</p>
              </div>
            </div>

            {/* Detailed Content & Specs */}
            <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-8">
              <div className="space-y-6">
                
                {/* Price and turnaround header */}
                <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-stone-100 pb-5">
                  <div>
                    <span className="text-3xl sm:text-4xl font-serif font-bold text-slate-900">{currentService.price}</span>
                    <span className="text-stone-500 text-sm ml-1.5">{currentService.unit}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-stone-100 text-stone-700">
                    <Clock className="w-3.5 h-3.5 text-stone-500" />
                    <span>Turnaround: {currentService.turnaround}</span>
                  </div>
                </div>

                {/* Editorial description */}
                <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
                  {currentService.description}
                </p>

                {/* Fabric specifications grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/60">
                    <span className="text-[10px] uppercase tracking-wider text-stone-400 font-bold block mb-1">Temperature Profile</span>
                    <p className="font-semibold text-stone-800 flex items-center gap-1.5">
                      <Droplets className="w-3.5 h-3.5 text-blue-500" />
                      {currentService.temperature}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/60">
                    <span className="text-[10px] uppercase tracking-wider text-stone-400 font-bold block mb-1">Detergent Standard</span>
                    <p className="font-semibold text-stone-800 flex items-center gap-1.5">
                      <Leaf className="w-3.5 h-3.5 text-emerald-500" />
                      {currentService.detergent}
                    </p>
                  </div>
                </div>

                {/* Bullet tags */}
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-stone-400">Included In This Service:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-700">
                    {currentService.tags.map((tag, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{tag}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Action row */}
              <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
                <button
                  onClick={handleBookPickup}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-full font-medium text-xs tracking-wide shadow-soft transition-all duration-200 hover:-translate-y-0.5"
                >
                  <span>Book {currentService.name}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => navigate('/services')}
                  className="w-full sm:w-auto inline-flex items-center justify-center text-xs font-semibold text-stone-600 hover:text-slate-900 py-2.5 transition-colors"
                >
                  <span>Compare full care menu</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 4. INTERACTIVE LIVE LAUNDRY ESTIMATOR WIDGET */}
      {/* ---------------------------------------------------- */}
      <section id="calculator" className="py-20 bg-stone-100/60 border-y border-stone-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left: Explanatory Context */}
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs uppercase font-bold tracking-widest text-stone-500 bg-stone-200/80 px-3 py-1 rounded-full">
                Transparent Wardrobe Calculator
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-slate-900 font-normal">
                Never wonder what your laundry will cost.
              </h2>
              <p className="text-stone-600 text-sm leading-relaxed">
                Adjust your estimated load below. No surprise surge fees, no hidden platform surcharges, 
                and free pickup & delivery across all orders above $25.
              </p>

              <div className="pt-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold mt-0.5">✓</div>
                  <p className="text-xs text-stone-600">
                    <strong className="text-slate-900">1 Aura Hamper</strong> holds roughly 12–15 lbs (equivalent to 1 week of normal everyday shirts, t-shirts, pants, and socks).
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold mt-0.5">✓</div>
                  <p className="text-xs text-stone-600">
                    <strong className="text-slate-900">Custom Preferences:</strong> Fragrance-free hypoallergenic wash, hang dry, and double-starch options selectable during checkout.
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Interactive Calculator Card */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-card space-y-6">
                
                {/* Counter 1: Wash & Fold Hampers */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-stone-50 border border-stone-200/60 transition-colors hover:border-stone-300">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-stone-600" />
                      <span className="text-sm font-bold text-slate-900">Wash & Fold Hampers</span>
                    </div>
                    <p className="text-xs text-stone-500">~14 lbs per bag (everyday wear)</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setBagsCount(Math.max(1, bagsCount - 1))}
                      className="w-8 h-8 rounded-full border border-stone-300 bg-white hover:bg-stone-100 flex items-center justify-center text-stone-700 transition active:scale-95"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center font-bold text-base text-slate-900">{bagsCount}</span>
                    <button
                      onClick={() => setBagsCount(bagsCount + 1)}
                      className="w-8 h-8 rounded-full border border-stone-300 bg-white hover:bg-stone-100 flex items-center justify-center text-stone-700 transition active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Counter 2: Hand Pressed Shirts */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-stone-50 border border-stone-200/60 transition-colors hover:border-stone-300">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Shirt className="w-4 h-4 text-stone-600" />
                      <span className="text-sm font-bold text-slate-900">Steam-Pressed Business Shirts</span>
                    </div>
                    <p className="text-xs text-stone-500">$3.75 / shirt on wooden hangers</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShirtsCount(Math.max(0, shirtsCount - 1))}
                      className="w-8 h-8 rounded-full border border-stone-300 bg-white hover:bg-stone-100 flex items-center justify-center text-stone-700 transition active:scale-95"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center font-bold text-base text-slate-900">{shirtsCount}</span>
                    <button
                      onClick={() => setShirtsCount(shirtsCount + 1)}
                      className="w-8 h-8 rounded-full border border-stone-300 bg-white hover:bg-stone-100 flex items-center justify-center text-stone-700 transition active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Counter 3: Dry Clean Suits / Pieces */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-stone-50 border border-stone-200/60 transition-colors hover:border-stone-300">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-stone-600" />
                      <span className="text-sm font-bold text-slate-900">Dry Cleaned Pieces / Suits</span>
                    </div>
                    <p className="text-xs text-stone-500">$8.50 / tailored piece (hydrocarbon safe)</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSuitsCount(Math.max(0, suitsCount - 1))}
                      className="w-8 h-8 rounded-full border border-stone-300 bg-white hover:bg-stone-100 flex items-center justify-center text-stone-700 transition active:scale-95"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center font-bold text-base text-slate-900">{suitsCount}</span>
                    <button
                      onClick={() => setSuitsCount(suitsCount + 1)}
                      className="w-8 h-8 rounded-full border border-stone-300 bg-white hover:bg-stone-100 flex items-center justify-center text-stone-700 transition active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Live Computed Summary Box */}
                <div className="p-5 rounded-2xl bg-stone-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold block">Estimated Total</span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white">${estimatedTotal}</span>
                      <span className="text-xs text-stone-400">({estimatedPounds} lbs load + {shirtsCount + suitsCount} specialty items)</span>
                    </div>
                    <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 mt-1">
                      <CheckCircle2 className="w-3 h-3" /> Includes complimentary doorstep pickup & delivery
                    </span>
                  </div>

                  <button
                    onClick={handleBookPickup}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-slate-900 hover:bg-stone-100 px-6 py-3 rounded-full font-bold text-xs tracking-wide shadow-md transition-all active:scale-98"
                  >
                    <span>Schedule This Load</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 5. THE 5-STEP WARDROBE PROTOCOL (Interactive Step Explorer) */}
      {/* ---------------------------------------------------- */}
      <section className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase font-bold tracking-widest text-stone-500 bg-stone-200/60 px-3 py-1 rounded-full">
            The Aura Standard
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-slate-900 mt-3 font-normal">
            How we care for your garments.
          </h2>
          <p className="text-stone-600 text-sm sm:text-base mt-3">
            Click through our 5-stage laboratory and atelier workflow. Every step is designed to lengthen garment lifespan by 300%.
          </p>
        </div>

        {/* Step Indicator Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-8">
          {PROTOCOL_STEPS.map((step, idx) => {
            const isSelected = activeStepIndex === idx;
            return (
              <button
                key={idx}
                onClick={() => setActiveStepIndex(idx)}
                className={`p-4 rounded-2xl text-left border transition-all duration-300 relative ${
                  isSelected
                    ? 'bg-white border-slate-900 shadow-card ring-1 ring-slate-900'
                    : 'bg-stone-100/70 border-stone-200 hover:bg-stone-200/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-serif font-bold ${isSelected ? 'text-slate-900' : 'text-stone-400'}`}>
                    {step.number}
                  </span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-slate-900" />
                  )}
                </div>
                <h4 className={`text-xs font-bold leading-tight ${isSelected ? 'text-slate-900' : 'text-stone-600'}`}>
                  {step.title}
                </h4>
              </button>
            );
          })}
        </div>

        {/* Active Step Highlight Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-stone-200/90 shadow-card transition-all duration-300">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full">
                <span>Phase {PROTOCOL_STEPS[activeStepIndex].number} of 05</span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl text-slate-900">
                {PROTOCOL_STEPS[activeStepIndex].title}
              </h3>
              <p className="text-stone-700 text-base font-medium leading-relaxed">
                {PROTOCOL_STEPS[activeStepIndex].short}
              </p>
              <p className="text-stone-500 text-sm leading-relaxed">
                {PROTOCOL_STEPS[activeStepIndex].detail}
              </p>
            </div>

            <div className="md:col-span-4 bg-stone-50 rounded-2xl p-6 border border-stone-200/60 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Fabric Protection Guarantee</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                If any garment suffers damage, shrinkage, or button loss under our care, we restore or reimburse at full retail valuation within 48 hours.
              </p>
              <div className="pt-2">
                <button
                  onClick={handleBookPickup}
                  className="w-full py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition"
                >
                  Schedule Initial In-Take
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 6. REAL WARDROBE STORIES & VERIFIED REVIEWS */}
      {/* ---------------------------------------------------- */}
      <section className="py-20 bg-stone-100/50 border-y border-stone-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase font-bold tracking-widest text-stone-500 bg-stone-200/60 px-3 py-1 rounded-full">
              Wardrobe Testimonials
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-slate-900 mt-3 font-normal">
              Trusted by those who cherish fine textiles.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {REVIEWS.map((rev, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl p-8 border border-stone-200/80 shadow-soft hover:shadow-card transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex text-amber-500">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 bg-stone-100 px-2.5 py-1 rounded-full">
                      {rev.tag}
                    </span>
                  </div>

                  <p className="text-stone-700 text-sm leading-relaxed italic">
                    "{rev.quote}"
                  </p>
                </div>

                <div className="pt-6 border-t border-stone-100 mt-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center font-serif font-bold text-slate-900 text-sm">
                    {rev.name.charAt(0)}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">{rev.name}</h5>
                    <p className="text-[11px] text-stone-500">{rev.role} • {rev.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 7. FREQUENTLY ASKED QUESTIONS (Smooth Accordion) */}
      {/* ---------------------------------------------------- */}
      <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center mb-12">
          <span className="text-xs uppercase font-bold tracking-widest text-stone-500 bg-stone-200/60 px-3 py-1 rounded-full">
            Clarifications
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-slate-900 mt-3 font-normal">
            Common questions about our laundry service.
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl border border-stone-200/80 bg-white overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-slate-900 hover:bg-stone-50 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-stone-400 shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-slate-900' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-stone-600 text-xs sm:text-sm leading-relaxed border-t border-stone-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 8. EDITORIAL CALL TO ACTION */}
      {/* ---------------------------------------------------- */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white p-8 sm:p-14 lg:p-16 border border-slate-800 shadow-floating">
          
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-6">
            <span className="text-[11px] uppercase tracking-widest text-amber-300 font-bold bg-white/10 px-3 py-1 rounded-full">
              Begin Your Laundry Upgrade
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal leading-tight text-white">
              Get back 5 hours of your week. We will handle the hampers.
            </h2>
            <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
              Book your first pickup in 60 seconds. Our courier will deliver your personalized canvas hamper at your door today.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                onClick={handleBookPickup}
                className="inline-flex items-center justify-center gap-2 bg-white text-slate-900 hover:bg-stone-100 px-8 py-4 rounded-full font-bold text-sm tracking-wide shadow-lg transition-all duration-200 hover:-translate-y-0.5"
              >
                <span>Schedule Your First Pickup</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <span className="text-xs text-stone-400 text-center sm:text-left">
                No subscription required • Pay per hamper
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 9. STICKY BOTTOM QUICK-BOOKING RIBBON (Smooth Appearance) */}
      {/* ---------------------------------------------------- */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-40 p-4 transition-all duration-500 transform ${
          showStickyBar ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="max-w-4xl mx-auto bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-3 sm:px-6 sm:py-3.5 border border-slate-700 shadow-floating flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse-subtle shrink-0" />
            <div className="text-xs">
              <p className="font-bold text-white">Next pickup slot: Today 5:30 PM</p>
              <p className="text-stone-300 hidden sm:block">Doorstep hamper delivery included</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBookPickup}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-4 py-2 rounded-full text-xs tracking-wide transition-all shadow-sm active:scale-95"
            >
              Book Pickup Now
            </button>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 10. REFINED FOOTER */}
      {/* ---------------------------------------------------- */}
      <footer className="bg-stone-900 text-stone-400 pt-16 pb-12 border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            
            {/* Brand column */}
            <div className="col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-slate-900 font-serif font-bold text-sm">
                  A
                </div>
                <span className="font-serif text-xl font-bold text-white tracking-tight">Aura</span>
              </div>
              <p className="text-xs text-stone-400 max-w-sm leading-relaxed">
                Dedicated garment care atelier combining traditional hand-pressing techniques with modern plant-enzyme ozone washing.
              </p>
              <div className="flex items-center gap-2 text-xs text-stone-400">
                <MapPin className="w-3.5 h-3.5 text-stone-500" />
                <span>Flagship Atelier & Laboratory: 14 Textile Way, London / NY</span>
              </div>
            </div>

            {/* Column 2 */}
            <div>
              <h5 className="text-xs uppercase font-bold tracking-wider text-white mb-3">Care Services</h5>
              <ul className="space-y-2 text-xs">
                <li><button onClick={() => navigate('/services')} className="hover:text-white transition">Daily Wash & Fold</button></li>
                <li><button onClick={() => navigate('/services')} className="hover:text-white transition">Artisan Dry Clean</button></li>
                <li><button onClick={() => navigate('/services')} className="hover:text-white transition">Hand Steam Press</button></li>
                <li><button onClick={() => navigate('/services')} className="hover:text-white transition">Bedding & Linens</button></li>
              </ul>
            </div>

            {/* Column 3 */}
            <div>
              <h5 className="text-xs uppercase font-bold tracking-wider text-white mb-3">Company</h5>
              <ul className="space-y-2 text-xs">
                <li><button onClick={() => navigate('/about')} className="hover:text-white transition">Our Story & Craft</button></li>
                <li><button onClick={() => navigate('/about')} className="hover:text-white transition">Detergent Standards</button></li>
                <li><button onClick={() => navigate('/services')} className="hover:text-white transition">Pricing & Hampers</button></li>
                <li><button onClick={() => navigate('/about')} className="hover:text-white transition">Contact Atelier</button></li>
              </ul>
            </div>

            {/* Column 4 */}
            <div>
              <h5 className="text-xs uppercase font-bold tracking-wider text-white mb-3">Customer Care</h5>
              <ul className="space-y-2 text-xs">
                <li><span className="block text-stone-400">Mon – Sat: 7:00 AM – 9:00 PM</span></li>
                <li><span className="block text-stone-400">Sunday: 8:00 AM – 6:00 PM</span></li>
                <li><span className="block text-amber-300 font-medium mt-2">support@aura-garment.com</span></li>
              </ul>
            </div>

          </div>

          <div className="pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
            <p>&copy; {new Date().getFullYear()} Aura Garment Care Atelier. Handcrafted with care.</p>
            <div className="flex gap-6">
              <span className="hover:text-stone-300 cursor-pointer">Privacy Protocol</span>
              <span className="hover:text-stone-300 cursor-pointer">Terms of Service</span>
              <span className="hover:text-stone-300 cursor-pointer">Fabric Warranty</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
