export default function ServiceFlow() {
  return (
    <div className="min-h-screen flex flex-col bg-white pt-16">
      {/* Main */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">How It Works</h1>
        <p className="text-xl text-gray-600 mb-12">A simple three-step process to get your laundry done</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-blue-600" style={{ fontSize: '40px' }}>local_shipping</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Schedule Pickup</h3>
            <p className="text-gray-600">Choose a time that works for you. We'll pick up your laundry right from your doorstep.</p>
          </div>
          
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-blue-600" style={{ fontSize: '40px' }}>water_drop</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Expert Care</h3>
            <p className="text-gray-600">Our specialists clean your clothes with premium products and fabric-specific care techniques.</p>
          </div>
          
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-blue-600" style={{ fontSize: '40px' }}>inventory_2</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Fresh Delivery</h3>
            <p className="text-gray-600">Your clothes return fresh, clean, and ready to wear. Delivered back to you in 24 hours.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to simplify your laundry?</h2>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100 font-bold">
            Book Your First Pickup
          </button>
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
