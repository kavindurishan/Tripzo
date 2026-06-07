import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { 
  Filter, Wifi, BatteryCharging, Tv, ShieldAlert, 
  MapPin, Clock, ArrowRight, Star, Sliders, ChevronDown
} from 'lucide-react';

export default function BusList() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';
  const date = searchParams.get('date') || '';

  const [schedules, setSchedules] = useState([]);
  const [filteredSchedules, setFilteredSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters state
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [maxPrice, setMaxPrice] = useState(50);
  const [departureTime, setDepartureTime] = useState('All'); // All, Morning, Afternoon, Night

  useEffect(() => {
    loadSchedules();
  }, [from, to, date]);

  useEffect(() => {
    applyFilters();
  }, [schedules, selectedTypes, maxPrice, departureTime]);

  const loadSchedules = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.schedules.getAll(from, to, date);
      if (data.success) {
        setSchedules(data.schedules);
      }
    } catch (err) {
      setError('Could not retrieve schedules. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let list = [...schedules];

    // Filter by type (Luxury vs Normal categories)
    if (selectedTypes.length > 0) {
      list = list.filter(item => {
        const isItemLuxury = item.bus.type === 'Luxury' || item.bus.type === 'AC';
        const isItemNormal = item.bus.type === 'Normal' || item.bus.type === 'Semi Luxury';
        
        if (selectedTypes.includes('Luxury') && isItemLuxury) return true;
        if (selectedTypes.includes('Normal') && isItemNormal) return true;
        return false;
      });
    }

    // Filter by price
    list = list.filter(item => item.ticketPrice <= maxPrice);

    // Filter by departure time
    if (departureTime !== 'All') {
      list = list.filter(item => {
        const hour = parseInt(item.departureTime.split(':')[0], 10);
        if (departureTime === 'Morning') return hour >= 5 && hour < 12;
        if (departureTime === 'Afternoon') return hour >= 12 && hour < 17;
        if (departureTime === 'Night') return hour >= 17 || hour < 5;
        return true;
      });
    }

    setFilteredSchedules(list);
  };

  const handleTypeToggle = (type) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter(t => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const getFacilityIcon = (facility) => {
    if (facility === 'Wi-Fi') return <Wifi className="w-3.5 h-3.5" title="Wi-Fi" />;
    if (facility === 'Charging') return <BatteryCharging className="w-3.5 h-3.5" title="Charging Docks" />;
    if (facility === 'TV') return <Tv className="w-3.5 h-3.5" title="TV Screens" />;
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Search Info Summary */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-6 rounded-2xl shadow-sm mb-8 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Search Results</span>
          <div className="flex items-center space-x-2.5 mt-1">
            <h2 className="font-extrabold text-xl sm:text-2xl text-slate-950 dark:text-white">{from}</h2>
            <ArrowRight className="w-5 h-5 text-primary-500 shrink-0" />
            <h2 className="font-extrabold text-xl sm:text-2xl text-slate-950 dark:text-white">{to}</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-semibold">{date ? new Date(date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'All Dates'}</p>
        </div>
        <button 
          onClick={() => navigate('/')}
          className="px-4 py-2 rounded-lg text-xs font-bold text-primary-500 bg-primary-50 dark:bg-primary-950/20 hover:bg-primary-100/50 transition-colors border border-primary-100 dark:border-primary-900/30"
        >
          Modify Search
        </button>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Filter className="w-4 h-4 text-primary-500" />
              <span>Filters</span>
            </h3>

            {/* Bus Types */}
            <div className="space-y-3 mb-6">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Bus Category</span>
              {['Luxury', 'Normal'].map(type => (
                <label key={type} className="flex items-center space-x-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 select-none cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(type)}
                    onChange={() => handleTypeToggle(type)}
                    className="w-4 h-4 rounded border-slate-350 dark:border-slate-800 text-primary-600 focus:ring-primary-500 bg-slate-50 dark:bg-slate-950"
                  />
                  <span className="flex flex-col">
                    <span>{type}</span>
                    <span className="text-[9px] text-slate-400 font-normal leading-none mt-0.5">
                      {type === 'Luxury' ? 'Luxury, AC' : 'Normal, Semi Luxury'}
                    </span>
                  </span>
                </label>
              ))}
            </div>

            {/* Max Ticket Price */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center">
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Max Price</span>
                <span className="text-xs font-bold text-primary-500">${maxPrice}</span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                step="2"
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
            </div>

            {/* Departure times */}
            <div className="space-y-3">
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Departure Time</span>
              {['All', 'Morning', 'Afternoon', 'Night'].map(t => (
                <label key={t} className="flex items-center space-x-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 select-none cursor-pointer">
                  <input
                    type="radio"
                    name="departureTime"
                    checked={departureTime === t}
                    onChange={() => setDepartureTime(t)}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                  />
                  <span>{t === 'All' ? 'Any Time' : `${t} ${t === 'Morning' ? '(5am - 12pm)' : t === 'Afternoon' ? '(12pm - 5pm)' : '(5pm - 5am)'}`}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Bus List Results */}
        <div className="lg:col-span-3 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-20 space-y-4">
              <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-bold text-slate-500">Searching active schedules...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center bg-rose-50 dark:bg-rose-950/20 text-accent-rose text-sm font-semibold rounded-2xl border border-rose-200/50">
              {error}
            </div>
          ) : filteredSchedules.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm">
              <ShieldAlert className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="font-extrabold text-lg text-slate-800 dark:text-white">No schedules found</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1.5">
                We couldn't find any active schedules matching your exact filter preferences. Try broadening your criteria.
              </p>
            </div>
          ) : (
            filteredSchedules.map(item => (
              <div 
                key={item._id} 
                className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden"
              >
                {/* Visual side-badge for luxury */}
                {item.bus.type === 'Luxury' && (
                  <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-primary-500 to-accent-cyan" />
                )}

                {/* Bus and Service Details */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-slate-900 dark:text-white tracking-tight">{item.bus.name}</span>
                    <span className="text-[10px] font-bold text-primary-500 bg-primary-50 dark:bg-primary-950/40 px-2 py-0.5 rounded-md uppercase tracking-wider">{item.bus.type}</span>
                    <span className="text-[10px] text-slate-400 font-bold">{item.bus.busNumber}</span>
                  </div>

                  {/* Trip Itinerary Visual Timeline */}
                  <div className="flex items-center space-x-4">
                    <div className="shrink-0 text-center">
                      <span className="block font-extrabold text-base text-slate-800 dark:text-white leading-none">{item.departureTime}</span>
                      <span className="text-[10px] font-bold text-slate-400 mt-1 block">{from}</span>
                    </div>

                    <div className="flex-1 flex items-center space-x-2 group">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-400" />
                      <div className="flex-1 h-0.5 border-t border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center relative">
                        <span className="absolute -top-3.5 text-[9px] font-bold text-slate-400 bg-white dark:bg-slate-900 px-2 flex items-center space-x-1.5">
                          <Clock className="w-3 h-3 text-slate-350" />
                          <span>{item.route.duration}</span>
                        </span>
                      </div>
                      <div className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse" />
                    </div>

                    <div className="shrink-0 text-center">
                      <span className="block font-extrabold text-base text-slate-800 dark:text-white leading-none">{item.arrivalTime}</span>
                      <span className="text-[10px] font-bold text-slate-400 mt-1 block">{to}</span>
                    </div>
                  </div>

                  {/* Stops Preview & Facilities */}
                  <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-bold text-slate-400 border-t border-slate-100 dark:border-slate-800/40">
                    <span className="text-slate-500 dark:text-slate-300">Route via:</span>
                    {item.route.stops.slice(0, 2).map((stop, idx) => (
                      <span key={idx} className="bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded text-[10px]">{stop.name}</span>
                    ))}
                    {item.route.stops.length > 2 && <span className="text-[10px] text-primary-500 font-extrabold">+{item.route.stops.length - 2} stops</span>}
                  </div>
                </div>

                {/* Facilities List (Wi-Fi, AC etc.) */}
                <div className="flex md:flex-col items-center md:items-start justify-between md:justify-center border-t border-slate-100 dark:border-slate-800/40 md:border-t-0 pt-3 md:pt-0 md:pl-5 md:border-l border-slate-200/50 md:min-w-[150px] gap-4">
                  <div className="flex space-x-1.5 text-slate-400">
                    {item.bus.facilities.map((fac, i) => (
                      <div key={i} className="p-1.5 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800 flex items-center justify-center">
                        {getFacilityIcon(fac)}
                      </div>
                    ))}
                  </div>

                  <div className="flex md:flex-col items-end md:items-start justify-between w-full md:w-auto md:space-y-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Ticket Fare</span>
                      <div className="flex items-baseline space-x-0.5">
                        <span className="font-extrabold text-2xl text-slate-800 dark:text-white leading-none">${item.ticketPrice}</span>
                        <span className="text-[10px] font-bold text-slate-400">/seat</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 text-right">
                      <span className="text-[10px] font-bold text-slate-500">
                        {item.availableSeats} Seats left
                      </span>
                    </div>

                    <button
                      onClick={() => navigate(`/schedules/${item._id}`)}
                      className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg text-xs tracking-wide shadow-md shadow-primary-500/10 hover:shadow-primary-500/25 hover:scale-[1.02] transition-all"
                    >
                      Select Seats
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
