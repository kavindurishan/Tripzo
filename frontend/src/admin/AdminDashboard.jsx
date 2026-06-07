import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Users, Bus, Calendar, Landmark, BookOpen, AlertOctagon, 
  TrendingUp, CircleDollarSign, Clock, ShieldAlert, ArrowRight
} from 'lucide-react';
// Recharts charts
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  Tooltip, CartesianGrid, BarChart, Bar, Legend
} from 'recharts';

export default function AdminDashboard() {
  const [kpis, setKpis] = useState(null);
  const [recentPayments, setRecentPayments] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async (retryCount = 0) => {
    try {
      if (retryCount === 0) setLoading(true);
      setError('');
      
      const data = await api.reports.getDashboard();
      if (data.success) {
        setKpis(data.kpis);
        setRecentPayments(data.recentPayments);
        setChartData(data.charts.revenueChart);
        setLoading(false);
      } else {
        throw new Error(data.message || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      if (retryCount < 3) {
        console.warn(`Dashboard fetch failed (attempt ${retryCount + 1}), retrying...`, err);
        setTimeout(() => loadDashboardStats(retryCount + 1), 800);
      } else {
        console.error('Dashboard fetch error:', err);
        setError('Could not connect to the reporting service. Please ensure the backend server is running.');
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)] space-y-4">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-slate-500">Compiling fleet analytics and KPI counters...</p>
      </div>
    );
  }

  if (error || !kpis) {
    return (
      <div className="p-8 text-center bg-rose-50 dark:bg-rose-950/20 text-accent-rose text-sm font-semibold rounded-2xl border border-rose-200/50">
        {error}
      </div>
    );
  }

  const kpiList = [
    { name: 'Total Revenue', value: `$${kpis.totalRevenue.toLocaleString()}`, change: '+14% this month', icon: CircleDollarSign, color: 'text-accent-emerald bg-emerald-50 dark:bg-emerald-950/20' },
    { name: 'Total Users', value: kpis.totalUsers, change: 'Active accounts', icon: Users, color: 'text-primary-500 bg-primary-50 dark:bg-primary-950/20' },
    { name: 'Total Bookings', value: kpis.totalBookings, change: `${kpis.todayBookings} bookings today`, icon: BookOpen, color: 'text-accent-cyan bg-cyan-50 dark:bg-cyan-950/20' },
    { name: 'Available Buses', value: `${kpis.availableBuses} / ${kpis.totalBuses}`, change: 'Fleet ready', icon: Bus, color: 'text-accent-amber bg-amber-50 dark:bg-amber-950/20' },
    { name: 'Cancelled Bookings', value: kpis.cancelledBookings, change: 'Refund processing active', icon: AlertOctagon, color: 'text-accent-rose bg-rose-50 dark:bg-rose-950/20' },
    { name: 'Trip Schedules', value: kpis.totalSchedules, change: 'Active routes', icon: Calendar, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20' },
  ];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">Dashboard Overview</h2>
        <p className="text-xs text-slate-400 font-semibold mt-0.5">Real-time fleet operation cockpit metrics</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-fade-in">
        {kpiList.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center justify-between">
              <div className="space-y-1.5">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">{kpi.name}</span>
                <span className="block text-2xl font-extrabold text-slate-900 dark:text-white leading-none">{kpi.value}</span>
                <span className="block text-[10px] text-slate-500 font-semibold">{kpi.change}</span>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${kpi.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts & Graphs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Area Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center space-x-1.5">
              <TrendingUp className="w-4 h-4 text-primary-500" />
              <span>Revenue vs Booking Analytics</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-semibold">Monthly aggregation data metrics</span>
          </div>

          <div className="h-64 text-xs font-medium">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f66ff" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4f66ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#A0AEC0" />
                <YAxis stroke="#A0AEC0" />
                <Tooltip />
                <Legend verticalAlign="top" height={36}/>
                <Area type="monotone" name="Revenue ($)" dataKey="revenue" stroke="#4f66ff" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" name="Bookings Count" dataKey="bookings" stroke="#06b6d4" strokeWidth={2} fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-4">
          <h3 className="font-bold text-slate-850 dark:text-white flex items-center space-x-1.5">
            <Clock className="w-4 h-4 text-accent-cyan" />
            <span>Recent Payments</span>
          </h3>

          <div className="space-y-3.5 max-h-64 overflow-y-auto">
            {recentPayments.length === 0 ? (
              <div className="text-center p-8 text-xs text-slate-400">No payment events logged yet</div>
            ) : (
              recentPayments.map(p => (
                <div key={p._id} className="flex justify-between items-center text-xs font-semibold pb-3 border-b border-slate-105 dark:border-slate-850 last:border-0 last:pb-0">
                  <div className="space-y-0.5">
                    <p className="text-slate-800 dark:text-slate-200 truncate max-w-[120px]">{p.customerName}</p>
                    <p className="text-[10px] text-slate-400 font-semibold">{new Date(p.date).toLocaleDateString()} via {p.paymentMethod}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${p.status === 'Refunded' ? 'text-accent-rose' : 'text-accent-emerald'}`}>
                      {p.status === 'Refunded' ? `-$${Math.abs(p.amount)}` : `+$${p.amount}`}
                    </p>
                    <span className="text-[9px] uppercase font-bold text-slate-400">{p.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
