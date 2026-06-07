import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import SeatMap from '../components/SeatMap';
import { 
  CreditCard, Wallet, Landmark, Banknote, ShieldCheck, 
  Lock, Calendar, HelpCircle, ArrowRight
} from 'lucide-react';

export default function Payment() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form State
  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadBookingDetails();
  }, [bookingId]);

  const loadBookingDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.bookings.getMy();
      if (data.success) {
        const matched = data.bookings.find(b => b._id === bookingId);
        if (matched) {
          setBooking(matched);
        } else {
          setError('Booking record not found.');
        }
      }
    } catch (err) {
      setError('Could not retrieve checkout details.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      const data = await api.bookings.pay({
        bookingId,
        paymentMethod,
        cardDetails: paymentMethod === 'Card' ? { cardNumber, expiry, cvv, cardName } : undefined
      });

      if (data.success) {
        // Direct to ticket view
        navigate(`/ticket/${bookingId}`);
      } else {
        alert(data.message || 'Payment processing failed.');
      }
    } catch (err) {
      alert(err.message || 'Network processing error.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-500">Initializing checkout transaction...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center px-4">
        <div className="p-8 bg-rose-50 dark:bg-rose-950/20 text-accent-rose text-sm font-semibold rounded-2xl border border-rose-200/50">
          {error || 'Booking details not found.'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Payment Selection Panel */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
            <h3 className="font-bold text-slate-850 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 mb-5 flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-primary-500" />
              <span>Choose Payment Method</span>
            </h3>

            {/* Methods Selectors grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {[
                { id: 'Card', name: 'Credit/Debit Card', icon: CreditCard },
                { id: 'Online Wallet', name: 'Online Wallet', icon: Wallet },
                { id: 'Bank Transfer', name: 'Bank Transfer', icon: Landmark },
                { id: 'Cash', name: 'Cash Counter', icon: Banknote },
              ].map(method => {
                const Icon = method.icon;
                const isSelected = paymentMethod === method.id;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    className={`flex flex-col items-center p-4 rounded-xl border-2 font-bold text-center gap-2 select-none transition-all ${isSelected ? 'bg-primary-50/20 border-primary-500 text-primary-600 dark:bg-primary-950/20 dark:text-primary-400' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-850 text-slate-650 hover:bg-slate-100/50'}`}
                  >
                    <Icon className="w-6 h-6 shrink-0" />
                    <span className="text-[11px] leading-tight">{method.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Nested Interactive Card Form */}
            {paymentMethod === 'Card' ? (
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div className="bg-gradient-to-tr from-slate-900 to-slate-950 p-6 rounded-2xl border border-slate-800 text-white space-y-6 relative overflow-hidden mb-6">
                  <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-primary-600/10 blur-2xl" />
                  
                  {/* Card Header visual */}
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Tripzo Boarding Card</span>
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-[8px]">VISA</div>
                  </div>

                  <div className="space-y-2">
                    <span className="block text-[8px] font-bold text-slate-500 uppercase">Card Number</span>
                    <p className="font-mono text-lg tracking-widest text-slate-200">
                      {cardNumber || '•••• •••• •••• ••••'}
                    </p>
                  </div>

                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <span className="block text-[8px] font-bold text-slate-500 uppercase">Card Holder</span>
                      <p className="font-semibold text-xs tracking-wide truncate max-w-[150px] uppercase">
                        {cardName || 'YOUR FULL NAME'}
                      </p>
                    </div>
                    <div className="flex space-x-4">
                      <div className="space-y-1">
                        <span className="block text-[8px] font-bold text-slate-500 uppercase">Expires</span>
                        <p className="font-mono text-xs font-semibold">{expiry || 'MM/YY'}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="block text-[8px] font-bold text-slate-500 uppercase">CVV</span>
                        <p className="font-mono text-xs font-semibold">{cvv || '•••'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Cardholder Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary-500 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Card Number</label>
                    <input
                      type="text"
                      required
                      maxLength="19"
                      placeholder="4111 2222 3333 4444"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary-500 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Expiration Date</label>
                    <input
                      type="text"
                      required
                      placeholder="MM/YY"
                      maxLength="5"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary-500 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Security Code (CVV)</label>
                    <input
                      type="password"
                      required
                      maxLength="3"
                      placeholder="•••"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary-500 dark:text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={processing}
                  className="w-full mt-6 py-4 bg-primary-600 hover:bg-primary-700 text-white font-extrabold rounded-xl shadow-lg shadow-primary-500/10 hover:shadow-primary-500/25 transition-all text-xs uppercase tracking-wider flex items-center justify-center space-x-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>{processing ? 'Authorizing Payment...' : `Pay $${booking.totalAmount.toFixed(2)}`}</span>
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-slate-550 leading-relaxed font-semibold">
                  You have selected <strong className="text-slate-700 dark:text-slate-300">{paymentMethod}</strong>. No online credentials are required for this transaction. The reservation code will be immediately saved, and you can pay during boarding or arrival.
                </p>
                <button
                  onClick={handlePaymentSubmit}
                  disabled={processing}
                  className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-extrabold rounded-xl shadow-lg shadow-primary-500/10 transition-all text-xs uppercase tracking-wider flex items-center justify-center space-x-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{processing ? 'Saving Reservation...' : 'Confirm Booking'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Quick Itinerary Booking Review Card */}
        <div className="lg:col-span-4">
          <div className="bg-slate-900 text-white border border-slate-850 p-6 rounded-2xl shadow-md space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-primary-500/5 blur-2xl" />
            
            <h3 className="font-bold text-slate-200 border-b border-slate-800 pb-3">
              Booking Review
            </h3>

            <div className="space-y-4">
              <div className="flex items-center space-x-3.5">
                <div>
                  <span className="block text-[8px] font-bold text-slate-500 uppercase">Boarding Point</span>
                  <p className="font-bold text-sm text-slate-250 truncate">{booking.schedule.route.startingLocation}</p>
                  <p className="text-[10px] text-slate-400 font-semibold">{booking.schedule.departureTime}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-accent-cyan" />
                <div>
                  <span className="block text-[8px] font-bold text-slate-500 uppercase">Destination</span>
                  <p className="font-bold text-sm text-slate-250 truncate">{booking.schedule.route.destination}</p>
                  <p className="text-[10px] text-slate-400 font-semibold">{booking.schedule.arrivalTime}</p>
                </div>
              </div>

              <div>
                <span className="block text-[8px] font-bold text-slate-500 uppercase">Travel Date</span>
                <p className="font-semibold text-xs text-slate-300">{booking.schedule.departureDate}</p>
              </div>

              <div>
                <span className="block text-[8px] font-bold text-slate-500 uppercase">Selected Seats</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {booking.seatsBooked.map(seat => (
                    <span key={seat} className="bg-primary-950/50 border border-primary-800/40 text-primary-400 text-[10px] font-bold px-2 py-0.5 rounded">
                      Seat {seat}
                    </span>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-800/60 pt-3">
                <span className="block text-[8px] font-bold text-slate-500 uppercase mb-2">Seating Arrangement</span>
                <div className="bg-slate-950/40 p-2 rounded-xl border border-slate-800/40">
                  <SeatMap 
                    readOnly={true}
                    capacity={booking.schedule.bus.seatCapacity}
                    busType={booking.schedule.bus.type}
                    selectedSeats={booking.seatsBooked}
                    bookedSeats={[]}
                  />
                </div>
              </div>

              <div className="border-t border-slate-800 pt-4 flex justify-between items-baseline">
                <span className="text-xs font-bold text-slate-400">Total Payable</span>
                <span className="font-extrabold text-2xl text-accent-cyan">${booking.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
