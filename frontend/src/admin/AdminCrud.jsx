import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Plus, Trash2, Edit3, ShieldAlert, Sparkles, 
  User, Check, X, ShieldCheck, MapPin, Bus, Tag, Clock, Calendar, Star, Info, ArrowRight
} from 'lucide-react';

// ==========================================
// 1. MANAGE USERS CRUD
// ==========================================
export function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  // Form inputs
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('Customer');
  const [status, setStatus] = useState('Active');
  const [password, setPassword] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await api.users.getAll();
      if (data.success) setUsers(data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingUser(null);
    setUsername('');
    setFullName('');
    setEmail('');
    setPhone('');
    setRole('Customer');
    setStatus('Active');
    setPassword('tripzo123');
    setModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setUsername(user.username || '');
    setFullName(user.fullName);
    setEmail(user.email);
    setPhone(user.phone);
    setRole(user.role);
    setStatus(user.status);
    setPassword(''); // leave blank if no change
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const body = { username, fullName, email, phone, role, status };
      if (password) body.password = password;

      if (editingUser) {
        await api.users.update(editingUser._id, body);
      } else {
        await api.users.create(body);
      }
      setModalOpen(false);
      loadUsers();
    } catch (err) {
      alert(err.message || 'Error saving user.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.users.delete(id);
      loadUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">User Accounts Manager</h2>
          <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Control client profiles and role assignments</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center space-x-1.5 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Account</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center p-12 text-xs font-bold text-slate-400">Loading users...</div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800 text-left text-xs font-semibold">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Contact Info</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-350">
              {users.map(u => (
                <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900 dark:text-white">{u.fullName}</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">@{u.username || 'user'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold">{u.email}</p>
                    <p className="text-slate-400 text-[10px]">{u.phone}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded font-bold uppercase text-[9px] ${u.role === 'Admin' ? 'bg-rose-50 text-accent-rose' : u.role === 'Operator' ? 'bg-cyan-50 text-accent-cyan' : 'bg-slate-100 text-slate-500'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${u.status === 'Active' ? 'bg-emerald-50 text-accent-emerald' : 'bg-rose-50 text-accent-rose'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 no-print">
                    <div className="flex justify-end space-x-1.5">
                      <button onClick={() => handleOpenEdit(u)} className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(u._id)} className="p-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 rounded-lg text-accent-rose">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Users Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <form onSubmit={handleFormSubmit} className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
              {editingUser ? 'Update Account details' : 'Register New Account'}
            </h3>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Username</label>
                  <input type="text" required value={username} onChange={e => setUsername(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl font-semibold dark:text-white" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Full Name</label>
                  <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl font-semibold dark:text-white" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Email</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl font-semibold dark:text-white" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Phone</label>
                <input type="text" required value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl font-semibold dark:text-white" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Password</label>
                <input type="password" placeholder={editingUser ? "Leave blank to keep same" : "tripzo123"} value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-855 rounded-xl font-semibold dark:text-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Role</label>
                  <select value={role} onChange={e => setRole(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl font-semibold dark:text-white">
                    <option value="Customer">Customer</option>
                    <option value="Operator">Operator</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Status</label>
                  <select value={status} onChange={e => setStatus(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl font-semibold dark:text-white">
                    <option value="Active">Active</option>
                    <option value="Blocked">Blocked</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3">
              <button type="button" onClick={() => setModalOpen(false)} className="py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-350 font-bold rounded-xl text-xs">Cancel</button>
              <button type="submit" className="py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-xs">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 2. MANAGE BUSES CRUD
// ==========================================
export function ManageBuses() {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBus, setEditingBus] = useState(null);

  // Form states
  const [busNumber, setBusNumber] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState('Normal');
  const [seatCapacity, setSeatCapacity] = useState(40);
  const [facilities, setFacilities] = useState([]); // Wi-Fi, Charging, AC, TV
  const [status, setStatus] = useState('Available');

  useEffect(() => {
    loadBuses();
  }, []);

  const loadBuses = async () => {
    setLoading(true);
    try {
      const data = await api.buses.getAll();
      if (data.success) setBuses(data.buses);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFacilityToggle = (fac) => {
    if (facilities.includes(fac)) {
      setFacilities(facilities.filter(f => f !== fac));
    } else {
      setFacilities([...facilities, fac]);
    }
  };

  const handleOpenAdd = () => {
    setEditingBus(null);
    setBusNumber('');
    setName('');
    setType('Normal');
    setSeatCapacity(40);
    setFacilities([]);
    setStatus('Available');
    setModalOpen(true);
  };

  const handleOpenEdit = (bus) => {
    setEditingBus(bus);
    setBusNumber(bus.busNumber);
    setName(bus.name);
    setType(bus.type);
    setSeatCapacity(bus.seatCapacity);
    setFacilities(bus.facilities || []);
    setStatus(bus.status);
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const body = { busNumber, name, type, seatCapacity, facilities, status };
      if (editingBus) {
        await api.buses.update(editingBus._id, body);
      } else {
        await api.buses.create(body);
      }
      setModalOpen(false);
      loadBuses();
    } catch (err) {
      alert(err.message || 'Error processing bus details.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this bus fleet entry?')) return;
    try {
      await api.buses.delete(id);
      loadBuses();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Bus Fleet Manager</h2>
          <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Edit capacity limits and facilities attributes</p>
        </div>
        <button onClick={handleOpenAdd} className="flex items-center space-x-1.5 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-xs">
          <Plus className="w-4 h-4" />
          <span>Add Bus</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center p-12 text-xs font-bold text-slate-400">Loading fleet list...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {buses.map(bus => (
            <div key={bus._id} className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-4 relative flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">{bus.busNumber}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${bus.status === 'Available' ? 'bg-emerald-50 text-accent-emerald' : bus.status === 'Maintenance' ? 'bg-amber-50 text-accent-amber' : 'bg-rose-50 text-accent-rose'}`}>
                    {bus.status}
                  </span>
                </div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">{bus.name}</h4>
                <p className="text-xs text-slate-500 font-semibold">Capacity: {bus.seatCapacity} seats &bull; Type: <strong className="text-slate-700 dark:text-slate-300 font-bold">{bus.type}</strong></p>
                <div className="flex flex-wrap gap-1 mt-1 text-[9px] font-bold text-slate-400">
                  {bus.facilities?.map(f => (
                    <span key={f} className="bg-slate-100 dark:bg-slate-950 px-1.5 py-0.5 rounded border border-slate-200/30">{f}</span>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-1.5 pt-3 border-t border-slate-105 dark:border-slate-850">
                <button onClick={() => handleOpenEdit(bus)} className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-slate-650 dark:text-slate-350 flex items-center justify-center">
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(bus._id)} className="p-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 rounded-lg text-accent-rose flex items-center justify-center">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <form onSubmit={handleFormSubmit} className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
              {editingBus ? 'Update Fleet Specifications' : 'Add Fleet Bus'}
            </h3>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Bus Number</label>
                  <input type="text" required placeholder="NP-4521" value={busNumber} onChange={e => setBusNumber(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded-xl font-semibold dark:text-white" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Bus Name</label>
                  <input type="text" required placeholder="Highway Liner" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded-xl font-semibold dark:text-white" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Type</label>
                  <select value={type} onChange={e => setType(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-855 rounded-xl font-semibold dark:text-white">
                    <option value="Normal">Normal</option>
                    <option value="Semi Luxury">Semi Luxury</option>
                    <option value="Luxury">Luxury</option>
                    <option value="AC">AC</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Seat Capacity</label>
                  <input type="number" required min="10" max="60" value={seatCapacity} onChange={e => setSeatCapacity(parseInt(e.target.value))} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-855 rounded-xl font-semibold dark:text-white" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Facilities</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {['Wi-Fi', 'Charging', 'AC', 'TV'].map(fac => (
                    <label key={fac} className="flex items-center space-x-2 text-xs font-semibold cursor-pointer">
                      <input type="checkbox" checked={facilities.includes(fac)} onChange={() => handleFacilityToggle(fac)} className="w-4 h-4 rounded text-primary-500" />
                      <span>{fac}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Fleet Status</label>
                <select value={status} onChange={e => setStatus(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-855 rounded-xl font-semibold dark:text-white">
                  <option value="Available">Available</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3">
              <button type="button" onClick={() => setModalOpen(false)} className="py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-350 font-bold rounded-xl text-xs">Cancel</button>
              <button type="submit" className="py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-xs">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 3. MANAGE ROUTES CRUD
// ==========================================
export function ManageRoutes() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);

  // Form states
  const [startingLocation, setStartingLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [distance, setDistance] = useState(100);
  const [duration, setDuration] = useState('2h 30m');
  const [stops, setStops] = useState([]); // Array of { name, distanceOffset }

  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    setLoading(true);
    try {
      const data = await api.routes.getAll();
      if (data.success) setRoutes(data.routes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStop = () => {
    setStops([...stops, { name: '', distanceOffset: 0, timeOffset: '30m' }]);
  };

  const handleStopChange = (index, field, value) => {
    const copy = [...stops];
    copy[index][field] = value;
    setStops(copy);
  };

  const handleRemoveStop = (index) => {
    setStops(stops.filter((_, i) => i !== index));
  };

  const handleOpenAdd = () => {
    setEditingRoute(null);
    setStartingLocation('');
    setDestination('');
    setDistance(100);
    setDuration('2h 30m');
    setStops([]);
    setModalOpen(true);
  };

  const handleOpenEdit = (route) => {
    setEditingRoute(route);
    setStartingLocation(route.startingLocation);
    setDestination(route.destination);
    setDistance(route.distance);
    setDuration(route.duration);
    setStops(route.stops || []);
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const body = { startingLocation, destination, distance, duration, stops };
      if (editingRoute) {
        await api.routes.update(editingRoute._id, body);
      } else {
        await api.routes.create(body);
      }
      setModalOpen(false);
      loadRoutes();
    } catch (err) {
      alert(err.message || 'Error processing route.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this route config?')) return;
    try {
      await api.routes.delete(id);
      loadRoutes();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Routes Manager</h2>
          <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Control distance offsets and route transit stops</p>
        </div>
        <button onClick={handleOpenAdd} className="flex items-center space-x-1.5 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-xs">
          <Plus className="w-4 h-4" />
          <span>Add Route</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center p-12 text-xs font-bold text-slate-400">Loading routes...</div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800 text-left text-xs font-semibold">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-6 py-4">Terminal Route</th>
                <th className="px-6 py-4">Distance / Travel Time</th>
                <th className="px-6 py-4">Stops count</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-350">
              {routes.map(r => (
                <tr key={r._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                    <span>{r.startingLocation}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-primary-500" />
                    <span>{r.destination}</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold">{r.distance} km</p>
                    <p className="text-slate-400 text-[10px]">{r.duration}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 px-2 py-0.5 rounded font-bold uppercase text-[9px]">
                      {r.stops?.length || 0} stops
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end space-x-1.5">
                      <button onClick={() => handleOpenEdit(r)} className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-slate-650 dark:text-slate-350 flex items-center justify-center">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(r._id)} className="p-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 rounded-lg text-accent-rose flex items-center justify-center">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <form onSubmit={handleFormSubmit} className="max-w-lg w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
              {editingRoute ? 'Update Route' : 'Configure Route'}
            </h3>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Starting Point</label>
                  <input type="text" required placeholder="Colombo" value={startingLocation} onChange={e => setStartingLocation(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-855 rounded-xl font-semibold dark:text-white" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Destination</label>
                  <input type="text" required placeholder="Kandy" value={destination} onChange={e => setDestination(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-855 rounded-xl font-semibold dark:text-white" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Distance (km)</label>
                  <input type="number" required value={distance} onChange={e => setDistance(parseInt(e.target.value))} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-855 rounded-xl font-semibold dark:text-white" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Est. Duration</label>
                  <input type="text" required placeholder="3h 15m" value={duration} onChange={e => setDuration(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-855 rounded-xl font-semibold dark:text-white" />
                </div>
              </div>

              {/* Dynamic Stops Input */}
              <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                <div className="flex justify-between items-center">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Route Stops</span>
                  <button type="button" onClick={handleAddStop} className="text-[10px] font-extrabold text-primary-500 hover:underline">+ Add Stop</button>
                </div>

                <div className="space-y-2 max-h-36 overflow-y-auto">
                  {stops.map((stop, idx) => (
                    <div key={idx} className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-200/40">
                      <input type="text" placeholder="Stop Name" value={stop.name} onChange={e => handleStopChange(idx, 'name', e.target.value)} className="flex-1 px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs" />
                      <input type="number" placeholder="km" value={stop.distanceOffset} onChange={e => handleStopChange(idx, 'distanceOffset', parseInt(e.target.value))} className="w-16 px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs" />
                      <button type="button" onClick={() => handleRemoveStop(idx)} className="p-1 text-accent-rose hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3">
              <button type="button" onClick={() => setModalOpen(false)} className="py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-350 font-bold rounded-xl text-xs">Cancel</button>
              <button type="submit" className="py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-xs">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 4. MANAGE SCHEDULES CRUD
// ==========================================
export function ManageSchedules() {
  const [schedules, setSchedules] = useState([]);
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);

  // Form states
  const [bus, setBus] = useState('');
  const [route, setRoute] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [departureTime, setDepartureTime] = useState('08:00');
  const [arrivalTime, setArrivalTime] = useState('11:00');
  const [ticketPrice, setTicketPrice] = useState(15);
  const [status, setStatus] = useState('Active');
  const [frequency, setFrequency] = useState('Everyday');
  const [selectedDays, setSelectedDays] = useState([]);

  useEffect(() => {
    loadSchedulesAndOptions();
  }, []);

  const loadSchedulesAndOptions = async () => {
    setLoading(true);
    try {
      const sData = await api.schedules.getAll();
      const bData = await api.buses.getAll();
      const rData = await api.routes.getAll();
      
      if (sData.success) setSchedules(sData.schedules);
      if (bData.success) {
        setBuses(bData.buses);
        if (bData.buses.length > 0) setBus(bData.buses[0]._id);
      }
      if (rData.success) {
        setRoutes(rData.routes);
        if (rData.routes.length > 0) setRoute(rData.routes[0]._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingSchedule(null);
    setDepartureDate('');
    setDepartureTime('08:00');
    setArrivalTime('11:00');
    setTicketPrice(15);
    setStatus('Active');
    setFrequency('Everyday');
    setSelectedDays([]);
    setModalOpen(true);
  };

  const handleOpenEdit = (sched) => {
    setEditingSchedule(sched);
    setBus(sched.bus._id);
    setRoute(sched.route._id);
    setDepartureDate(sched.departureDate);
    setDepartureTime(sched.departureTime);
    setArrivalTime(sched.arrivalTime);
    setTicketPrice(sched.ticketPrice);
    setStatus(sched.status);
    setFrequency(sched.frequency || 'Everyday');
    setSelectedDays(sched.selectedDays || []);
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const body = { bus, route, departureDate, departureTime, arrivalTime, ticketPrice, status, frequency, selectedDays };
      if (editingSchedule) {
        await api.schedules.update(editingSchedule._id, body);
      } else {
        await api.schedules.create(body);
      }
      setModalOpen(false);
      loadSchedulesAndOptions();
    } catch (err) {
      alert(err.message || 'Error processing schedule details.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Cancel/Delete this schedule event?')) return;
    try {
      await api.schedules.delete(id);
      loadSchedulesAndOptions();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Trip Schedules</h2>
          <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Control live bus assignments and departures timings</p>
        </div>
        <button onClick={handleOpenAdd} className="flex items-center space-x-1.5 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-xs">
          <Plus className="w-4 h-4" />
          <span>Add Schedule</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center p-12 text-xs font-bold text-slate-400">Loading active schedules...</div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800 text-left text-xs font-semibold">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-6 py-4">Itinerary</th>
                <th className="px-6 py-4">Bus / Type</th>
                <th className="px-6 py-4">Departure / Price</th>
                <th className="px-6 py-4">Seats Left</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-350">
              {schedules.map(s => (
                <tr key={s._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                    <span>{s.route.startingLocation}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                    <span>{s.route.destination}</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold">{s.bus.name}</p>
                    <p className="text-slate-400 text-[10px] font-mono">{s.bus.busNumber} &bull; {s.bus.type}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold">{s.departureDate} ({s.departureTime})</p>
                    <p className="text-primary-500 text-[10px] font-extrabold">${s.ticketPrice}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-bold">{s.availableSeats} seats left</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${s.status === 'Active' ? 'bg-emerald-50 text-accent-emerald' : s.status === 'Completed' ? 'bg-slate-100 text-slate-500' : 'bg-rose-50 text-accent-rose'}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end space-x-1.5">
                      <button onClick={() => handleOpenEdit(s)} className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-slate-650 dark:text-slate-350 flex items-center justify-center">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(s._id)} className="p-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 rounded-lg text-accent-rose flex items-center justify-center">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <form onSubmit={handleFormSubmit} className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
              {editingSchedule ? 'Update Schedule details' : 'Configure Schedule'}
            </h3>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Select Bus Fleet</label>
                  <select value={bus} onChange={e => setBus(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-855 rounded-xl font-semibold dark:text-white">
                    {buses.map(b => (
                      <option key={b._id} value={b._id}>{b.name} ({b.busNumber})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Select Route</label>
                  <select value={route} onChange={e => setRoute(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-855 rounded-xl font-semibold dark:text-white">
                    {routes.map(r => (
                      <option key={r._id} value={r._id}>{r.startingLocation} &rarr; {r.destination}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Departure Date</label>
                  <input type="date" required value={departureDate} onChange={e => setDepartureDate(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-855 rounded-xl font-semibold dark:text-white" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Dept. Time</label>
                  <input type="text" required placeholder="08:00" value={departureTime} onChange={e => setDepartureTime(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-855 rounded-xl font-semibold dark:text-white" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Arrival Time</label>
                  <input type="text" required placeholder="11:00" value={arrivalTime} onChange={e => setArrivalTime(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-855 rounded-xl font-semibold dark:text-white" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Ticket Price ($)</label>
                  <input type="number" required value={ticketPrice} onChange={e => setTicketPrice(parseInt(e.target.value))} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-855 rounded-xl font-semibold dark:text-white" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Trip Status</label>
                  <select value={status} onChange={e => setStatus(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-855 rounded-xl font-semibold dark:text-white">
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Running Days</label>
                  <select value={frequency} onChange={e => setFrequency(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-855 rounded-xl font-semibold dark:text-white">
                    <option value="Everyday">Everyday</option>
                    <option value="Weekdays">Weekdays</option>
                    <option value="Weekends">Weekends</option>
                    <option value="Specific Days">Specific Days</option>
                  </select>
                </div>
                
                {frequency === 'Specific Days' && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Select Days</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                        <label key={day} className="flex items-center space-x-2 text-xs font-semibold cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={selectedDays.includes(day)} 
                            onChange={(e) => {
                              if (e.target.checked) setSelectedDays([...selectedDays, day]);
                              else setSelectedDays(selectedDays.filter(d => d !== day));
                            }} 
                            className="w-4 h-4 rounded text-primary-500 bg-slate-50 dark:bg-slate-955 border-slate-350 dark:border-slate-800" 
                          />
                          <span>{day.substring(0,3)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3">
              <button type="button" onClick={() => setModalOpen(false)} className="py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-350 font-bold rounded-xl text-xs">Cancel</button>
              <button type="submit" className="py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-xs">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 5. MANAGE BOOKINGS CRUD
// ==========================================
export function ManageBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await api.bookings.getAll();
      if (data.success) setBookings(data.bookings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Force cancel this passenger booking reservation?')) return;
    try {
      await api.bookings.cancel(id, 'Cancelled by administrator');
      loadBookings();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Passenger Bookings Ledger</h2>
        <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Track reserved boarding seats and handle administrative refunds</p>
      </div>

      {loading ? (
        <div className="text-center p-12 text-xs font-bold text-slate-400">Loading booking ledgers...</div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800 text-left text-xs font-semibold">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-6 py-4">Reference</th>
                <th className="px-6 py-4">Passenger Name</th>
                <th className="px-6 py-4">Itinerary</th>
                <th className="px-6 py-4">Seats</th>
                <th className="px-6 py-4">Total Price</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-350">
              {bookings.map(b => (
                <tr key={b._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                  <td className="px-6 py-4 font-mono font-bold text-[10px] uppercase">{b._id.slice(0, 8)}</td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900 dark:text-white">{b.customer?.fullName || 'Guest'}</p>
                    <p className="text-[9px] text-slate-400">{b.customer?.phone}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold flex items-center space-x-1">
                      <span>{b.schedule?.route.startingLocation}</span>
                      <span>&rarr;</span>
                      <span>{b.schedule?.route.destination}</span>
                    </p>
                    <p className="text-slate-400 text-[10px]">{b.schedule?.departureDate}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-extrabold text-slate-650 dark:text-slate-300">{b.seatsBooked.join(', ')}</span>
                  </td>
                  <td className="px-6 py-4 font-extrabold text-primary-500">${b.totalAmount}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${b.bookingStatus === 'Confirmed' ? 'bg-emerald-50 text-accent-emerald' : b.bookingStatus === 'Cancelled' ? 'bg-rose-50 text-accent-rose' : 'bg-amber-50 text-accent-amber'}`}>
                      {b.bookingStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {b.bookingStatus === 'Confirmed' && (
                      <button onClick={() => handleCancelBooking(b._id)} className="px-3 py-1.5 rounded-lg bg-rose-50 text-accent-rose font-bold hover:bg-rose-100 text-[10px]">
                        Force Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 6. MANAGE PAYMENTS
// ==========================================
export function ManagePayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const data = await api.payments.getAll();
      if (data.success) setPayments(data.payments);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Transaction Logs Registry</h2>
        <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Audit customer payments and refunded transaction records</p>
      </div>

      {loading ? (
        <div className="text-center p-12 text-xs font-bold text-slate-400">Loading payment registries...</div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800 text-left text-xs font-semibold">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4">Customer Name</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Method</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Payment Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-350">
              {payments.map(p => (
                <tr key={p._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                  <td className="px-6 py-4 font-mono font-bold text-[10px] uppercase text-slate-900 dark:text-white">{p.transactionId || 'MOCK_TXN'}</td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900 dark:text-white">{p.customer?.fullName || 'Guest'}</p>
                    <p className="text-[9px] text-slate-400">{p.customer?.email}</p>
                  </td>
                  <td className="px-6 py-4 font-extrabold text-slate-800 dark:text-white">
                    <span className={p.amount < 0 ? 'text-accent-rose' : 'text-accent-emerald'}>
                      {p.amount < 0 ? `-$${Math.abs(p.amount)}` : `$${p.amount}`}
                    </span>
                  </td>
                  <td className="px-6 py-4">{p.paymentMethod}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${p.status === 'Paid' ? 'bg-emerald-50 text-accent-emerald' : p.status === 'Refunded' ? 'bg-rose-50 text-accent-rose' : 'bg-amber-50 text-accent-amber'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400 font-semibold">{new Date(p.paymentDate || p.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 7. MANAGE OFFERS CRUD
// ==========================================
export function ManageOffers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);

  // Form states
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('Percentage');
  const [value, setValue] = useState(10);
  const [minBookingValue, setMinBookingValue] = useState(0);
  const [expiryDate, setExpiryDate] = useState('');
  const [status, setStatus] = useState('Active');

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    setLoading(true);
    try {
      const data = await api.offers.getAll();
      if (data.success) setOffers(data.offers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingOffer(null);
    setCode('');
    setDiscountType('Percentage');
    setValue(10);
    setMinBookingValue(0);
    setExpiryDate('');
    setStatus('Active');
    setModalOpen(true);
  };

  const handleOpenEdit = (off) => {
    setEditingOffer(off);
    setCode(off.code);
    setDiscountType(off.discountType);
    setValue(off.value);
    setMinBookingValue(off.minBookingValue);
    setExpiryDate(off.expiryDate);
    setStatus(off.status);
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const body = { code, discountType, value, minBookingValue, expiryDate, status };
      if (editingOffer) {
        await api.offers.update(editingOffer._id, body);
      } else {
        await api.offers.create(body);
      }
      setModalOpen(false);
      loadOffers();
    } catch (err) {
      alert(err.message || 'Error processing offer.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this promo code?')) return;
    try {
      await api.offers.delete(id);
      loadOffers();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Discount Vouchers Manager</h2>
          <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Create promo codes and expiry constraints</p>
        </div>
        <button onClick={handleOpenAdd} className="flex items-center space-x-1.5 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-xs">
          <Plus className="w-4 h-4" />
          <span>Add Promo</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center p-12 text-xs font-bold text-slate-400">Loading coupons...</div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800 text-left text-xs font-semibold">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-6 py-4">Voucher Code</th>
                <th className="px-6 py-4">Discount Value</th>
                <th className="px-6 py-4">Min Spend</th>
                <th className="px-6 py-4">Expiry Limit</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-350">
              {offers.map(off => (
                <tr key={off._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                  <td className="px-6 py-4 font-extrabold text-primary-500 uppercase tracking-wider">{off.code}</td>
                  <td className="px-6 py-4">
                    <p className="font-bold">{off.discountType === 'Percentage' ? `${off.value}%` : `$${off.value}`}</p>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-500">${off.minBookingValue} min</td>
                  <td className="px-6 py-4 text-slate-400 font-semibold">{off.expiryDate}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${off.status === 'Active' ? 'bg-emerald-50 text-accent-emerald' : 'bg-rose-50 text-accent-rose'}`}>
                      {off.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end space-x-1.5">
                      <button onClick={() => handleOpenEdit(off)} className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-slate-650 dark:text-slate-350 flex items-center justify-center">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(off._id)} className="p-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 rounded-lg text-accent-rose flex items-center justify-center">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-955/60 backdrop-blur-sm">
          <form onSubmit={handleFormSubmit} className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
              {editingOffer ? 'Update Promo Voucher' : 'Configure Promo Voucher'}
            </h3>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Voucher Code</label>
                  <input type="text" required placeholder="TRIPZO10" value={code} onChange={e => setCode(e.target.value.toUpperCase())} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-855 rounded-xl font-semibold dark:text-white uppercase" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Discount Type</label>
                  <select value={discountType} onChange={e => setDiscountType(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-855 rounded-xl font-semibold dark:text-white">
                    <option value="Percentage">Percentage (%)</option>
                    <option value="Fixed">Fixed Amount ($)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Value</label>
                  <input type="number" required value={value} onChange={e => setValue(parseInt(e.target.value))} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-855 rounded-xl font-semibold dark:text-white" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Min Spend ($)</label>
                  <input type="number" required value={minBookingValue} onChange={e => setMinBookingValue(parseInt(e.target.value))} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-855 rounded-xl font-semibold dark:text-white" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Expiry Date</label>
                  <input type="date" required value={expiryDate} onChange={e => setExpiryDate(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-855 rounded-xl font-semibold dark:text-white" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Promo Status</label>
                <select value={status} onChange={e => setStatus(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-855 rounded-xl font-semibold dark:text-white">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3">
              <button type="button" onClick={() => setModalOpen(false)} className="py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-350 font-bold rounded-xl text-xs">Cancel</button>
              <button type="submit" className="py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-xs">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 8. MANAGE REVIEWS
// ==========================================
export function ManageReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const data = await api.reviews.getAll();
      if (data.success) setReviews(data.reviews);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user feedback rating?')) return;
    try {
      await api.reviews.delete(id);
      loadReviews();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Reviews &amp; Feedbacks</h2>
        <p className="text-[11px] text-slate-400 font-semibold mt-0.5">View customer travel feedback and manage comments</p>
      </div>

      {loading ? (
        <div className="text-center p-12 text-xs font-bold text-slate-400">Loading reviews...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {reviews.map(r => (
            <div key={r._id} className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-xs">{r.customer?.fullName || 'Guest'}</h4>
                    <p className="text-[9px] text-slate-400 font-semibold">{r.customer?.email}</p>
                  </div>
                  <div className="flex items-center space-x-0.5 text-accent-amber">
                    {[...Array(r.rating)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
                  </div>
                </div>
                <p className="text-xs text-slate-550 leading-relaxed font-semibold italic">"{r.comment}"</p>
                <span className="text-[9px] text-slate-400 block pt-1">On Bus Fleet: <strong>{r.bus?.name || 'Luxury Liner'}</strong> ({r.bus?.busNumber})</span>
              </div>
              <div className="flex justify-end pt-2 border-t border-slate-105 dark:border-slate-850">
                <button onClick={() => handleDelete(r._id)} className="p-1.5 rounded-lg bg-rose-50 text-accent-rose hover:bg-rose-100 flex items-center justify-center">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
