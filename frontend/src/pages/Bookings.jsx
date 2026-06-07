import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import SeatMap from '../components/SeatMap';
import { 
  Calendar, Ticket, ChevronRight, XCircle, Info, 
  MapPin, AlertCircle, RefreshCcw, Compass
} from 'lucide-react';

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedBookingId, setExpandedBookingId] = useState(null);
  
  // Cancellation Modal State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState('Personal issues');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    loadMyBookings();
  }, []);

  const loadMyBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.bookings.getMy();
      if (data.success) {
        // Sort by booking date descending
        setBookings(data.bookings.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
      }
    } catch (err) {
      setError('Could not retrieve bookings history. Please verify the backend.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = (booking) => {
    setSelectedBooking(booking);
    setCancelModalOpen(true);
  };

  const handleConfirmCancellation = async () => {
    if (!selectedBooking) return;
    setCancelling(true);
    try {
      const data = await api.bookings.cancel(selectedBooking._id, cancelReason);
      if (data.success) {
        setCancelModalOpen(false);
        setSelectedBooking(null);
        setCancelReason('Personal issues');
        loadMyBookings();
      } else {
        alert(data.message || 'Cancellation request was rejected.');
      }
    } catch (err) {
      alert(err.message || 'Could not process cancellation.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-500">Loading booking records...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex items-center space-x-3.5">
        <div className="w-10 h-10 bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 rounded-xl flex items-center justify-center">
          <Ticket className="w-5.5 h-5.5 animate-pulse-slow" />
        </div>
        <div>
          <h2 className="font-extrabold text-2xl text-slate-900 dark:text-white leading-tight">My Tripzo Journeys</h2>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">Manage your road transit boarding passes and cancellations</p>
        </div>
      </div>

      {error ? (
        <div className="p-8 text-center bg-rose-50 dark:bg-rose-950/20 text-accent-rose text-sm font-semibold rounded-2xl border border-rose-200/50">
          {error}
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-3xl p-12 text-center shadow-sm space-y-4">
          <Compass className="w-12 h-12 text-slate-350 mx-auto" />
          <h3 className="font-extrabold text-lg text-slate-800 dark:text-white">No active journeys</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You haven't booked any bus boarding tickets yet. Let's find your first premium journey!
          </p>
          <Link
            to="/"
            className="inline-flex px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-xs"
          >
            Find Buses
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map(booking => {
            const isConfirmed = booking.bookingStatus === 'Confirmed';
            const isCancelled = booking.bookingStatus === 'Cancelled';
            const isPending = booking.bookingStatus === 'Pending';
            
            return (
              <div 
                key={booking._id} 
                className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 relative overflow-hidden transition-all hover:border-slate-300 dark:hover:border-slate-700"
              >
                {/* Visual Status strip */}
                <div className={`absolute left-0 top-0 h-full w-1.5 ${isConfirmed ? 'bg-accent-emerald' : isCancelled ? 'bg-accent-rose' : 'bg-accent-amber'}`} />

                {/* Header info */}
                <div className="flex justify-between items-start pl-2">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Booking Reference</span>
                    <span className="font-mono text-xs font-bold text-slate-650 dark:text-slate-300 uppercase tracking-wider">{booking._id}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${isConfirmed ? 'bg-emerald-50 text-accent-emerald border-emerald-100 dark:bg-emerald-950/20' : isCancelled ? 'bg-rose-50 text-accent-rose border-rose-100 dark:bg-rose-950/20' : 'bg-amber-50 text-accent-amber border-amber-100 dark:bg-amber-950/20'}`}>
                      {booking.bookingStatus}
                    </span>
                  </div>
                </div>

                {/* Routing info */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-850 pl-6">
                  <div>
                    <span className="block text-[8px] font-bold text-slate-400 uppercase">Boarding Point</span>
                    <p className="font-extrabold text-sm text-slate-800 dark:text-slate-250 truncate">{booking.schedule.route.startingLocation}</p>
                    <p className="text-[10px] text-slate-400 font-bold">Time: {booking.schedule.departureTime}</p>
                  </div>
                  <div className="text-center no-print">
                    <span className="text-[9px] font-bold text-slate-400">{booking.schedule.route.duration}</span>
                    <div className="h-0.5 border-t border-dashed border-slate-200 dark:border-slate-850 my-1 mx-4" />
                  </div>
                  <div className="sm:text-right">
                    <span className="block text-[8px] font-bold text-slate-400 uppercase">Destination Point</span>
                    <p className="font-extrabold text-sm text-slate-800 dark:text-slate-250 truncate">{booking.schedule.route.destination}</p>
                    <p className="text-[10px] text-slate-400 font-bold">Time: {booking.schedule.arrivalTime}</p>
                  </div>
                </div>

                {/* Passenger list summaries */}
                <div className="flex flex-wrap items-center justify-between pl-2 text-xs font-semibold text-slate-500 gap-4">
                  <div className="flex flex-wrap gap-1">
                    <span className="font-bold text-slate-400 mr-2">Seats ({booking.seatsBooked.length}):</span>
                    {booking.seatsBooked.map(s => (
                      <span key={s} className="bg-slate-100 dark:bg-slate-850 border border-slate-200/40 dark:border-slate-800 text-[10px] font-bold px-2 py-0.5 rounded text-slate-700 dark:text-slate-350">
                        {s}
                      </span>
                    ))}
                  </div>

                  <div>
                    <span className="text-slate-400">Total Price:</span>
                    <span className="font-extrabold text-sm text-slate-800 dark:text-white ml-1.5">${booking.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                {expandedBookingId === booking._id && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800 rounded-xl space-y-3">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Seating Arrangement Review</span>
                    <div className="flex justify-center bg-white dark:bg-slate-900/50 p-2 rounded-xl border border-slate-100 dark:border-slate-800/40 max-w-sm mx-auto shadow-inner">
                      <SeatMap 
                        readOnly={true}
                        capacity={booking.schedule.bus.seatCapacity}
                        busType={booking.schedule.bus.type}
                        selectedSeats={booking.seatsBooked}
                        bookedSeats={[]}
                      />
                    </div>
                  </div>
                )}

                {/* Actions (View boarding pass / Cancellation) */}
                <div className="flex justify-between items-center pl-2 pt-3 border-t border-slate-100 dark:border-slate-800/40">
                  <span className="text-[10px] font-bold text-slate-400 flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-350" />
                    <span>Travel Date: {booking.schedule.departureDate}</span>
                  </span>

                  <div className="flex items-center space-x-2">
                    {/* View Boarding Pass */}
                    {(isConfirmed || isPending) && (
                      <>
                        <button
                          type="button"
                          onClick={() => setExpandedBookingId(expandedBookingId === booking._id ? null : booking._id)}
                          className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-250 transition-colors flex items-center space-x-1"
                        >
                          <Info className="w-3.5 h-3.5" />
                          <span>{expandedBookingId === booking._id ? 'Hide Layout' : 'Seat Layout'}</span>
                        </button>
                        
                        <Link
                          to={`/ticket/${booking._id}`}
                          className="px-3.5 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-md shadow-primary-500/10 hover:shadow-primary-500/20 transition-all flex items-center space-x-1"
                        >
                          <Ticket className="w-3.5 h-3.5" />
                          <span>Boarding Pass</span>
                        </Link>
                      </>
                    )}

                    {/* Cancellation Trigger */}
                    {isConfirmed && (
                      <button
                        onClick={() => handleCancelClick(booking)}
                        className="px-3.5 py-2 rounded-lg bg-rose-50 text-accent-rose dark:bg-rose-950/20 dark:text-rose-400 font-bold text-xs border border-rose-200/50 dark:border-rose-900/30 hover:bg-rose-100 transition-colors flex items-center space-x-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cancel Booking</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Modal Overlay */}
      {cancelModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 transform animate-fade-in-up">
            <div className="flex items-center space-x-3.5 text-accent-rose">
              <AlertCircle className="w-8 h-8 shrink-0" />
              <div>
                <h3 className="font-extrabold text-lg text-slate-950 dark:text-white leading-tight">Confirm Cancellation</h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Booking ID: {selectedBooking._id}</p>
              </div>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 text-accent-amber border border-amber-250/50 dark:border-amber-900/30 rounded-2xl flex items-start space-x-3 text-xs leading-relaxed font-semibold">
              <RefreshCcw className="w-5 h-5 shrink-0 mt-0.5" />
              <p>
                <strong>Important Policy:</strong> Tripzo charges a 10% processing fee for cancellations. A refund of <strong>${(selectedBooking.totalAmount * 0.9).toFixed(2)}</strong> (90% of base payment) will be credited to your wallet/bank.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-wider">Cancellation Reason</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary-500 dark:text-white"
              >
                <option value="Personal issues">Personal issues / Family emergency</option>
                <option value="Schedule overlap">Change of travel itinerary</option>
                <option value="Bad weather">Inclement weather warnings</option>
                <option value="Alternative transit">Selected alternative transit method</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setCancelModalOpen(false);
                  setSelectedBooking(null);
                }}
                className="py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-extrabold rounded-xl text-xs"
              >
                Go Back
              </button>
              <button
                onClick={handleConfirmCancellation}
                disabled={cancelling}
                className="py-3.5 bg-accent-rose hover:bg-rose-700 text-white font-extrabold rounded-xl text-xs shadow-md shadow-rose-500/10 transition-all"
              >
                {cancelling ? 'Processing...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
