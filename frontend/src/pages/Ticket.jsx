import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { 
  Printer, ArrowLeft, Calendar, Compass, MapPin, 
  User, CheckCircle, Smartphone, Info
} from 'lucide-react';

export default function Ticket() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [qrCodeSvg, setQrCodeSvg] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTicketInfo();
  }, [bookingId]);

  const loadTicketInfo = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch user's bookings and matches
      const data = await api.bookings.getMy();
      if (data.success) {
        const matched = data.bookings.find(b => b._id === bookingId);
        if (matched) {
          setBooking(matched);
          
          // Generate QR code representation using inline SVG generator
          const qrSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class="w-28 h-28 text-slate-900 mx-auto">
            <rect width="100" height="100" fill="#ffffff" rx="8"/>
            <path d="M10 10h20v20H10zm5 5v10h10V15zm25-5h10v10H40zm10 0h20v20H50zm5 5v10h10V15zm25-5h10v10H80zM10 40h10v10H10zm20 0h10v20H30zm10 10h10v10H40zm10-10h20v10H50zm10 10h10v10H60zm10-10h10v20H70zm10 10h10v10H80zM10 70h20v20H10zm5 5v10h10V75zm25-5h10v10H40zm10 0h20v10H50zm20 10h10v10H70zm10-10h10v20H80zM30 80h10v10H30zm20 0h10v10H50z" fill="currentColor"/>
            <circle cx="50" cy="50" r="8" fill="#10b981"/>
          </svg>`;
          setQrCodeSvg(qrSvg);
        } else {
          setError('Ticket record could not be located.');
        }
      }
    } catch (err) {
      setError('Could not retrieve boarding pass details.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-500">Generating digital boarding pass...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center px-4">
        <div className="p-8 bg-rose-50 dark:bg-rose-950/20 text-accent-rose text-sm font-semibold rounded-2xl border border-rose-200/50">
          {error || 'Ticket record not found.'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Top CTA Row */}
      <div className="flex justify-between items-center no-print">
        <Link 
          to="/bookings" 
          className="flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-slate-850 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>My Journeys</span>
        </Link>
        <button
          onClick={handlePrint}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-xs shadow-md shadow-primary-500/10 hover:shadow-primary-500/20 transition-all"
        >
          <Printer className="w-4 h-4" />
          <span>Print Ticket</span>
        </button>
      </div>

      {/* Success Notification Bar */}
      <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/30 p-4 rounded-2xl flex items-center space-x-3.5 text-accent-emerald no-print">
        <CheckCircle className="w-6 h-6 shrink-0" />
        <div className="text-xs">
          <p className="font-extrabold">Booking Confirmed Successfully!</p>
          <p className="font-semibold text-emerald-600/80 dark:text-emerald-455 mt-0.5">Your ticket is active. Present this digital code during boarding.</p>
        </div>
      </div>

      {/* physical printed ticket frame */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl print-border-0">
        {/* Ticket Header Banner */}
        <div className="bg-gradient-to-r from-primary-600 to-accent-cyan px-6 py-5 text-white flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Compass className="w-6 h-6 text-white" />
            <span className="font-extrabold text-lg tracking-tight">Tripzo Boarding Pass</span>
          </div>
          <span className="text-[10px] bg-white/20 border border-white/10 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
            {booking.bookingStatus}
          </span>
        </div>

        {/* Ticket Route segment */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center border-b border-slate-100 dark:border-slate-800/60">
          <div className="space-y-1">
            <span className="block text-[8px] font-bold text-slate-400 uppercase">Boarding Terminal</span>
            <p className="font-extrabold text-lg text-slate-800 dark:text-white leading-tight">{booking.schedule.route.startingLocation}</p>
            <p className="text-[10px] text-slate-400 font-bold">Departure: {booking.schedule.departureTime}</p>
          </div>

          <div className="text-center relative">
            <span className="text-[9px] font-bold text-primary-500 bg-primary-50 dark:bg-primary-950/20 px-2.5 py-0.5 rounded-full border border-primary-100 dark:border-primary-900/30">
              Transit
            </span>
            <div className="h-0.5 border-t border-dashed border-slate-200 dark:border-slate-800 my-2 mx-6" />
            <span className="text-[9px] text-slate-400 font-semibold">{booking.schedule.route.duration} Non-Stop</span>
          </div>

          <div className="space-y-1 md:text-right">
            <span className="block text-[8px] font-bold text-slate-400 uppercase">Arrival Terminal</span>
            <p className="font-extrabold text-lg text-slate-800 dark:text-white leading-tight">{booking.schedule.route.destination}</p>
            <p className="text-[10px] text-slate-400 font-bold">Estimated: {booking.schedule.arrivalTime}</p>
          </div>
        </div>

        {/* Dashed cut lines ticket decoration */}
        <div className="ticket-dashed-border h-0.5 border-t border-dashed border-slate-300 dark:border-slate-800 relative z-10" />

        {/* Passenger details and QR section */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Passenger details block */}
          <div className="md:col-span-8 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="block text-[8px] font-bold text-slate-400 uppercase">Passenger Names</span>
                <div className="space-y-1 mt-1">
                  {booking.passengers.map((p, i) => (
                    <p key={i} className="text-xs font-extrabold text-slate-850 dark:text-slate-100 flex items-center space-x-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{p.fullName} ({p.age}, {p.gender[0]})</span>
                    </p>
                  ))}
                </div>
              </div>

              <div>
                <span className="block text-[8px] font-bold text-slate-400 uppercase">Seats Assigned</span>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {booking.seatsBooked.map(seat => (
                    <span key={seat} className="bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 text-slate-750 dark:text-slate-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded">
                      Seat {seat}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800/40">
              <div>
                <span className="block text-[8px] font-bold text-slate-400 uppercase">Travel Schedule</span>
                <p className="font-extrabold text-xs text-slate-800 dark:text-slate-200 mt-1 flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{booking.schedule.departureDate}</span>
                </p>
              </div>

              <div>
                <span className="block text-[8px] font-bold text-slate-400 uppercase">Bus Fleet Fleet</span>
                <p className="font-extrabold text-xs text-slate-800 dark:text-slate-200 mt-1 truncate">
                  {booking.schedule.bus.name}
                </p>
                <p className="text-[9px] text-slate-400 font-bold">{booking.schedule.bus.busNumber} &bull; {booking.schedule.bus.type}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800/40">
              <div>
                <span className="block text-[8px] font-bold text-slate-400 uppercase">Transaction ID</span>
                <p className="font-mono text-[10px] text-slate-500 font-semibold mt-1">TXN_TRP_{bookingId.slice(0, 8).toUpperCase()}</p>
              </div>

              <div>
                <span className="block text-[8px] font-bold text-slate-400 uppercase">Payment Status</span>
                <p className="font-extrabold text-xs text-accent-emerald mt-1">{booking.paymentStatus}</p>
              </div>
            </div>
          </div>

          {/* QR Code Column */}
          <div className="md:col-span-4 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800/40 pt-6 md:pt-0 md:pl-6 text-center space-y-3">
            <div dangerouslySetInnerHTML={{ __html: qrCodeSvg }} />
            <div>
              <span className="text-[8px] font-bold text-slate-400 uppercase block">Boarding Pass Token</span>
              <span className="font-mono text-[9px] text-slate-550 font-bold uppercase tracking-wider">{booking._id}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Smart Device reminder info no-print */}
      <div className="p-4 bg-slate-55/60 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl flex items-start space-x-3 text-slate-500 no-print">
        <Info className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed">
          <strong>Tip:</strong> Keep this ticket opened on your smartphone screen. The Tripzo scanner checks the QR code dynamically. Make sure to arrive at the boarding gate at least 15 minutes before the departure time.
        </p>
      </div>
    </div>
  );
}
