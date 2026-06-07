import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, Users, Bus, Route as RouteIcon, 
  Calendar, ClipboardList, CreditCard, Ticket, 
  Settings, LogOut, ArrowLeft, Star, Tag, X
} from 'lucide-react';

export default function Sidebar({ onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { name: 'Manage Users', icon: Users, path: '/admin/users' },
    { name: 'Manage Buses', icon: Bus, path: '/admin/buses' },
    { name: 'Manage Routes', icon: RouteIcon, path: '/admin/routes' },
    { name: 'Manage Schedules', icon: Calendar, path: '/admin/schedules' },
    { name: 'Manage Bookings', icon: ClipboardList, path: '/admin/bookings' },
    { name: 'Manage Payments', icon: CreditCard, path: '/admin/payments' },
    { name: 'Manage Offers', icon: Tag, path: '/admin/offers' },
    { name: 'Reviews & Feedback', icon: Star, path: '/admin/reviews' },
    { name: 'Reports Engine', icon: Ticket, path: '/admin/reports' },
    { name: 'System Settings', icon: Settings, path: '/admin/settings' },
  ];

  return (
    <div className="h-full flex flex-col bg-slate-900 text-slate-300 border-r border-slate-800">
      {/* Header and Branding */}
      <div className="flex items-center justify-between px-6 h-16 bg-slate-950 border-b border-slate-800">
        <Link to="/" className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-lg text-white tracking-tight">Tripzo Admin</span>
        </Link>
        {onClose && (
          <button 
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Quick Dashboard Exit */}
      <div className="px-4 py-3 bg-slate-950/40 border-b border-slate-800/80">
        <Link 
          to="/" 
          className="flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-primary-400 hover:text-primary-300 bg-primary-950/20 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit to Main Site</span>
        </Link>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${isActive ? 'bg-primary-600 text-white shadow-md shadow-primary-500/10' : 'hover:bg-slate-800/50 hover:text-white'}`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Profile Control */}
      <div className="p-4 bg-slate-950/80 border-t border-slate-850 flex items-center justify-between">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="w-8.5 h-8.5 rounded bg-primary-700 text-white flex items-center justify-center font-bold text-sm shrink-0">
            {user?.fullName ? user.fullName[0].toUpperCase() : 'A'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate">{user?.fullName || 'Admin User'}</p>
            <p className="text-[10px] text-slate-500 capitalize">{user?.role || 'operator'}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="p-1.5 rounded-lg text-slate-400 hover:text-accent-rose hover:bg-slate-800"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
