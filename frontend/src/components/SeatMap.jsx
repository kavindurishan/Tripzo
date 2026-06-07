import React from 'react';

export default function SeatMap({ 
  capacity = 40, 
  busType = 'Normal', 
  bookedSeats = [], 
  selectedSeats = [], 
  onSeatSelect,
  readOnly = false 
}) {
  const isLuxury = busType === 'Luxury' || busType === 'AC';
  const seatsPerRow = isLuxury ? 4 : 5;
  const rowsCount = Math.ceil(capacity / seatsPerRow);
  const seats = [];

  for (let r = 0; r < rowsCount; r++) {
    const rowSeats = [];
    const letters = isLuxury ? ['A', 'B', 'C', 'D'] : ['A', 'B', 'C', 'D', 'E'];
    for (let c = 0; c < seatsPerRow; c++) {
      const seatNum = `${r + 1}${letters[c]}`;
      const seatIndex = r * seatsPerRow + c;
      if (seatIndex < capacity) {
        rowSeats.push({
          number: seatNum,
          type: c === 0 || c === (seatsPerRow - 1) ? 'Window' : 'Aisle',
          isBooked: bookedSeats.includes(seatNum),
          isSelected: selectedSeats.includes(seatNum)
        });
      }
    }
    seats.push(rowSeats);
  }

  const handleSeatClick = (seat) => {
    if (readOnly || seat.isBooked) return;
    if (onSeatSelect) onSeatSelect(seat.number);
  };

  return (
    <div className={`w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm ${readOnly ? 'p-4 border-0 shadow-none bg-transparent dark:bg-transparent' : ''}`}>
      {!readOnly && (
        <>
          <h3 className="font-bold text-lg mb-4 text-slate-800 dark:text-white flex items-center space-x-2">
            <span>Select Your Seats</span>
            <span className="text-xs font-normal text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
              {selectedSeats.length} Selected
            </span>
          </h3>

          {/* Seat Map Legend */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800/40">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900" />
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Available</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-md bg-primary-500 border border-primary-600 shadow-md shadow-primary-500/20" />
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Selected</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-md bg-accent-rose border border-rose-600 shadow-md shadow-rose-500/10" />
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Booked</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 rounded-md bg-accent-amber border border-amber-600 shadow-md shadow-amber-500/10" />
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Reserved</span>
            </div>
          </div>
        </>
      )}

      {/* Physical Bus Visual Structure */}
      <div 
        className="mx-auto border-4 border-slate-350 dark:border-slate-800 rounded-3xl p-4 bg-slate-50 dark:bg-slate-950 relative overflow-hidden shadow-inner transition-all duration-300"
        style={{ maxWidth: isLuxury ? '280px' : '330px' }}
      >
        {/* Windshield & Driver Cab */}
        <div className="flex justify-between items-center pb-4 border-b-2 border-dashed border-slate-200 dark:border-slate-800 mb-6">
          <div className="w-8 h-8 text-slate-400 flex items-center justify-center border border-slate-300 dark:border-slate-800 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-slate-500">
              <circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/>
            </svg>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 bg-slate-200/50 dark:bg-slate-800 px-2 py-0.5 rounded">
            Front (Driver)
          </span>
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-800" />
        </div>

        {/* Seats Matrix */}
        <div className="space-y-4">
          {seats.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-between items-center">
              {/* Left Two Seats */}
              <div className="flex space-x-2">
                {row.slice(0, 2).map((seat) => {
                  let seatClass = 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700';
                  if (!readOnly) seatClass += ' hover:scale-105 cursor-pointer';
                  
                  if (seat.isSelected) {
                    seatClass = 'bg-primary-500 border-primary-600 text-white shadow-md shadow-primary-500/25';
                  } else if (seat.isBooked) {
                    seatClass = 'bg-accent-rose/10 border-accent-rose/30 text-accent-rose/70 cursor-not-allowed';
                  }
                  
                  return (
                    <button
                      key={seat.number}
                      type="button"
                      onClick={() => handleSeatClick(seat)}
                      disabled={seat.isBooked || readOnly}
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg border-2 text-[10px] font-bold flex flex-col items-center justify-center transition-all ${seatClass}`}
                      title={`${seat.number} (${seat.type})`}
                    >
                      <span>{seat.number}</span>
                      <span className="text-[6px] font-medium opacity-65 leading-none mt-0.5">
                        {seat.type[0]}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Central Aisle */}
              <div className="text-[8px] font-extrabold uppercase tracking-widest text-slate-300 dark:text-slate-800 select-none px-1">
                Aisle
              </div>

              {/* Right Seats (2 for Luxury, 3 for Normal) */}
              <div className="flex space-x-2">
                {row.slice(2, isLuxury ? 4 : 5).map((seat) => {
                  let seatClass = 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700';
                  if (!readOnly) seatClass += ' hover:scale-105 cursor-pointer';
                  
                  if (seat.isSelected) {
                    seatClass = 'bg-primary-500 border-primary-600 text-white shadow-md shadow-primary-500/25';
                  } else if (seat.isBooked) {
                    seatClass = 'bg-accent-rose/10 border-accent-rose/30 text-accent-rose/70 cursor-not-allowed';
                  }
                  
                  return (
                    <button
                      key={seat.number}
                      type="button"
                      onClick={() => handleSeatClick(seat)}
                      disabled={seat.isBooked || readOnly}
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg border-2 text-[10px] font-bold flex flex-col items-center justify-center transition-all ${seatClass}`}
                      title={`${seat.number} (${seat.type})`}
                    >
                      <span>{seat.number}</span>
                      <span className="text-[6px] font-medium opacity-65 leading-none mt-0.5">
                        {seat.type[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Back of the Bus details */}
        <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-900 text-center text-[9px] uppercase tracking-widest font-extrabold text-slate-300 dark:text-slate-850">
          Rear Engine
        </div>
      </div>
    </div>
  );
}
