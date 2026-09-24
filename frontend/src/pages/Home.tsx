import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface HomeProps {
  onLoginClick?: () => void;
}

export default function Home({ onLoginClick }: HomeProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleBookPickup = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      onLoginClick?.();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white pt-16">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Your laundry,<br />our priority
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Professional laundry service delivered to your doorstep. Trusted by thousands of customers.
          </p>
          <div className="flex gap-4 flex-col sm:flex-row">
            <button onClick={handleBookPickup} className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-medium">
              Book Now
            </button>
            <button onClick={() => navigate('/services')} className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 font-medium">
              See Pricing
            </button>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-gray-50 rounded-2xl h-96 flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-5xl">🧺</span>
            </div>
            <p className="text-gray-600 font-medium">Professional Laundry Care</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-gray-900 mb-16 text-center">How it works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: 'local_shipping', title: 'Pickup', desc: 'Schedule a pickup at your convenience' },
              { icon: 'water_drop', title: 'Care', desc: 'Expert cleaning with premium materials' },
              { icon: 'check_circle', title: 'Delivery', desc: 'Fresh clothes delivered back to you' }
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-8 rounded-xl border border-gray-200 hover:shadow-lg transition">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-blue-600">{item.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-blue-600">5000+</div>
            <p className="text-gray-600 mt-2">Happy Customers</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-600">99%</div>
            <p className="text-gray-600 mt-2">Satisfaction Rate</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-blue-600">24hrs</div>
            <p className="text-gray-600 mt-2">Quick Turnaround</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-xl mb-8 opacity-90">Join thousands of customers enjoying premium laundry service</p>
          <button onClick={handleBookPickup} className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100 font-bold">
            Book Your First Pickup
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-bold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><button onClick={() => navigate('/services')} className="hover:text-white cursor-pointer">Services</button></li>
                <li><button onClick={() => navigate('/services')} className="hover:text-white cursor-pointer">Pricing</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><button onClick={() => navigate('/about')} className="hover:text-white cursor-pointer">About</button></li>
                <li><button onClick={() => navigate('/about')} className="hover:text-white cursor-pointer">Contact</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Social</h4>
              <ul className="space-y-2">
                <li><button className="hover:text-white cursor-pointer">Instagram</button></li>
                <li><button className="hover:text-white cursor-pointer">Facebook</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><button className="hover:text-white cursor-pointer">Privacy</button></li>
                <li><button className="hover:text-white cursor-pointer">Terms</button></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center">
            <p>&copy; 2024 Aura. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
