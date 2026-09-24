export default function About() {
  return (
    <div className="min-h-screen flex flex-col bg-white pt-16">
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">Our Story</h1>
        <p className="text-xl text-gray-600 max-w-3xl">
          At Aura, we believe that quality laundry care shouldn't be a chore. We're committed to delivering premium service that respects both your time and your garments.
        </p>
      </section>

      {/* Section 1 */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Why Aura</h2>
            <p className="text-lg text-gray-600 mb-4">
              Founded with a simple mission: to transform laundry from a tedious chore into a seamless part of your lifestyle.
            </p>
            <p className="text-lg text-gray-600 mb-6">
              We combine generations of textile expertise with modern technology to ensure your clothes are treated with the care they deserve.
            </p>
            <div className="space-y-4">
              <div className="flex gap-4">
                <span className="material-symbols-outlined text-blue-600 flex-shrink-0">eco</span>
                <div>
                  <h4 className="font-bold text-gray-900">Eco-Conscious</h4>
                  <p className="text-gray-600">Sustainable practices for a better future</p>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="material-symbols-outlined text-blue-600 flex-shrink-0">schedule</span>
                <div>
                  <h4 className="font-bold text-gray-900">Time-Saving</h4>
                  <p className="text-gray-600">Convenient pickup and delivery options</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-gray-50 rounded-2xl h-96 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-5xl">🧺</span>
              </div>
              <p className="text-gray-600 font-medium">Quality & Care</p>
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Our Process</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {[
            { step: '1', title: 'Inspected', desc: 'Detailed check & catalog' },
            { step: '2', title: 'Treated', desc: 'Stain & spot treatment' },
            { step: '3', title: 'Cleaned', desc: 'Expert washing' },
            { step: '4', title: 'Pressed', desc: 'Professional finishing' },
            { step: '5', title: 'Protected', desc: 'Quality packaged' }
          ].map((item, idx) => (
            <div key={idx} className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-3">
                {item.step}
              </div>
              <h4 className="font-bold text-gray-900 mb-1">{item.title}</h4>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="bg-blue-600 text-white py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">Our Commitment</h2>
          <p className="text-xl opacity-90 max-w-3xl mx-auto">
            "We're committed to providing exceptional service that makes a difference in your daily life. Your satisfaction is our success."
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-blue-600">5000+</div>
            <p className="text-gray-600 mt-2">Happy Customers</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-600">99%</div>
            <p className="text-gray-600 mt-2">Satisfaction</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-600">24hrs</div>
            <p className="text-gray-600 mt-2">Turnaround</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-600">10yrs</div>
            <p className="text-gray-600 mt-2">Experience</p>
          </div>
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
