import { useNavigate } from 'react-router-dom';
import { Leaf, Sparkles, ArrowRight } from 'lucide-react';

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F5] text-stone-800 pt-24 pb-16">
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-16 text-center space-y-4">
        <span className="text-xs uppercase font-bold tracking-widest text-stone-500 bg-stone-200/60 px-3.5 py-1 rounded-full">
          The Atelier Philosophy
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-slate-900 tracking-tight">
          A Return to Gentle Garment Care
        </h1>
        <p className="text-base sm:text-lg text-stone-600 max-w-2xl mx-auto font-normal leading-relaxed">
          Most commercial laundries treat clothes as disposable industrial bulk. We built Aura to treat clothing as heirloom craftsmanship.
        </p>
      </section>

      {/* Story Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <h2 className="font-serif text-3xl sm:text-4xl text-slate-900">
              Why commercial laundromats wear out your wardrobe
            </h2>
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
              Standard laundromats wash at boiling temperatures with aggressive sodium hypochlorite and harsh spinning. 
              The result: weakened fibers, faded dyes, curled collars, and missing buttons.
            </p>
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
              At Aura, we recalibrate water chemistry and use cold-active botanical enzymes that target protein and lipid stains without stripping natural wool lanolin or degrading organic cotton fibers.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-soft">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2">
                  <Leaf className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wide">Botanical Chemistry</h4>
                <p className="text-xs text-stone-500 mt-1">100% hypoallergenic plant enzymes and zero perchloroethylene solvents.</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-soft">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center mb-2">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wide">Teflon Hand Press</h4>
                <p className="text-xs text-stone-500 mt-1">No scorching, no shiny iron streaks, finished by master garment technicians.</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-3xl overflow-hidden shadow-card border border-stone-200/90 relative">
              <img
                src="/craft_detail.jpg"
                alt="Master pressing garments with steam"
                className="w-full h-[450px] object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-6 left-6 right-6 text-white p-4 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-white/20">
                <p className="font-serif text-lg font-bold">Master Steam Formers</p>
                <p className="text-xs text-stone-200">Preserving shoulder line drape and silhouette without fabric stress</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="bg-stone-100/60 border-y border-stone-200/70 py-16 my-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl sm:text-4xl text-slate-900 text-center mb-12">
            The 5 Commitments We Make to Every Garment
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { num: '01', title: 'Fabric Audit', desc: 'Detailed pocket and seam inspection' },
              { num: '02', title: 'Targeted Spotting', desc: 'Pre-treated by hand for stain extraction' },
              { num: '03', title: 'Ozone Sanitized', desc: 'Gentle low-temperature micro-wash' },
              { num: '04', title: 'Teflon Press', desc: 'High-volume dry steam finishing' },
              { num: '05', title: 'Canvas Totes', desc: 'Returned in breathable garment hampers' },
            ].map((step, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-soft text-center">
                <span className="font-serif text-xl font-bold text-slate-900 block mb-1">{step.num}</span>
                <h4 className="text-xs font-bold text-slate-900 mb-1">{step.title}</h4>
                <p className="text-[11px] text-stone-500 leading-normal">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-12 text-center space-y-6">
        <h3 className="font-serif text-3xl text-slate-900">Experience wardrobe care as it should be.</h3>
        <p className="text-stone-600 text-sm max-w-xl mx-auto">
          Schedule your first pickup today. We bring the hamper, treat your clothes with respect, and deliver them back fragrant and ready for your closet.
        </p>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-7 py-3.5 rounded-full font-medium text-xs tracking-wide shadow-soft transition hover:-translate-y-0.5"
        >
          <span>Schedule Doorstep Pickup</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </section>
    </div>
  );
}
