export default function Services() {
  return (
    <div className="min-h-screen flex flex-col bg-white pt-16">
      {/* Header */}
      <section className="max-w-6xl mx-auto px-6 py-16 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">Our Services</h1>
        <p className="text-xl text-gray-600">Simple, transparent pricing for all your laundry needs</p>
      </section>

      {/* Services Grid */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: 'Wash & Fold',
              price: '$2.50',
              unit: 'per lb',
              desc: 'Everyday laundry done right',
              features: ['Eco-friendly detergents', 'Color & fabric sorting', 'Precision folding']
            },
            {
              title: 'Dry Cleaning',
              price: 'From $8',
              unit: 'per item',
              desc: 'Professional care for special pieces',
              features: ['Chemical-free solvents', 'Hand-finished pressing', 'Minor repairs included'],
              featured: true
            },
            {
              title: 'Specialty Care',
              price: 'Custom',
              unit: 'Quote',
              desc: 'Silk, wool, and delicate fabrics',
              features: ['Cold water hand wash', 'Flat air drying', 'Specialized fiber treatments']
            }
          ].map((service, idx) => (
            <div key={idx} className={`rounded-xl overflow-hidden ${service.featured ? 'border-2 border-blue-600' : 'border border-gray-200'} transition hover:shadow-xl`}>
              <div className={`${service.featured ? 'bg-blue-600' : 'bg-gray-100'} h-40 flex items-center justify-center`}>
                <span style={{ fontSize: '60px' }}>
                  {service.title === 'Wash & Fold' && '👕'}
                  {service.title === 'Dry Cleaning' && '🥼'}
                  {service.title === 'Specialty Care' && '👗'}
                </span>
              </div>
              
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{service.title}</h3>
                <p className="text-gray-600 mb-6">{service.desc}</p>
                
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-blue-600">{service.price}</span>
                    <span className="text-gray-600">{service.unit}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {service.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-blue-600 text-sm mt-1" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button className={`w-full py-3 rounded-lg font-bold transition ${
                  service.featured 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}>
                  Select Service
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 mt-auto">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p>&copy; 2024 Aura. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
