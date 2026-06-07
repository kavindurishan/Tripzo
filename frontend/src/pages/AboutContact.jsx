import React, { useState } from 'react';
import { Compass, Mail, Phone, MapPin, Send, MessageSquare, Award, Clock } from 'lucide-react';

export function AboutUs() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Our Story &amp; Vision</h2>
        <p className="text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
          Tripzo is Sri Lanka's leading digital mobility platform, transforming long-distance road public and private transit.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-8 rounded-3xl shadow-sm">
        <div className="space-y-4">
          <h3 className="font-extrabold text-xl text-slate-800 dark:text-white">Redefining Bus Travel</h3>
          <p className="text-xs text-slate-550 leading-relaxed">
            Founded with the sole ambition of resolving ticket queues and underspecified schedules, Tripzo acts as the perfect bridge connecting operators and passengers.
          </p>
          <p className="text-xs text-slate-555 leading-relaxed">
            By deploying visual seat selectors, real-time schedule aggregators, secure digital card checkout gateways, and SMS confirmations, Tripzo offers travel comfort at every kilometer.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-850 rounded-2xl text-center space-y-2">
            <Award className="w-8 h-8 text-primary-500 mx-auto" />
            <h4 className="font-bold text-sm text-slate-800 dark:text-white">100K+ Journeys</h4>
            <p className="text-[10px] text-slate-400">Safely booked and traveled across key national routes.</p>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-850 rounded-2xl text-center space-y-2">
            <Clock className="w-8 h-8 text-accent-cyan mx-auto" />
            <h4 className="font-bold text-sm text-slate-800 dark:text-white">99.8% On-Time</h4>
            <p className="text-[10px] text-slate-400">Strict departure discipline enforced with bus operators.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ContactUs() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setSent(true);
    setTimeout(() => {
      setName('');
      setEmail('');
      setMessage('');
      setSent(false);
      alert('Your inquiry was dispatched successfully. The Tripzo support desk will email you shortly.');
    }, 1000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white font-sans">Get In Touch</h2>
        <p className="text-sm text-slate-500 max-w-xl mx-auto">
          Have an operators onboarding question or need passenger support? Our 24/7 desk is always ready.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Info */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-6">
            <h3 className="font-bold text-slate-850 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">Contact Information</h3>
            
            <div className="space-y-4 text-xs font-semibold text-slate-550">
              <div className="flex items-center space-x-3.5">
                <div className="w-9 h-9 rounded bg-primary-50 dark:bg-primary-950/20 text-primary-500 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Call Support</p>
                  <p className="text-slate-800 dark:text-slate-200">+94 11 234 5678</p>
                </div>
              </div>

              <div className="flex items-center space-x-3.5">
                <div className="w-9 h-9 rounded bg-accent-cyan/10 text-accent-cyan flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Email Inquiry</p>
                  <p className="text-slate-800 dark:text-slate-200">support@tripzo.com</p>
                </div>
              </div>

              <div className="flex items-center space-x-3.5">
                <div className="w-9 h-9 rounded bg-accent-emerald/10 text-accent-emerald flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Headquarters</p>
                  <p className="text-slate-800 dark:text-slate-200">104 Galle Road, Colombo 03, Sri Lanka</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Inquiry Form */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="font-bold text-slate-850 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 mb-2 flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-primary-500" />
              <span>Send Inquiry</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary-500 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary-500 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Message</label>
              <textarea
                required
                rows="4"
                placeholder="Describe your request in detail..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary-500 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-extrabold rounded-xl shadow-md shadow-primary-500/10 hover:shadow-primary-500/20 hover:scale-[1.01] transition-all text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{sent ? 'Sending...' : 'Send Message'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
