import React from 'react';
import { CheckCircle2, Leaf, ShieldCheck, Heart, Users } from 'lucide-react';

export const AboutPage = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-16 py-8">
      {/* Header */}
      <div className="text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">About Deepak Steel Udyog</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed">
          A trusted name in iron furniture manufacturing for over 30 years. Blending traditional craftsmanship with modern durability.
        </p>
        <div className="inline-block bg-blue-50 border border-blue-100 rounded-xl px-8 py-4 mt-4 shadow-sm">
          <p className="text-blue-900 font-semibold italic text-lg">
            "Jo aaj kharide, kal ki pehchaan bane — Built to Last for Generations."
          </p>
        </div>
      </div>

      {/* Image Banner */}
      <div className="rounded-3xl overflow-hidden shadow-2xl h-64 md:h-[400px] w-full relative">
        <img 
          src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=2000&q=80" 
          alt="Iron Workshop" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-950/90 to-transparent flex items-end">
          <div className="p-10 text-white">
            <h2 className="text-3xl font-bold mb-2">30 Years of Excellence</h2>
            <p className="font-light text-blue-200">Established 1994 | Fatehpur Shekhawati</p>
          </div>
        </div>
      </div>

      {/* History & Vision */}
      <div className="grid md:grid-cols-2 gap-12 items-start">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3 border-l-4 border-blue-600 pl-4">
             <ShieldCheck className="h-6 w-6 text-blue-600" />
             Our Story
          </h2>
          <p className="text-gray-600 leading-relaxed text-lg">
            Deepak Steel Udyog is more than just a furniture manufacturer; we are a legacy. Proudly serving the market for over three decades, we specialize in delivering high-quality iron products with superior finishing, a royal touch, and long-lasting durability.
          </p>
          <p className="text-gray-600 leading-relaxed text-lg">
            Our focus has always been customer satisfaction, blending modern design with robust materials to create products that stand the test of time.
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-gray-900 to-blue-950 text-white p-8 rounded-2xl shadow-xl relative overflow-hidden">
           <div className="absolute top-0 right-0 p-32 bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
           <h3 className="text-2xl font-bold mb-6 relative z-10 border-b border-blue-800 pb-4">Why Choose Us?</h3>
           <ul className="space-y-5 relative z-10">
             <li className="flex gap-4">
               <div className="p-1.5 bg-blue-600 rounded-lg h-fit mt-1 shadow-lg shadow-blue-600/30"><Leaf className="h-4 w-4 text-white" /></div>
               <div>
                 <h4 className="font-bold text-lg">Eco-Friendly & Sustainable</h4>
                 <p className="text-gray-300 text-sm mt-1">We use recyclable materials. Iron furniture saves trees and protects the environment.</p>
               </div>
             </li>
             <li className="flex gap-4">
               <div className="p-1.5 bg-blue-600 rounded-lg h-fit mt-1 shadow-lg shadow-blue-600/30"><ShieldCheck className="h-4 w-4 text-white" /></div>
               <div>
                 <h4 className="font-bold text-lg">Built for Generations</h4>
                 <p className="text-gray-300 text-sm mt-1">Our mission is to deliver products with long life and minimal maintenance.</p>
               </div>
             </li>
             <li className="flex gap-4">
               <div className="p-1.5 bg-blue-600 rounded-lg h-fit mt-1 shadow-lg shadow-blue-600/30"><Heart className="h-4 w-4 text-white" /></div>
               <div>
                 <h4 className="font-bold text-lg">Royal Finish</h4>
                 <p className="text-gray-300 text-sm mt-1">Superior aesthetics that add a touch of luxury to your home.</p>
               </div>
             </li>
           </ul>
        </div>
      </div>

      {/* Leadership / Founders */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">Leadership</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Founder 1 */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-center group">
            <div className="w-24 h-24 bg-blue-50 rounded-full mx-auto mb-4 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
               <Users className="h-10 w-10 text-blue-400 group-hover:text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Shiv Kumar Dhanuka</h3>
            <p className="text-blue-600 font-bold mb-2 uppercase text-sm tracking-wide">Founder</p>
            <p className="text-sm text-gray-500">The visionary who laid the strong foundation of Deepak Steel Udyog.</p>
          </div>

           {/* Founder 2 */}
           <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-center group">
            <div className="w-24 h-24 bg-blue-50 rounded-full mx-auto mb-4 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
               <Users className="h-10 w-10 text-blue-400 group-hover:text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Parvati Dhanuka</h3>
            <p className="text-blue-600 font-bold mb-2 uppercase text-sm tracking-wide">Founder</p>
            <p className="text-sm text-gray-500">A pillar of support and management since inception.</p>
          </div>

          {/* Co-Founder */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-center group">
            <div className="w-24 h-24 bg-blue-50 rounded-full mx-auto mb-4 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
               <Users className="h-10 w-10 text-blue-400 group-hover:text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Deepak Kumar Dhanuka</h3>
            <p className="text-blue-600 font-bold mb-2 uppercase text-sm tracking-wide">Co-Founder</p>
            <p className="text-sm text-gray-500">Driving innovation and modern designs for the future.</p>
          </div>

        </div>
      </div>
    </div>
  );
};