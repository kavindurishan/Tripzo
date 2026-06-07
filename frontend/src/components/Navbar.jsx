import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import TripzoBrandLogo from './TripzoBrandLogo.jsx';
import { 
  Sun, Moon, Bell, LogOut, User as UserIcon, 
  Menu, X, Calendar, Compass, ShieldAlert, Award
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      const data = await api.notifications.getAll();
      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.warn('Could not load notifications');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.notifications.markAllRead();
      loadNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
    navigate('/login');
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const isAdmin = user && (user.role === 'Admin' || user.role === 'Operator');

  return (
    <nav className="sticky top-0 z-40 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center group max-w-[160px] md:max-w-[200px] h-10 overflow-visible">
              <TripzoBrandLogo className="h-8 md:h-9 w-auto filter drop-shadow-sm group-hover:scale-[1.02] transition-transform duration-200" />
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex ml-10 space-x-1">
              <Link 
                to="/" 
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/' ? 'text-primary-600 dark:text-primary-400 bg-primary-50/50 dark:bg-primary-950/20' : 'text-slate-600 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400'}`}
              >
                Find Buses
              </Link>
              {user && !isAdmin && (
                <Link 
                  to="/bookings" 
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/bookings' ? 'text-primary-600 dark:text-primary-400 bg-primary-50/50 dark:bg-primary-950/20' : 'text-slate-600 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400'}`}
                >
                  My Journeys
                </Link>
              )}
              <Link 
                to="/about" 
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/about' ? 'text-primary-600 dark:text-primary-400 bg-primary-50/50 dark:bg-primary-950/20' : 'text-slate-600 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400'}`}
              >
                About Us
              </Link>
              <Link 
                to="/contact" 
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/contact' ? 'text-primary-600 dark:text-primary-400 bg-primary-50/50 dark:bg-primary-950/20' : 'text-slate-600 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400'}`}
              >
                Contact
              </Link>
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center space-x-2">
            {/* Theme Toggle */}
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-primary-400 dark:hover:bg-slate-800/50 transition-all"
              title="Toggle Theme"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {user && (
              <>
                {/* Admin Quick Entry */}
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-accent-emerald dark:bg-emerald-950/20 dark:text-emerald-400 text-xs font-semibold border border-emerald-200/50 dark:border-emerald-800/30 hover:scale-[1.02] transition-transform"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span className="hidden sm:inline">Admin Panel</span>
                  </Link>
                )}

                {/* Notifications Bell */}
                <div className="relative">
                  <button 
                    onClick={() => {
                      setNotifDropdownOpen(!notifDropdownOpen);
                      setProfileDropdownOpen(false);
                    }}
                    className="p-2 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-primary-400 dark:hover:bg-slate-800/50 transition-all relative"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-accent-rose text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-bounce">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {notifDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200/60 dark:border-slate-800/60 overflow-hidden transform origin-top-right transition-all duration-200 scale-100">
                      <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                        <span className="font-bold text-sm text-slate-800 dark:text-slate-200">Notifications</span>
                        {unreadCount > 0 && (
                          <button 
                            onClick={handleMarkAllRead}
                            className="text-xs font-semibold text-primary-500 hover:text-primary-600"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-slate-400 text-xs">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div 
                              key={notif._id} 
                              className={`p-3 border-b border-slate-100 dark:border-slate-800/50 last:border-0 hover:bg-slate-50/40 dark:hover:bg-slate-800/10 ${!notif.read ? 'bg-primary-50/20 dark:bg-primary-950/5' : ''}`}
                            >
                              <div className="flex justify-between items-start mb-0.5">
                                <span className={`text-xs font-semibold ${!notif.read ? 'text-primary-600 dark:text-primary-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                  {notif.title}
                                </span>
                                <span className="text-[9px] text-slate-400">
                                  {new Date(notif.createdAt || notif.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                                {notif.message}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Trigger */}
                <div className="relative">
                  <button 
                    onClick={() => {
                      setProfileDropdownOpen(!profileDropdownOpen);
                      setNotifDropdownOpen(false);
                    }}
                    className="flex items-center space-x-1.5 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all focus:outline-none"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold text-sm border border-primary-200/20">
                      {user.fullName ? user.fullName[0].toUpperCase() : 'Y'}
                    </div>
                    <span className="hidden sm:inline text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {user.fullName ? user.fullName.split(' ')[0] : 'User'}
                    </span>
                  </button>

                  {/* Profile Dropdown */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200/60 dark:border-slate-800/60 overflow-hidden py-1">
                      <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800/60">
                        <p className="text-xs font-semibold text-slate-400">Signed in as</p>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{user.email}</p>
                        <p className="text-[10px] text-primary-500 font-bold bg-primary-50 dark:bg-primary-950/30 px-1.5 py-0.5 rounded w-max mt-1 uppercase tracking-wider">{user.role}</p>
                      </div>
                      <Link 
                        to={isAdmin ? "/admin/settings" : "/bookings"} 
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/50"
                      >
                        <UserIcon className="w-4 h-4" />
                        <span>My Account</span>
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="flex items-center space-x-2 w-full text-left px-4 py-2 text-sm text-accent-rose hover:bg-rose-50 dark:hover:bg-rose-950/20"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {!user && (
              <div className="hidden sm:flex items-center space-x-1.5">
                <Link 
                  to="/login"
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
                >
                  Log In
                </Link>
                <Link 
                  to="/register"
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 shadow-md shadow-primary-500/10 hover:shadow-primary-500/20 transition-all"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/50 transition-all"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Collapsed Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900 px-4 pt-2 pb-4 space-y-1">
          <Link 
            to="/" 
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
          >
            Find Buses
          </Link>
          {user && !isAdmin && (
            <Link 
              to="/bookings" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              My Journeys
            </Link>
          )}
          <Link 
            to="/about" 
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
          >
            About Us
          </Link>
          <Link 
            to="/contact" 
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
          >
            Contact
          </Link>
          {!user && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col space-y-2">
              <Link 
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2 rounded-lg text-base font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50"
              >
                Log In
              </Link>
              <Link 
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2 rounded-lg text-base font-semibold text-white bg-primary-600 hover:bg-primary-700"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
