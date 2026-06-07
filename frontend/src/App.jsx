import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import Home from './pages/Home';
import BusList from './pages/BusList';
import Details from './pages/Details';
import Payment from './pages/Payment';
import Ticket from './pages/Ticket';
import Bookings from './pages/Bookings';
import { Login, Register } from './pages/Auth';
import { AboutUs, ContactUs } from './pages/AboutContact';

// Admin Pages
import AdminDashboard from './admin/AdminDashboard';
import { 
  ManageUsers, ManageBuses, ManageRoutes, ManageSchedules, 
  ManageBookings, ManagePayments, ManageOffers, ManageReviews 
} from './admin/AdminCrud';

// Auth Route Guards
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  const isAdminOrOperator = user && (user.role === 'Admin' || user.role === 'Operator');
  return isAdminOrOperator ? children : <Navigate to="/" />;
}

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors flex flex-col font-sans">
      {/* Global Navigation header */}
      <Navbar className="no-print" />

      {/* Main Page Content Body */}
      <main className="flex-grow">
        <Routes>
          {/* Public customer routes */}
          <Route path="/" element={<Home />} />
          <Route path="/schedules" element={<BusList />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Auth-protected customer routes */}
          <Route path="/schedules/:id" element={
            <PrivateRoute>
              <Details />
            </PrivateRoute>
          } />
          <Route path="/payment/:bookingId" element={
            <PrivateRoute>
              <Payment />
            </PrivateRoute>
          } />
          <Route path="/ticket/:bookingId" element={
            <PrivateRoute>
              <Ticket />
            </PrivateRoute>
          } />
          <Route path="/bookings" element={
            <PrivateRoute>
              <Bookings />
            </PrivateRoute>
          } />

          {/* Admin console portal (Dashboard, CRM and Reporting) */}
          <Route path="/admin/*" element={
            <AdminRoute>
              <div className="flex min-h-[calc(100vh-4rem)]">
                {/* Admin Sidebar */}
                <Sidebar className="no-print shrink-0" />
                
                {/* Nested Admin views wrapper */}
                <div className="flex-1 p-6 sm:p-8 bg-slate-50 dark:bg-slate-950/40">
                  <Routes>
                    <Route index element={<AdminDashboard />} />
                    <Route path="users" element={<ManageUsers />} />
                    <Route path="buses" element={<ManageBuses />} />
                    <Route path="routes" element={<ManageRoutes />} />
                    <Route path="schedules" element={<ManageSchedules />} />
                    <Route path="bookings" element={<ManageBookings />} />
                    <Route path="payments" element={<ManagePayments />} />
                    <Route path="offers" element={<ManageOffers />} />
                    <Route path="reviews" element={<ManageReviews />} />
                  </Routes>
                </div>
              </div>
            </AdminRoute>
          } />

          {/* Fallback wildcard */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      {/* Footer banner */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200/50 dark:border-slate-800/80 py-6 text-center text-xs font-semibold text-slate-400 no-print">
        &copy; {new Date().getFullYear()} Tripzo Mobility. Made in Sri Lanka. All Rights Reserved.
      </footer>
    </div>
  );
}
