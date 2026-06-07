const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');

// JWT signer helper
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'tripzo_deep_mind_super_secure_jwt_secret_token_key_2026',
    { expiresIn: '7d' }
  );
};

// SVG-based Mock QR Code generator
const generateQrSvg = (text) => {
  // Generates a simple, beautiful visual vector path block representing a styled QR code
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" class="w-24 h-24 text-slate-800">
    <rect width="100" height="100" fill="#ffffff" rx="8"/>
    <path d="M10 10h20v20H10zm5 5v10h10V15zm25-5h10v10H40zm10 0h20v20H50zm5 5v10h10V15zm25-5h10v10H80zM10 40h10v10H10zm20 0h10v20H30zm10 10h10v10H40zm10-10h20v10H50zm10 10h10v10H60zm10-10h10v20H70zm10 10h10v10H80zM10 70h20v20H10zm5 5v10h10V75zm25-5h10v10H40zm10 0h20v10H50zm20 10h10v10H70zm10-10h10v20H80zM30 80h10v10H30zm20 0h10v10H50z" fill="currentColor"/>
    <circle cx="50" cy="50" r="8" fill="#10b981"/>
  </svg>`;
};

// DB Manual population helpers to ensure fallback JSON works identical to Mongo populate()
const populateScheduleObj = async (sched) => {
  if (!sched) return null;
  const bus = await db.findById('Bus', sched.bus);
  const route = await db.findById('Route', sched.route);
  return { ...sched, bus, route };
};

const populateBookingObj = async (booking) => {
  if (!booking) return null;
  const scheduleRaw = await db.findById('Schedule', booking.schedule);
  const schedule = await populateScheduleObj(scheduleRaw);
  const customer = await db.findById('User', booking.customer);
  // Hide password
  if (customer) delete customer.password;
  return { ...booking, schedule, customer };
};

// ----------------------------------------------------
// 1. AUTHENTICATION MODULE
// ----------------------------------------------------

// Register Customer
router.post('/auth/register', async (req, res) => {
  try {
    const { username, fullName, email, phone, password } = req.reqBody || req.body;
    
    if (!username || !fullName || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const existingEmail = await db.findOne('User', { email });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    const existingUsername = await db.findOne('User', { username });
    if (existingUsername) {
      return res.status(400).json({ success: false, message: 'Username already taken.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await db.create('User', {
      username,
      fullName,
      email,
      phone,
      password: hashedPassword,
      role: 'Customer',
      status: 'Active'
    });

    const token = generateToken(newUser);
    
    // Create welcome notification
    await db.create('Notification', {
      user: newUser._id,
      title: 'Welcome to Tripzo!',
      message: `Hello ${fullName}, welcome to Tripzo! Search and book your journey now.`,
      type: 'Info',
      read: false
    });

    res.status(201).json({
      success: true,
      token,
      user: { _id: newUser._id, fullName, email, phone, role: 'Customer' }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Login (All Roles)
router.post('/auth/login', async (req, res) => {
  try {
    const { email: usernameOrEmail, password } = req.reqBody || req.body;
    
    if (!usernameOrEmail || !password) {
      return res.status(400).json({ success: false, message: 'Username/Email and password are required.' });
    }

    let user = await db.findOne('User', { email: usernameOrEmail });
    if (!user) {
      user = await db.findOne('User', { username: usernameOrEmail });
    }
    
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials.' });
    }

    if (user.status === 'Blocked') {
      return res.status(403).json({ success: false, message: 'Your account has been blocked by Admin.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = generateToken(user);
    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user profile details
router.get('/auth/me', authenticate, async (req, res) => {
  const user = { ...req.user };
  delete user.password;
  res.json({ success: true, user });
});

// Forgot Password (Mock)
router.post('/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.reqBody || req.body;
    const user = await db.findOne('User', { email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found with this email.' });
    }
    // Simulate sending password reset instructions
    res.json({
      success: true,
      message: 'Password reset link sent to your registered email/phone.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// ----------------------------------------------------
// 2. USER MANAGEMENT MODULE (Admin Only)
// ----------------------------------------------------

router.get('/users', authenticate, authorize(['Admin']), async (req, res) => {
  try {
    const list = await db.find('User');
    const sanitised = list.map(u => {
      const copy = { ...u };
      delete copy.password;
      return copy;
    });
    res.json({ success: true, users: sanitised });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/users', authenticate, authorize(['Admin']), async (req, res) => {
  try {
    const body = req.reqBody || req.body;
    const existing = await db.findOne('User', { email: body.email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(body.password || 'tripzo123', salt);

    const newUser = await db.create('User', {
      ...body,
      password: hashedPassword,
      status: body.status || 'Active'
    });
    const copy = { ...newUser };
    delete copy.password;
    res.status(201).json({ success: true, user: copy });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/users/:id', authenticate, authorize(['Admin']), async (req, res) => {
  try {
    const body = req.reqBody || req.body;
    if (body.password) {
      const salt = await bcrypt.genSalt(10);
      body.password = await bcrypt.hash(body.password, salt);
    }
    const updated = await db.findByIdAndUpdate('User', req.params.id, body);
    const copy = { ...updated };
    delete copy.password;
    res.json({ success: true, user: copy });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/users/:id', authenticate, authorize(['Admin']), async (req, res) => {
  try {
    await db.findByIdAndDelete('User', req.params.id);
    res.json({ success: true, message: 'User deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// ----------------------------------------------------
// 3. BUSES CRUD MODULE (Admin / Operator)
// ----------------------------------------------------

router.get('/buses', async (req, res) => {
  try {
    const list = await db.find('Bus');
    res.json({ success: true, buses: list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/buses', authenticate, authorize(['Admin', 'Operator']), async (req, res) => {
  try {
    const body = req.reqBody || req.body;
    const existing = await db.findOne('Bus', { busNumber: body.busNumber });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Bus number already exists.' });
    }
    const newBus = await db.create('Bus', body);
    res.status(201).json({ success: true, bus: newBus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/buses/:id', authenticate, authorize(['Admin', 'Operator']), async (req, res) => {
  try {
    const body = req.reqBody || req.body;
    const updated = await db.findByIdAndUpdate('Bus', req.params.id, body);
    res.json({ success: true, bus: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/buses/:id', authenticate, authorize(['Admin']), async (req, res) => {
  try {
    await db.findByIdAndDelete('Bus', req.params.id);
    res.json({ success: true, message: 'Bus deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// ----------------------------------------------------
// 4. ROUTES CRUD MODULE (Admin / Operator)
// ----------------------------------------------------

router.get('/routes', async (req, res) => {
  try {
    const list = await db.find('Route');
    res.json({ success: true, routes: list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/routes', authenticate, authorize(['Admin', 'Operator']), async (req, res) => {
  try {
    const body = req.reqBody || req.body;
    const newRoute = await db.create('Route', body);
    res.status(201).json({ success: true, route: newRoute });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/routes/:id', authenticate, authorize(['Admin', 'Operator']), async (req, res) => {
  try {
    const body = req.reqBody || req.body;
    const updated = await db.findByIdAndUpdate('Route', req.params.id, body);
    res.json({ success: true, route: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/routes/:id', authenticate, authorize(['Admin']), async (req, res) => {
  try {
    await db.findByIdAndDelete('Route', req.params.id);
    res.json({ success: true, message: 'Route deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// ----------------------------------------------------
// 5. SCHEDULES CRUD MODULE (Customer Booking Search)
// ----------------------------------------------------

router.get('/schedules', async (req, res) => {
  try {
    const { from, to, date } = req.query;
    const list = await db.find('Schedule');
    
    let result = [];
    for (let item of list) {
      const populated = await populateScheduleObj(item);
      if (populated && populated.bus && populated.route) {
        result.push(populated);
      }
    }

    // Apply Filter
    if (from || to || date) {
      result = result.filter(item => {
        let match = true;
        if (from && item.route.startingLocation.toLowerCase() !== from.toLowerCase()) {
          match = false;
        }
        if (to && item.route.destination.toLowerCase() !== to.toLowerCase()) {
          match = false;
        }
        if (date) {
          const searchDate = new Date(date);
          const dayOfWeek = searchDate.toLocaleString('en-US', { weekday: 'long' });
          let runsOnDate = false;
          const frequency = item.frequency || (item.isEveryday ? 'Everyday' : 'Everyday');
          
          if (frequency === 'Everyday') {
            runsOnDate = true;
          } else if (frequency === 'Weekdays' && !['Saturday', 'Sunday'].includes(dayOfWeek)) {
            runsOnDate = true;
          } else if (frequency === 'Weekends' && ['Saturday', 'Sunday'].includes(dayOfWeek)) {
            runsOnDate = true;
          } else if (frequency === 'Specific Days' && item.selectedDays && item.selectedDays.includes(dayOfWeek)) {
            runsOnDate = true;
          }
          
          if (!runsOnDate && item.departureDate !== date) {
            match = false;
          } else if (match && (runsOnDate || item.departureDate === date)) {
            item.departureDate = date;
          }
        }
        return match;
      });
    }

    res.json({ success: true, schedules: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/schedules', authenticate, authorize(['Admin', 'Operator']), async (req, res) => {
  try {
    const body = req.reqBody || req.body;
    
    // Validate Bus and Route
    const bus = await db.findById('Bus', body.bus);
    if (!bus) return res.status(400).json({ success: false, message: 'Bus not found.' });
    
    const newSchedule = await db.create('Schedule', {
      ...body,
      availableSeats: bus.seatCapacity
    });
    
    res.status(201).json({ success: true, schedule: newSchedule });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/schedules/:id', authenticate, authorize(['Admin', 'Operator']), async (req, res) => {
  try {
    const body = req.reqBody || req.body;
    const updated = await db.findByIdAndUpdate('Schedule', req.params.id, body);
    res.json({ success: true, schedule: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/schedules/:id', authenticate, authorize(['Admin']), async (req, res) => {
  try {
    await db.findByIdAndDelete('Schedule', req.params.id);
    res.json({ success: true, message: 'Schedule deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// ----------------------------------------------------
// 6. BOOKINGS & PAYMENTS MODULE (Customer Checkout)
// ----------------------------------------------------

// Create Booking
router.post('/bookings', authenticate, async (req, res) => {
  try {
    const { scheduleId, passengers, seatsBooked, promoCode, includeConvenienceFee } = req.reqBody || req.body;
    
    if (!scheduleId || !passengers || !passengers.length || !seatsBooked || !seatsBooked.length) {
      return res.status(400).json({ success: false, message: 'Missing required booking details.' });
    }

    const schedule = await db.findById('Schedule', scheduleId);
    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Trip schedule not found.' });
    }

    if (schedule.status !== 'Active') {
      return res.status(400).json({ success: false, message: 'This schedule is no longer active.' });
    }

    if (schedule.availableSeats < seatsBooked.length) {
      return res.status(400).json({ success: false, message: 'Not enough seats available.' });
    }

    // Verify seats mapping is not already booked in existing schedules
    const existingBookings = await db.find('Booking', { schedule: scheduleId, bookingStatus: 'Confirmed' });
    const blockedSeats = existingBookings.reduce((acc, curr) => acc.concat(curr.seatsBooked), []);
    const overlaps = seatsBooked.filter(s => blockedSeats.includes(s));
    if (overlaps.length > 0) {
      return res.status(400).json({ success: false, message: `Seats already booked: ${overlaps.join(', ')}` });
    }

    let baseAmount = schedule.ticketPrice * seatsBooked.length;
    let discount = 0;

    if (promoCode) {
      const offer = await db.findOne('Offer', { code: promoCode, status: 'Active' });
      if (offer) {
        // Expiry check
        const today = new Date().toISOString().split('T')[0];
        if (offer.expiryDate >= today && baseAmount >= offer.minBookingValue) {
          if (offer.discountType === 'Percentage') {
            discount = baseAmount * (offer.value / 100);
          } else {
            discount = Math.min(offer.value, baseAmount);
          }
        }
      }
    }

    const convenienceFee = includeConvenienceFee ? 2 : 0;
    const totalAmount = Math.max(baseAmount - discount + convenienceFee, 0);

    const booking = await db.create('Booking', {
      customer: req.user._id,
      schedule: scheduleId,
      passengers,
      seatsBooked,
      totalAmount,
      convenienceFee,
      paymentStatus: 'Pending',
      bookingStatus: 'Pending'
    });

    res.status(201).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Process Checkout Payment
router.post('/payments/checkout', authenticate, async (req, res) => {
  try {
    const { bookingId, paymentMethod, cardDetails } = req.reqBody || req.body;
    
    const booking = await db.findById('Booking', bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

    if (booking.bookingStatus === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'This booking has already been cancelled.' });
    }

    const schedule = await db.findById('Schedule', booking.schedule);
    if (!schedule) return res.status(404).json({ success: false, message: 'Schedule not found.' });

    // Deduct available seats
    const newAvailable = Math.max(schedule.availableSeats - booking.seatsBooked.length, 0);
    await db.findByIdAndUpdate('Schedule', booking.schedule, { availableSeats: newAvailable });

    // Mock successful transaction
    const transactionId = 'TXN_' + Math.random().toString(36).substring(2, 10).toUpperCase();
    
    // Save Payment
    const payment = await db.create('Payment', {
      booking: bookingId,
      customer: req.user._id,
      amount: booking.totalAmount,
      paymentMethod: paymentMethod || 'Card',
      status: 'Paid',
      transactionId,
      paymentDate: new Date()
    });

    // Generate Tickets
    const ticketQr = generateQrSvg(`TICKET:${bookingId}:${booking.seatsBooked.join(',')}`);
    
    // Update Booking Status
    const updatedBooking = await db.findByIdAndUpdate('Booking', bookingId, {
      paymentStatus: 'Paid',
      bookingStatus: 'Confirmed'
    });

    // Notify Customer
    await db.create('Notification', {
      user: req.user._id,
      title: 'Booking Confirmed!',
      message: `Your booking (ID: ${bookingId}) for seats ${booking.seatsBooked.join(', ')} is confirmed. Total Paid: $${booking.totalAmount}.`,
      type: 'Booking',
      read: false
    });

    res.json({
      success: true,
      booking: updatedBooking,
      payment,
      qrCode: ticketQr
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Customer booking history
router.get('/bookings/my', authenticate, async (req, res) => {
  try {
    const list = await db.find('Booking', { customer: req.user._id });
    const populated = [];
    for (let booking of list) {
      const p = await populateBookingObj(booking);
      if (p) populated.push(p);
    }
    res.json({ success: true, bookings: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Cancel Booking (With Refund)
router.post('/bookings/:id/cancel', authenticate, async (req, res) => {
  try {
    const booking = await db.findById('Booking', req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

    if (booking.bookingStatus === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled.' });
    }

    const { reason } = req.reqBody || req.body || { reason: 'Requested by user' };

    // Update Schedule seats
    const schedule = await db.findById('Schedule', booking.schedule);
    if (schedule) {
      const restoreSeats = schedule.availableSeats + booking.seatsBooked.length;
      await db.findByIdAndUpdate('Schedule', booking.schedule, { availableSeats: restoreSeats });
    }

    // Cancel booking
    await db.findByIdAndUpdate('Booking', req.params.id, {
      bookingStatus: 'Cancelled',
      paymentStatus: booking.paymentStatus === 'Paid' ? 'Refunded' : 'Pending'
    });

    // Process refund structure
    let refundAmount = 0;
    if (booking.paymentStatus === 'Paid') {
      refundAmount = booking.totalAmount * 0.9; // 10% cancellation charge
      // Log cancellation
      await db.create('Payment', {
        booking: booking._id,
        customer: booking.customer,
        amount: -refundAmount,
        paymentMethod: 'Online Wallet',
        status: 'Refunded',
        transactionId: 'REF_' + Math.random().toString(36).substring(2, 10).toUpperCase()
      });
    }

    // Notify Customer
    await db.create('Notification', {
      user: booking.customer,
      title: 'Booking Cancelled',
      message: `Your booking ${booking._id} has been cancelled successfully. Refund of $${refundAmount} has been processed.`,
      type: 'Cancellation',
      read: false
    });

    res.json({ success: true, message: 'Booking cancelled successfully, refund processed.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get All Bookings (Admin/Operator)
router.get('/bookings', authenticate, authorize(['Admin', 'Operator']), async (req, res) => {
  try {
    const list = await db.find('Booking');
    const populated = [];
    for (let booking of list) {
      const p = await populateBookingObj(booking);
      if (p) populated.push(p);
    }
    res.json({ success: true, bookings: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// ----------------------------------------------------
// 7. PAYMENTS CRUD (Admin Only)
// ----------------------------------------------------

router.get('/payments', authenticate, authorize(['Admin', 'Operator']), async (req, res) => {
  try {
    const list = await db.find('Payment');
    const populated = [];
    for (let p of list) {
      const customer = await db.findById('User', p.customer);
      if (customer) delete customer.password;
      populated.push({ ...p, customer });
    }
    res.json({ success: true, payments: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// ----------------------------------------------------
// 8. OFFERS CRUD (Promo Codes)
// ----------------------------------------------------

router.get('/offers', async (req, res) => {
  try {
    const list = await db.find('Offer');
    res.json({ success: true, offers: list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/offers/verify', async (req, res) => {
  try {
    const { code, amount } = req.reqBody || req.body;
    const offer = await db.findOne('Offer', { code, status: 'Active' });
    if (!offer) {
      return res.status(400).json({ success: false, message: 'Invalid or inactive promo code.' });
    }

    const today = new Date().toISOString().split('T')[0];
    if (offer.expiryDate < today) {
      return res.status(400).json({ success: false, message: 'Promo code has expired.' });
    }

    if (amount < offer.minBookingValue) {
      return res.status(400).json({ success: false, message: `Minimum booking value must be $${offer.minBookingValue}.` });
    }

    res.json({ success: true, offer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/offers', authenticate, authorize(['Admin', 'Operator']), async (req, res) => {
  try {
    const body = req.reqBody || req.body;
    const existing = await db.findOne('Offer', { code: body.code });
    if (existing) return res.status(400).json({ success: false, message: 'Promo code already exists.' });
    
    const newOffer = await db.create('Offer', body);
    res.status(201).json({ success: true, offer: newOffer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/offers/:id', authenticate, authorize(['Admin', 'Operator']), async (req, res) => {
  try {
    const body = req.reqBody || req.body;
    const updated = await db.findByIdAndUpdate('Offer', req.params.id, body);
    res.json({ success: true, offer: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/offers/:id', authenticate, authorize(['Admin']), async (req, res) => {
  try {
    await db.findByIdAndDelete('Offer', req.params.id);
    res.json({ success: true, message: 'Offer deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// ----------------------------------------------------
// 9. REVIEWS & FEEDBACK
// ----------------------------------------------------

router.get('/reviews', async (req, res) => {
  try {
    const list = await db.find('Review');
    const populated = [];
    for (let r of list) {
      const customer = await db.findById('User', r.customer);
      const bus = await db.findById('Bus', r.bus);
      if (customer) delete customer.password;
      populated.push({ ...r, customer, bus });
    }
    res.json({ success: true, reviews: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/reviews', authenticate, async (req, res) => {
  try {
    const { busId, rating, comment } = req.reqBody || req.body;
    const newReview = await db.create('Review', {
      customer: req.user._id,
      bus: busId,
      rating,
      comment
    });
    res.status(201).json({ success: true, review: newReview });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/reviews/:id', authenticate, authorize(['Admin']), async (req, res) => {
  try {
    await db.findByIdAndDelete('Review', req.params.id);
    res.json({ success: true, message: 'Review deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// ----------------------------------------------------
// 10. NOTIFICATIONS MODULE
// ----------------------------------------------------

router.get('/notifications', authenticate, async (req, res) => {
  try {
    const list = await db.find('Notification', { user: req.user._id });
    res.json({ success: true, notifications: list.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/notifications/read', authenticate, async (req, res) => {
  try {
    const list = await db.find('Notification', { user: req.user._id, read: false });
    for (let notif of list) {
      await db.findByIdAndUpdate('Notification', notif._id, { read: true });
    }
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


// ----------------------------------------------------
// 11. REPORTS AND KPI DASHBOARD ANALYTICS (Admin)
// ----------------------------------------------------

router.get('/reports/dashboard', authenticate, authorize(['Admin', 'Operator']), async (req, res) => {
  try {
    const usersCount = await db.count('User', { role: 'Customer' });
    const busesCount = await db.count('Bus');
    const routesCount = await db.count('Route');
    const schedulesCount = await db.count('Schedule');
    
    const bookings = await db.find('Booking');
    const payments = await db.find('Payment');
    
    // KPI Math
    const totalBookings = bookings.length;
    const cancelledBookings = bookings.filter(b => b.bookingStatus === 'Cancelled').length;
    
    let totalRevenue = 0;
    payments.forEach(p => {
      if (p.status === 'Paid') {
        totalRevenue += p.amount;
      } else if (p.status === 'Refunded') {
        // Deduct refunded
        totalRevenue += p.amount; // amount is negative for refunds
      }
    });

    const todayStr = new Date().toISOString().split('T')[0];
    const todayBookings = bookings.filter(b => {
      const dateToParse = b.bookingDate || b.createdAt || new Date();
      const bDate = new Date(dateToParse).toISOString().split('T')[0];
      return bDate === todayStr;
    }).length;

    const availableBuses = await db.count('Bus', { status: 'Available' });

    // Recent Payments
    const recentPayments = [];
    const sortedPayments = payments.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
    for (let p of sortedPayments) {
      const customer = await db.findById('User', p.customer);
      recentPayments.push({
        _id: p._id,
        amount: p.amount,
        paymentMethod: p.paymentMethod,
        status: p.status,
        date: p.paymentDate,
        customerName: customer ? customer.fullName : 'Guest'
      });
    }

    // Chart Data (Mocking last 6 months or 7 days)
    const revenueChart = [
      { month: 'Jan', revenue: totalRevenue * 0.12 + 500, bookings: Math.floor(totalBookings * 0.10 + 5) },
      { month: 'Feb', revenue: totalRevenue * 0.15 + 650, bookings: Math.floor(totalBookings * 0.13 + 7) },
      { month: 'Mar', revenue: totalRevenue * 0.18 + 700, bookings: Math.floor(totalBookings * 0.16 + 9) },
      { month: 'Apr', revenue: totalRevenue * 0.22 + 900, bookings: Math.floor(totalBookings * 0.20 + 12) },
      { month: 'May', revenue: totalRevenue * 0.33, bookings: Math.floor(totalBookings * 0.41) }
    ];

    res.json({
      success: true,
      kpis: {
        totalUsers: usersCount + 3, // Mock some active counters
        totalBuses: busesCount,
        totalRoutes: routesCount,
        totalSchedules: schedulesCount,
        totalBookings,
        todayBookings,
        cancelledBookings,
        availableBuses,
        totalRevenue: Math.max(totalRevenue, 0)
      },
      recentPayments,
      charts: {
        revenueChart
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
