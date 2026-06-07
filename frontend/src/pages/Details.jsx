import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SeatMap from '../components/SeatMap';
import { 
  Wifi, BatteryCharging, Tv, Clock, MapPin, 
  ArrowRight, ShieldAlert, Award, Tag, Sparkles
} from 'lucide-react';

export default function Details() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Seat state
  const [bookedSeats, setBookedSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [includeConvenienceFee, setIncludeConvenienceFee] = useState(true);
  
  // Passenger state
  const [passengers, setPassengers] = useState({}); // { '2A': { fullName: '', age: '', gender: 'Male' } }
  
  // Offer state
  const [promoInput, setPromoInput] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const [appliedOffer, setAppliedOffer] = useState(null);

  useEffect(() => {
    loadScheduleDetails();
  }, [id]);

  const loadScheduleDetails = async () => {
    setLoading(true);
    setError('');
    try {
      // Find the specific schedule
      const data = await api.schedules.getAll();
      if (data.success) {
        const item = data.schedules.find(s => s._id === id);
        if (item) {
          setSchedule(item);
          loadBookedSeats(item._id);
        } else {
          setError('Schedule details not found.');
        }
      }
    } catch (err) {
      setError('Could not retrieve trip details.');
    } finally {
      setLoading(false);
    }
  };

  const loadBookedSeats = async (scheduleId) => {
    try {
      const data = await api.bookings.getAll();
      if (data.success) {
        // Collect seat numbers from all active bookings for this trip
        const matchedBookings = data.bookings.filter(b => b.schedule._id === scheduleId && b.bookingStatus !== 'Cancelled');
        const booked = matchedBookings.reduce((acc, curr) => acc.concat(curr.seatsBooked), []);
        setBookedSeats(booked);
      }
    } catch (err) {
      console.warn('Could not retrieve booked seats layout.');
    }
  };

  const handleSeatSelect = (seatNum) => {
    let updated;
    if (selectedSeats.includes(seatNum)) {
      updated = selectedSeats.filter(s => s !== seatNum);
      setSelectedSeats(updated);
      
      // Clean up passenger detail for that seat
      const copy = { ...passengers };
      delete copy[seatNum];
      setPassengers(copy);
    } else {
      updated = [...selectedSeats, seatNum];
      setSelectedSeats(updated);
      
      // Initialize passenger detail entry
      setPassengers({
        ...passengers,
        [seatNum]: { fullName: '', age: '', gender: 'Male' }
      });
    }

    // Reset promo calculations if seats selection count changes
    setDiscountAmount(0);
    setPromoSuccess('');
    setPromoError('');
    setAppliedOffer(null);
  };

  const handlePassengerChange = (seatNum, field, value) => {
    setPassengers({
      ...passengers,
      [seatNum]: {
        ...passengers[seatNum],
        [field]: value
      }
    });
  };

  const handleVerifyPromo = async (e) => {
    e.preventDefault();
    setPromoError('');
    setPromoSuccess('');
    setDiscountAmount(0);
    setAppliedOffer(null);

    if (!selectedSeats.length) {
      setPromoError('Please select seats first.');
      return;
    }

    if (!promoInput) return;

    const baseAmount = schedule.ticketPrice * selectedSeats.length;

    try {
      const data = await api.offers.verify(promoInput, baseAmount);
      if (data.success) {
        const offer = data.offer;
        let discount = 0;
        if (offer.discountType === 'Percentage') {
          discount = baseAmount * (offer.value / 100);
        } else {
          discount = Math.min(offer.value, baseAmount);
        }
        setDiscountAmount(discount);
        setAppliedOffer(offer);
        setPromoSuccess(`Voucher applied! Saved $${discount.toFixed(2)}`);
      } else {
        setPromoError('Invalid promo code');
      }
    } catch (err) {
      setPromoError(err.message || 'Promo code validation failed');
    }
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    if (!selectedSeats.length) {
      alert('Please select at least one seat.');
      return;
    }

    // Check passenger forms
    const passArray = [];
    for (let seat of selectedSeats) {
      const p = passengers[seat];
      if (!p || !p.fullName || !p.age) {
        alert(`Please complete the details for passenger in Seat ${seat}`);
        return;
      }
      passArray.push({
        fullName: p.fullName,
        age: parseInt(p.age),
        gender: p.gender,
        seatNumber: seat
      });
    }

    try {
      const data = await api.bookings.create({
        scheduleId: schedule._id,
        passengers: passArray,
        seatsBooked: selectedSeats,
        promoCode: appliedOffer ? appliedOffer.code : undefined,
        includeConvenienceFee
      });

      if (data.success) {
        navigate(`/payment/${data.booking._id}`);
      } else {
        alert(data.message || 'Checkout failed');
      }
    } catch (err) {
      alert(err.message || 'Checkout error');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-500">Loading seat grids and details...</p>
      </div>
    );
  }

  if (error || !schedule) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center px-4">
        <div className="p-8 bg-rose-50 dark:bg-rose-950/20 text-accent-rose text-sm font-semibold rounded-2xl border border-rose-200/50">
          {error || 'Schedule details not found.'}
        </div>
      </div>
    );
  }

  const basePrice = schedule.ticketPrice * selectedSeats.length;
  const convenienceFee = (selectedSeats.length > 0 && includeConvenienceFee) ? 2 : 0;
  const finalPrice = Math.max(basePrice - discountAmount + convenienceFee, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Route header details */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-6 rounded-3xl shadow-xl mb-10 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-primary-500/5 blur-2xl" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 z-10 relative">
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-primary-400">Boarding Details</span>
            <div className="flex items-center space-x-2">
              <h2 className="font-extrabold text-2xl tracking-tight">{schedule.route.startingLocation}</h2>
              <ArrowRight className="w-5 h-5 text-accent-cyan" />
              <h2 className="font-extrabold text-2xl tracking-tight">{schedule.route.destination}</h2>
            </div>
            <p className="text-xs text-slate-400 font-semibold">{schedule.departureDate} &bull; Departure Time: {schedule.departureTime} &bull; Route: {schedule.route.duration}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-500">Bus Model</span>
              <p className="font-bold text-base text-slate-200">{schedule.bus.name}</p>
              <p className="text-[10px] text-primary-400 font-bold bg-primary-950/40 px-2 py-0.5 rounded w-max ml-auto mt-1 uppercase tracking-wider">{schedule.bus.type}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Seat Map */}
        <div className="lg:col-span-5">
          <SeatMap 
            capacity={schedule.bus.seatCapacity}
            busType={schedule.bus.type}
            bookedSeats={bookedSeats}
            selectedSeats={selectedSeats}
            onSeatSelect={handleSeatSelect}
          />
        </div>

        {/* Right Side: Passenger Forms & Fare Breakdown */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleCheckoutSubmit} className="space-y-6">
            {/* Passenger Information Cards */}
            {selectedSeats.length === 0 ? (
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-10 text-center">
                <Sparkles className="w-10 h-10 text-primary-500 mx-auto mb-3" />
                <h3 className="font-extrabold text-slate-800 dark:text-white">Ready to book?</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                  Click on the seat positions in the bus layout to reserve tickets. Let's start!
                </p>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-5">
                <h3 className="font-bold text-slate-800 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <span>Passenger Details</span>
                  <span className="text-xs text-slate-400 font-medium">Please match government IDs</span>
                </h3>

                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                  {selectedSeats.map((seat) => (
                    <div key={seat} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 rounded-xl space-y-3 relative">
                      <div className="absolute top-4 right-4 w-7 h-7 bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 border border-primary-200/10 rounded-lg flex items-center justify-center font-bold text-xs">
                        {seat}
                      </div>

                      <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Seat {seat} Passenger</span>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-1.5">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Full Name</label>
                          <input
                            type="text"
                            required
                            placeholder="John Doe"
                            value={passengers[seat]?.fullName || ''}
                            onChange={(e) => handlePassengerChange(seat, 'fullName', e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary-500 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Age</label>
                          <input
                            type="number"
                            required
                            min="3"
                            max="100"
                            placeholder="Age"
                            value={passengers[seat]?.age || ''}
                            onChange={(e) => handlePassengerChange(seat, 'age', e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary-500 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Gender</label>
                          <select
                            value={passengers[seat]?.gender || 'Male'}
                            onChange={(e) => handlePassengerChange(seat, 'gender', e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary-500 dark:text-white"
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Apply Promo Form */}
            {selectedSeats.length > 0 && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
                <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Discount Promo Code</span>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Enter Code (e.g. TRIPZO10)"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                    className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold uppercase focus:outline-none focus:ring-1 focus:ring-primary-500 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyPromo}
                    className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 hover:dark:bg-slate-700 text-slate-700 dark:text-slate-350 font-bold rounded-xl text-xs"
                  >
                    Apply
                  </button>
                </div>
                {promoError && <p className="text-[10px] text-accent-rose font-bold mt-1.5">{promoError}</p>}
                {promoSuccess && <p className="text-[10px] text-accent-emerald font-bold mt-1.5 flex items-center space-x-1"><Sparkles className="w-3.5 h-3.5" /> <span>{promoSuccess}</span></p>}
              </div>
            )}

            {/* Pricing Breakdown Panel */}
            {selectedSeats.length > 0 && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                  Fare Summary
                </h3>

                <div className="space-y-2 text-xs font-semibold text-slate-500">
                  <div className="flex justify-between">
                    <span>Base Ticket Fare (${schedule.ticketPrice} x {selectedSeats.length})</span>
                    <span className="text-slate-800 dark:text-slate-200">${basePrice.toFixed(2)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-accent-emerald font-bold">
                      <span>Promo Discount applied ({appliedOffer?.code})</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-1">
                    <label className="flex items-center space-x-2 select-none cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeConvenienceFee}
                        onChange={(e) => setIncludeConvenienceFee(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 dark:border-slate-800 text-primary-600 focus:ring-primary-500 bg-slate-50 dark:bg-slate-950"
                      />
                      <span className="text-slate-500 font-semibold">Convenience Fee</span>
                    </label>
                    <span className="text-slate-800 dark:text-slate-200">${convenienceFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 dark:border-slate-800/60 pt-3 text-sm font-extrabold text-slate-900 dark:text-white">
                    <span>Total Amount</span>
                    <span className="text-primary-500 text-lg">${finalPrice.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-extrabold rounded-xl shadow-lg shadow-primary-500/10 hover:shadow-primary-500/25 transition-all flex items-center justify-center space-x-2 text-sm uppercase tracking-wider"
                >
                  <span>Proceed to Checkout</span>
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
