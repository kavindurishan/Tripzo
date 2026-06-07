const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const { connectDB, db } = require('./config/db');
const apiRouter = require('./routes/api');

// Initialize config
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Seed function to pre-populate database with rich data
const seedDatabase = async () => {
  try {
    const userCount = await db.count('User');
    if (userCount > 0) {
      console.log('🌱 Database already seeded.');
      return;
    }

    console.log('🌱 Seeding default Tripzo database records...');

    // 1. Seed Users (with hashed passwords)
    const salt = await bcrypt.genSalt(10);
    const adminPass = await bcrypt.hash('admin123', salt);
    const operatorPass = await bcrypt.hash('operator123', salt);
    const customerPass = await bcrypt.hash('customer123', salt);

    const admin = await db.create('User', {
      fullName: 'Tripzo Administrator',
      email: 'admin@tripzo.com',
      phone: '+94 77 123 4567',
      password: adminPass,
      role: 'Admin',
      status: 'Active'
    });

    const operator = await db.create('User', {
      fullName: 'Southern Transit Operators',
      email: 'operator@tripzo.com',
      phone: '+94 77 987 6543',
      password: operatorPass,
      role: 'Operator',
      status: 'Active'
    });

    const customer = await db.create('User', {
      fullName: 'Kavindu Rishan',
      email: 'customer@tripzo.com',
      phone: '+94 71 555 4444',
      password: customerPass,
      role: 'Customer',
      status: 'Active'
    });

    console.log('✅ Seeded Users: Admin, Operator, Customer');

    // 2. Seed Buses
    const bus1 = await db.create('Bus', {
      busNumber: 'NP-4521',
      name: 'Tripzo Luxury Liner (AC)',
      type: 'Luxury',
      seatCapacity: 40,
      facilities: ['Wi-Fi', 'Charging', 'AC', 'TV'],
      image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=600',
      status: 'Available'
    });

    const bus2 = await db.create('Bus', {
      busNumber: 'NP-8894',
      name: 'Southern Express',
      type: 'Semi Luxury',
      seatCapacity: 44,
      facilities: ['Charging', 'AC', 'TV'],
      image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&q=80&w=600',
      status: 'Available'
    });

    const bus3 = await db.create('Bus', {
      busNumber: 'NP-1042',
      name: 'Tripzo Super AC Premium',
      type: 'AC',
      seatCapacity: 36,
      facilities: ['Wi-Fi', 'Charging', 'AC'],
      image: 'https://images.unsplash.com/photo-1562620644-65ab47390225?auto=format&fit=crop&q=80&w=600',
      status: 'Available'
    });

    console.log('✅ Seeded Buses');

    // 3. Seed Routes
    const route1 = await db.create('Route', {
      startingLocation: 'Colombo',
      destination: 'Kandy',
      distance: 115,
      duration: '3h 15m',
      stops: [
        { name: 'Kadawatha Highway Entrance', distanceOffset: 15, timeOffset: '25m' },
        { name: 'Kegalle Transit Hub', distanceOffset: 70, timeOffset: '2h 0m' },
        { name: 'Peradeniya Junction', distanceOffset: 105, timeOffset: '3h 0m' }
      ],
      status: 'Active'
    });

    const route2 = await db.create('Route', {
      startingLocation: 'Colombo',
      destination: 'Galle',
      distance: 125,
      duration: '2h 0m',
      stops: [
        { name: 'Kottawa Highway Interchange', distanceOffset: 20, timeOffset: '15m' },
        { name: 'Welipenna Service Area', distanceOffset: 65, timeOffset: '1h 0m' },
        { name: 'Nayapamula Exit', distanceOffset: 110, timeOffset: '1h 45m' }
      ],
      status: 'Active'
    });

    console.log('✅ Seeded Routes');

    // 4. Seed Schedules (Trips)
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const sched1 = await db.create('Schedule', {
      bus: bus1._id,
      route: route1._id,
      departureDate: today,
      departureTime: '07:30',
      arrivalTime: '10:45',
      ticketPrice: 15,
      availableSeats: bus1.seatCapacity,
      frequency: 'Everyday',
      selectedDays: [],
      status: 'Active'
    });

    const sched2 = await db.create('Schedule', {
      bus: bus3._id,
      route: route1._id,
      departureDate: today,
      departureTime: '14:00',
      arrivalTime: '17:15',
      ticketPrice: 18,
      availableSeats: bus3.seatCapacity,
      status: 'Active'
    });

    const sched3 = await db.create('Schedule', {
      bus: bus2._id,
      route: route2._id,
      departureDate: today,
      departureTime: '09:00',
      arrivalTime: '11:00',
      ticketPrice: 12,
      availableSeats: bus2.seatCapacity,
      status: 'Active'
    });

    const sched4 = await db.create('Schedule', {
      bus: bus1._id,
      route: route2._id,
      departureDate: tomorrow,
      departureTime: '08:00',
      arrivalTime: '10:00',
      ticketPrice: 16,
      availableSeats: bus1.seatCapacity,
      status: 'Active'
    });

    console.log('✅ Seeded Trip Schedules');

    // 5. Seed Offers (Promo Codes)
    await db.create('Offer', {
      code: 'TRIPZO10',
      discountType: 'Percentage',
      value: 10,
      minBookingValue: 10,
      expiryDate: '2026-12-31',
      status: 'Active'
    });

    await db.create('Offer', {
      code: 'WELCOME50',
      discountType: 'Fixed',
      value: 5,
      minBookingValue: 20,
      expiryDate: '2026-12-31',
      status: 'Active'
    });

    console.log('✅ Seeded Offers');

    // 6. Seed reviews
    await db.create('Review', {
      customer: customer._id,
      bus: bus1._id,
      rating: 5,
      comment: 'Excellent journey, extremely comfortable luxury seats and fast Highway route.'
    });

    await db.create('Review', {
      customer: customer._id,
      bus: bus2._id,
      rating: 4,
      comment: 'Decent, charging port was working well. Highly recommended.'
    });

    console.log('✅ Seeded Reviews');
    console.log('🌱 Tripzo Database Seeding complete! 🎉');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
};

// Mount API routes
app.use('/api', apiRouter);

// Base route for connectivity checks
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Tripzo Bus Booking System REST API online!',
    mode: db.isLocal() ? 'Local File Fallback Database' : 'MongoDB Production Database'
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

// Start Server
const start = async () => {
  await connectDB();
  await seedDatabase();
  app.listen(PORT, () => {
    console.log(`🚀 Tripzo REST API Server running on port ${PORT}`);
  });
};

start();
