import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { 
  Search, Calendar, MapPin, Shield, Compass, Clock, Award, Users, Bus
} from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  
  const [fromList, setFromList] = useState([]);
  const [toList, setToList] = useState([]);
  const [fromInput, setFromInput] = useState('');
  const [toInput, setToInput] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    loadRouteOptions();
    loadOffers();
  }, []);

  const loadRouteOptions = async () => {
    try {
      const data = await api.routes.getAll();
      if (data.success) {
        const starts = [...new Set(data.routes.map(r => r.startingLocation))];
        const dests = [...new Set(data.routes.map(r => r.destination))];
        setFromList(starts);
        setToList(dests);
        
        // Auto fill defaults
        if (starts.length > 0) setFromInput(starts[0]);
        if (dests.length > 0) setToInput(dests[0]);
      }
    } catch (err) {
      console.warn('Failed to load route options');
      // Set offline defaults
      setFromList(['Colombo', 'Galle', 'Kandy']);
      setToList(['Kandy', 'Colombo', 'Galle']);
      setFromInput('Colombo');
      setToInput('Kandy');
    }
  };

  const loadOffers = async () => {
    try {
      const data = await api.offers.getAll();
      if (data.success) {
        setOffers(data.offers.slice(0, 3));
      }
    } catch (err) {
      // Fake offers if backend is offline
      setOffers([
        { code: 'TRIPZO10', value: 10, discountType: 'Percentage', minBookingValue: 10 },
        { code: 'WELCOME50', value: 5, discountType: 'Fixed', minBookingValue: 20 }
      ]);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!fromInput || !toInput || !departureDate) return;
    
    // Redirect to schedules with query parameters
    navigate(`/schedules?from=${fromInput}&to=${toInput}&date=${departureDate}`);
  };

  // Get current date formatted for min date attribute
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <div className="relative min-h-[500px] bg-slate-900 flex items-center justify-center overflow-hidden">
        {/* Abstract Background Design */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-950 via-slate-950 to-slate-950" />
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary-600/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent-cyan/10 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center z-10 w-full">
          {/* Header Texts */}
          <div className="text-center space-y-4 max-w-3xl mb-12 animate-fade-in">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-xs font-bold text-primary-400 uppercase tracking-widest">
              <Award className="w-3.5 h-3.5" />
              <span>Premium Transit</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
              Begin your beautiful <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-cyan">Tripzo</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-400 font-medium">
              Seamlessly search buses, select seats, make payments, and access digital boarding tickets instantly.
            </p>
          </div>

          {/* Search Form Card */}
          <div className="w-full max-w-4xl bg-white dark:bg-slate-900/90 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md animate-fade-in-up">
            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-5 items-end">
              {/* Departure Input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-primary-500" />
                  <span>Leaving From</span>
                </label>
                <select
                  value={fromInput}
                  onChange={(e) => setFromInput(e.target.value)}
                  className="w-full py-3 px-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-semibold transition-all"
                >
                  {fromList.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {/* Destination Input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-accent-cyan" />
                  <span>Going To</span>
                </label>
                <select
                  value={toInput}
                  onChange={(e) => setToInput(e.target.value)}
                  className="w-full py-3 px-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-semibold transition-all"
                >
                  {toList.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {/* Date Input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-accent-emerald" />
                  <span>Travel Date</span>
                </label>
                <input
                  type="date"
                  required
                  min={todayStr}
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="w-full py-3 px-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm font-semibold transition-all"
                />
              </div>

              {/* Search Action Button */}
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl font-bold text-white bg-primary-600 hover:bg-primary-700 shadow-md shadow-primary-500/10 hover:shadow-primary-500/25 transition-all text-sm flex items-center justify-center space-x-2"
              >
                <Search className="w-4 h-4" />
                <span>Search Trips</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Promos Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-6">
          Exclusive Tripzo Promos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {offers.map(offer => (
            <div 
              key={offer.code} 
              className="p-6 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl flex justify-between items-center relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-primary-600/5 blur-xl" />
              <div className="space-y-1.5 z-10">
                <span className="text-[10px] font-bold tracking-wider text-primary-400 uppercase">Discount Voucher</span>
                <h3 className="font-extrabold text-lg text-white">
                  Save {offer.discountType === 'Percentage' ? `${offer.value}%` : `$${offer.value}`} on your next booking!
                </h3>
                <p className="text-xs text-slate-400 font-semibold">
                  Valid for bookings above ${offer.minBookingValue}
                </p>
              </div>
              <div className="flex flex-col items-center bg-slate-900 border border-slate-700 rounded-xl p-3 border-dashed z-10">
                <span className="text-[9px] uppercase font-bold text-slate-500 mb-0.5">Use Code</span>
                <span className="font-extrabold text-sm tracking-wider text-accent-cyan">{offer.code}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trust Badges */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 rounded-2xl">
            <div className="w-12 h-12 bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 rounded-xl flex items-center justify-center mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-800 dark:text-white mb-2">100% Secured Payments</h3>
            <p className="text-xs text-slate-500">We encrypt your transactions with modern industry standard payment protocols.</p>
          </div>

          <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 rounded-2xl">
            <div className="w-12 h-12 bg-accent-cyan/10 text-accent-cyan rounded-xl flex items-center justify-center mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-800 dark:text-white mb-2">On-Time Guarantees</h3>
            <p className="text-xs text-slate-500">Our operator fleet tracks transit schedules closely to prevent delays.</p>
          </div>

          <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 rounded-2xl">
            <div className="w-12 h-12 bg-accent-emerald/10 text-accent-emerald rounded-xl flex items-center justify-center mb-4">
              <Bus className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-800 dark:text-white mb-2">Luxury Comfort Fleet</h3>
            <p className="text-xs text-slate-500">Equipped with luxury reclining seats, TV entertainment, Wi-Fi and charging docks.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
