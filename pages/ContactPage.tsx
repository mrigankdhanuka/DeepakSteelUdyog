import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';

export const ContactPage = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Get in Touch</h1>
        <p className="text-gray-500 max-w-xl mx-auto text-lg">
          Visit our workshop or contact us for custom orders and inquiries.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Contact Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Visit Us</h3>
                <p className="text-gray-600 mt-1">
                  Near Triveni Bhawan,<br />
                  Fatehpur Shekhawati,<br />
                  Rajasthan – 332301, India
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Phone className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Call Us</h3>
                <p className="text-gray-600 mt-1 text-sm">
                  <span className="font-medium text-blue-900">Deepak Dhanuka:</span><br/> +91 98290 53307
                </p>
                <p className="text-gray-600 mt-2 text-sm">
                  <span className="font-medium text-blue-900">Naman Dhanuka:</span><br/> +91 90790 53459
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Email Us</h3>
                <a href="mailto:ddhanuka30@gmail.com" className="text-blue-600 hover:text-blue-800 hover:underline block text-sm mt-1 transition-colors">ddhanuka30@gmail.com</a>
                <a href="mailto:deepakdhanukachair@gmail.com" className="text-blue-600 hover:text-blue-800 hover:underline block text-sm transition-colors">deepakdhanukachair@gmail.com</a>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-2 bg-white rounded-2xl shadow-lg shadow-blue-100/30 border border-gray-100 p-8">
          {isSubmitted ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 animate-in fade-in">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Message Sent!</h3>
              <p className="text-gray-500 max-w-sm">
                Thank you for contacting Deepak Steel Udyog. We will get back to you shortly.
              </p>
              <button 
                onClick={() => setIsSubmitted(false)}
                className="mt-8 text-blue-600 font-bold hover:text-blue-800 hover:underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">First Name</label>
                  <input type="text" required className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50 focus:bg-white" placeholder="Enter name" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Last Name</label>
                  <input type="text" required className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50 focus:bg-white" placeholder="Enter surname" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email Address</label>
                <input type="email" required className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50 focus:bg-white" placeholder="email@example.com" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">I'm interested in</label>
                <select className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50 focus:bg-white">
                  <option>Royal Almirah</option>
                  <option>Iron Beds</option>
                  <option>Storage Boxes</option>
                  <option>Custom Furniture</option>
                  <option>General Inquiry</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Message</label>
                <textarea required rows={5} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none bg-gray-50 focus:bg-white" placeholder="Tell us about your requirements..."></textarea>
              </div>

              <button type="submit" className="w-full bg-gradient-to-r from-blue-700 to-blue-600 text-white py-3 rounded-xl font-bold hover:from-blue-800 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transform hover:-translate-y-0.5">
                <Send className="h-5 w-5" /> Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};