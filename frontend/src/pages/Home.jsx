import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { 
  Search, Calendar, MapPin, Shield, Compass, Clock, Award, Users, Bus,
  Ticket, Armchair, Navigation, FileText, ShieldCheck, UserCheck
} from 'lucide-react';
import premiumBusBanner from '../assets/premium_bus_banner.png';

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
      {/* Redesigned Premium Hero Section */}
      <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 overflow-hidden border-b border-slate-200/50 dark:border-slate-800/40 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Branding, Taglines & Search Card */}
            <div className="lg:col-span-7 space-y-8 z-10">
              
              {/* Brand Header */}
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center space-x-3">
                  {/* Styled Logo Icon */}
                  <div className="relative w-12 h-12 bg-primary-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                    <Bus className="w-6 h-6" />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-accent-cyan rounded-lg flex items-center justify-center text-[10px] font-bold">
                      <MapPin className="w-3 h-3 text-slate-950" />
                    </div>
                  </div>
                  
                  {/* Brand Name with LK Badge */}
                  <div className="flex items-center space-x-2">
                    <span className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                      Tripzo
                    </span>
                    <span className="bg-primary-600 text-white text-xs font-black px-2.5 py-1 rounded-md tracking-wider">
                      LK
                    </span>
                  </div>
                </div>

                {/* Subtitle */}
                <p className="text-xs md:text-sm font-extrabold tracking-[0.2em] text-slate-400 dark:text-slate-500 uppercase">
                  Smart Bus Booking & Management Platform
                </p>

                {/* Slogan */}
                <h1 className="text-2xl md:text-3.5xl font-black text-slate-950 dark:text-white leading-tight">
                  Your Journey, Our Priority.<br />
                  <span className="text-slate-400 dark:text-slate-500">Travel </span>
                  <span className="text-primary-600 dark:text-primary-400">Smart</span>
                  <span className="text-slate-400 dark:text-slate-500">, Travel </span>
                  <span className="text-accent-cyan dark:text-accent-cyan">Easy.</span>
                </h1>
              </div>

              {/* Integrated Search Card */}
              <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-5 md:p-6 shadow-xl backdrop-blur-md animate-fade-in-up">
                <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
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

            {/* Right Column: Premium Bus Visual with custom overlay */}
            <div className="lg:col-span-5 relative w-full h-[320px] md:h-[450px] rounded-3xl overflow-hidden shadow-2xl animate-fade-in border border-slate-200/30 dark:border-slate-800/30">
              {/* Overlay shading */}
              <div className="absolute inset-0 bg-gradient-to-r from-slate-100/10 dark:from-slate-950/10 via-transparent to-transparent z-10 hidden lg:block" />
              
              {/* Color accent wash */}
              <div className="absolute inset-0 bg-primary-600/5 dark:bg-primary-500/5 mix-blend-multiply dark:mix-blend-normal z-0" />
              
              <img 
                src={premiumBusBanner} 
                alt="Tripzo Luxury Bus"
                className="w-full h-full object-cover z-0 transition-transform duration-700 hover:scale-[1.03]"
              />
              
              {/* Dynamic Overlay Label */}
              <div className="absolute bottom-6 left-6 right-6 p-4 bg-slate-950/80 border border-white/10 backdrop-blur-sm rounded-2xl text-white z-20 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-bold tracking-wider text-accent-cyan uppercase">Premium Fleet</p>
                  <p className="text-xs font-bold text-slate-200">Luxury Coach Services Sri Lanka</p>
                </div>
                <span className="px-2.5 py-1 bg-accent-emerald text-slate-950 text-[10px] font-black rounded-full uppercase tracking-wider">
                  Active
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Navy Features stripe */}
      <div className="w-full bg-gradient-to-r from-slate-900 via-primary-950 to-slate-900 text-white py-8 border-y border-slate-800 shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            
            {/* Features Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 w-full lg:w-auto flex-grow">
              
              {/* 1. Easy Booking */}
              <div className="flex flex-col items-center text-center p-1 group">
                <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center mb-2 group-hover:bg-primary-600 group-hover:border-primary-500 transition-all duration-300">
                  <Ticket className="w-5 h-5 text-primary-400 group-hover:text-white" />
                </div>
                <span className="text-[10px] font-black tracking-wider text-slate-400 group-hover:text-white uppercase transition-colors">
                  Easy Booking
                </span>
              </div>

              {/* 2. Seat Reservation */}
              <div className="flex flex-col items-center text-center p-1 group">
                <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center mb-2 group-hover:bg-primary-600 group-hover:border-primary-500 transition-all duration-300">
                  <Armchair className="w-5 h-5 text-primary-400 group-hover:text-white" />
                </div>
                <span className="text-[10px] font-black tracking-wider text-slate-400 group-hover:text-white uppercase transition-colors">
                  Seat Reservation
                </span>
              </div>

              {/* 3. Live Bus Tracking */}
              <div className="flex flex-col items-center text-center p-1 group">
                <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center mb-2 group-hover:bg-primary-600 group-hover:border-primary-500 transition-all duration-300">
                  <Navigation className="w-5 h-5 text-primary-400 group-hover:text-white" />
                </div>
                <span className="text-[10px] font-black tracking-wider text-slate-400 group-hover:text-white uppercase transition-colors">
                  Live Tracking
                </span>
              </div>

              {/* 4. PDF Ticket & Receipt */}
              <div className="flex flex-col items-center text-center p-1 group">
                <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center mb-2 group-hover:bg-primary-600 group-hover:border-primary-500 transition-all duration-300">
                  <FileText className="w-5 h-5 text-primary-400 group-hover:text-white" />
                </div>
                <span className="text-[10px] font-black tracking-wider text-slate-400 group-hover:text-white uppercase transition-colors">
                  PDF Ticket & Receipt
                </span>
              </div>

              {/* 5. Secure & Reliable */}
              <div className="flex flex-col items-center text-center p-1 group">
                <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center mb-2 group-hover:bg-primary-600 group-hover:border-primary-500 transition-all duration-300">
                  <ShieldCheck className="w-5 h-5 text-primary-400 group-hover:text-white" />
                </div>
                <span className="text-[10px] font-black tracking-wider text-slate-400 group-hover:text-white uppercase transition-colors">
                  Secure & Reliable
                </span>
              </div>

              {/* 6. Owner Management */}
              <div className="flex flex-col items-center text-center p-1 group">
                <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center mb-2 group-hover:bg-primary-600 group-hover:border-primary-500 transition-all duration-300">
                  <UserCheck className="w-5 h-5 text-primary-400 group-hover:text-white" />
                </div>
                <span className="text-[10px] font-black tracking-wider text-slate-400 group-hover:text-white uppercase transition-colors">
                  Owner Management
                </span>
              </div>

            </div>

            {/* Slogan with Kaushan Script font */}
            <div className="shrink-0 pl-6 border-l border-slate-800 hidden lg:block text-right">
              <span 
                className="text-2xl text-accent-cyan tracking-wide font-medium block" 
                style={{ fontFamily: "'Kaushan Script', cursive" }}
              >
                Move Safe, Arrive Safe.
              </span>
            </div>

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
    </div>
  );
}
