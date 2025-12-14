
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, ShieldCheck, Clock, Star } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { HeroSlider } from '../components/HeroSlider';

export const HomePage = () => {
  const { products } = useStore();
  const featuredProducts = products.slice(0, 3);

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section - Full Width Slider */}
      <div className="-mt-8 -mx-4 sm:-mx-6 lg:-mx-8 shadow-2xl">
        <HeroSlider />
      </div>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4 max-w-7xl mx-auto">
        {[
          { icon: Truck, title: 'Free Worldwide Shipping', desc: 'On all orders over $500' },
          { icon: ShieldCheck, title: 'Secure Payment', desc: '100% secure payment gateway' },
          { icon: Clock, title: '24/7 Support', desc: 'Dedicated support anytime' },
        ].map((feature, idx) => (
          <div key={idx} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300 text-center group hover:-translate-y-1">
            <div className="inline-flex p-4 bg-blue-50 text-blue-600 rounded-2xl mb-4 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
              <feature.icon className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
            <p className="text-gray-500">{feature.desc}</p>
          </div>
        ))}
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-end mb-8 px-2 border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
            <p className="text-gray-500 mt-2">Top picks for you this week</p>
          </div>
          <Link to="/shop" className="text-blue-600 font-semibold hover:text-blue-800 flex items-center gap-1 transition-colors duration-300 group">
            View All <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Testimonial/Trust Section */}
      <div className="max-w-7xl mx-auto px-4">
        <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-gray-900 text-white rounded-3xl p-12 text-center shadow-2xl relative overflow-hidden transition-all duration-500 hover:shadow-blue-900/50">
          {/* Decorative subtle background pattern */}
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
          
          <div className="relative z-10">
            <div className="flex justify-center gap-1 mb-6">
              {[1, 2, 3, 4, 5].map((_, i) => (
                <Star key={i} className="h-6 w-6 text-yellow-400 fill-current drop-shadow-md animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
              ))}
            </div>
            <h2 className="text-2xl md:text-4xl font-bold mb-6 leading-tight">"The strongest furniture I've ever owned."</h2>
            <p className="text-blue-100 mb-10 text-lg">Trusted by over 50,000 happy customers worldwide.</p>
            <div className="flex justify-center items-center gap-4">
              <img src="https://ui-avatars.com/api/?name=Alex+Doe&background=0A1AFF&color=fff" alt="Customer" className="h-14 w-14 rounded-full border-4 border-blue-500/50 transition-transform duration-300 hover:scale-110" />
              <div className="text-left">
                <p className="font-bold text-white text-lg">Alex Doe</p>
                <p className="text-sm text-blue-200">Verified Buyer</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
