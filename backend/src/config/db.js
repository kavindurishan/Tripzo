const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

let useLocalJsonDb = false;
const JSON_DB_DIR = path.join(__dirname, '..', '..', 'data');

// Create the JSON database directory if it doesn't exist
if (!fs.existsSync(JSON_DB_DIR)) {
  fs.mkdirSync(JSON_DB_DIR, { recursive: true });
}

// Schemas Definitions for MongoDB Mongoose
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'Operator', 'Customer'], default: 'Customer' },
  status: { type: String, enum: ['Active', 'Blocked'], default: 'Active' }
}, { timestamps: true });

const busSchema = new mongoose.Schema({
  busNumber: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['Normal', 'Semi Luxury', 'Luxury', 'AC'], default: 'Normal' },
  seatCapacity: { type: Number, default: 40 },
  facilities: [{ type: String }], // Wi-Fi, Charging, AC, TV
  image: { type: String },
  status: { type: String, enum: ['Available', 'Maintenance', 'Inactive'], default: 'Available' }
}, { timestamps: true });

const routeSchema = new mongoose.Schema({
  startingLocation: { type: String, required: true },
  destination: { type: String, required: true },
  distance: { type: Number, required: true }, // in km
  duration: { type: String, required: true }, // e.g. "4h 30m"
  stops: [{ name: String, distanceOffset: Number, timeOffset: String }],
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, { timestamps: true });

const scheduleSchema = new mongoose.Schema({
  bus: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', required: true },
  route: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
  departureDate: { type: String, required: true }, // YYYY-MM-DD
  departureTime: { type: String, required: true }, // HH:MM
  arrivalTime: { type: String, required: true }, // HH:MM
  ticketPrice: { type: Number, required: true },
  availableSeats: { type: Number, required: true },
  isEveryday: { type: Boolean, default: false },
  status: { type: String, enum: ['Active', 'Completed', 'Cancelled'], default: 'Active' }
}, { timestamps: true });

const bookingSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  schedule: { type: mongoose.Schema.Types.ObjectId, ref: 'Schedule', required: true },
  passengers: [{
    fullName: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    seatNumber: { type: String, required: true }
  }],
  seatsBooked: [{ type: String }],
  totalAmount: { type: Number, required: true },
  convenienceFee: { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ['Paid', 'Pending', 'Failed', 'Refunded'], default: 'Pending' },
  bookingStatus: { type: String, enum: ['Confirmed', 'Pending', 'Cancelled'], default: 'Pending' },
  bookingDate: { type: Date, default: Date.now }
}, { timestamps: true });

const paymentSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['Card', 'Bank Transfer', 'Cash', 'Online Wallet'], default: 'Card' },
  status: { type: String, enum: ['Paid', 'Pending', 'Failed', 'Refunded'], default: 'Pending' },
  transactionId: { type: String },
  paymentDate: { type: Date, default: Date.now }
}, { timestamps: true });

const reviewSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bus: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

const offerSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discountType: { type: String, enum: ['Percentage', 'Fixed'], default: 'Percentage' },
  value: { type: Number, required: true },
  minBookingValue: { type: Number, default: 0 },
  expiryDate: { type: String, required: true }, // YYYY-MM-DD
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' }
}, { timestamps: true });

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['Booking', 'Payment', 'Cancellation', 'Info'], default: 'Info' },
  read: { type: Boolean, default: false },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

// Define Mongoose Models
let models = {};

try {
  models.User = mongoose.model('User', userSchema);
  models.Bus = mongoose.model('Bus', busSchema);
  models.Route = mongoose.model('Route', routeSchema);
  models.Schedule = mongoose.model('Schedule', scheduleSchema);
  models.Booking = mongoose.model('Booking', bookingSchema);
  models.Payment = mongoose.model('Payment', paymentSchema);
  models.Review = mongoose.model('Review', reviewSchema);
  models.Offer = mongoose.model('Offer', offerSchema);
  models.Notification = mongoose.model('Notification', notificationSchema);
} catch (e) {
  // Model compilation failed, might be recompiled, which is fine
}

// JSON file storage helpers
const loadJsonData = (collection) => {
  const filePath = path.join(JSON_DB_DIR, `${collection.toLowerCase()}.json`);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([], null, 2));
    return [];
  }
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading database file for ${collection}:`, err);
    return [];
  }
};

const saveJsonData = (collection, data) => {
  const filePath = path.join(JSON_DB_DIR, `${collection.toLowerCase()}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

const generateMockId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Database Connect Setup
const connectDB = async () => {
  const dbUri = process.env.MONGODB_URI || 'mongodb://admin:admin2004@ac-9dtwz7h-shard-00-00.2de2zey.mongodb.net:27017,ac-9dtwz7h-shard-00-01.2de2zey.mongodb.net:27017,ac-9dtwz7h-shard-00-02.2de2zey.mongodb.net:27017/?ssl=true&replicaSet=atlas-127bgc-shard-0&authSource=admin&appName=Cluster0';
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(dbUri, {
      serverSelectionTimeoutMS: 2000 // Timeout early so we fall back quickly
    });
    
    // Perform a real database operation test to verify that the SSL/TLS handshake successfully passes.
    // If the SSL handshake fails (e.g. because the current IP is not whitelisted in Atlas),
    // it will throw an error immediately and fall back to the local database.
    if (mongoose.connection.db) {
      await mongoose.connection.db.command({ ping: 1 });
    }
    
    console.log('✅ MongoDB connected successfully via Mongoose.');
    useLocalJsonDb = false;
  } catch (err) {
    console.warn('⚠️ MongoDB connection failed or rejected (SSL/Network)! Switching to file-backed local JSON database fallback.');
    console.warn(`Files will be persistent in ${JSON_DB_DIR}`);
    useLocalJsonDb = true;
    try {
      await mongoose.disconnect();
    } catch (e) {}
  }
};

// Abstract Database CRUD wrapper
const db = {
  isLocal: () => useLocalJsonDb,

  find: async (modelName, query = {}) => {
    if (!useLocalJsonDb) {
      return await models[modelName].find(query).lean();
    }
    const data = loadJsonData(modelName);
    return data.filter(item => {
      for (let key in query) {
        if (query[key] !== undefined && item[key] !== query[key]) {
          // Quick nested check for references
          if (typeof query[key] === 'object' && query[key] !== null) {
            // Replicate regex or array contains
            if (query[key].$regex) {
              const regex = new RegExp(query[key].$regex, 'i');
              if (!regex.test(item[key])) return false;
            }
          } else {
            return false;
          }
        }
      }
      return true;
    });
  },

  findOne: async (modelName, query = {}) => {
    if (!useLocalJsonDb) {
      return await models[modelName].findOne(query).lean();
    }
    const list = await db.find(modelName, query);
    return list.length > 0 ? list[0] : null;
  },

  findById: async (modelName, id) => {
    if (!useLocalJsonDb) {
      return await models[modelName].findById(id).lean();
    }
    const data = loadJsonData(modelName);
    return data.find(item => item._id === id || item.id === id) || null;
  },

  create: async (modelName, docData) => {
    if (!useLocalJsonDb) {
      const newDoc = new models[modelName](docData);
      return await newDoc.save();
    }
    const data = loadJsonData(modelName);
    const newDoc = {
      _id: generateMockId(),
      ...docData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    data.push(newDoc);
    saveJsonData(modelName, data);
    return newDoc;
  },

  findByIdAndUpdate: async (modelName, id, updateData) => {
    if (!useLocalJsonDb) {
      return await models[modelName].findByIdAndUpdate(id, updateData, { new: true }).lean();
    }
    const data = loadJsonData(modelName);
    const index = data.findIndex(item => item._id === id);
    if (index === -1) return null;
    data[index] = {
      ...data[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    saveJsonData(modelName, data);
    return data[index];
  },

  findByIdAndDelete: async (modelName, id) => {
    if (!useLocalJsonDb) {
      return await models[modelName].findByIdAndDelete(id).lean();
    }
    const data = loadJsonData(modelName);
    const index = data.findIndex(item => item._id === id);
    if (index === -1) return null;
    const removed = data.splice(index, 1);
    saveJsonData(modelName, data);
    return removed[0];
  },

  count: async (modelName, query = {}) => {
    if (!useLocalJsonDb) {
      return await models[modelName].countDocuments(query);
    }
    const list = await db.find(modelName, query);
    return list.length;
  }
};

module.exports = {
  connectDB,
  db,
  models
};
