import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Compass, Mail, Lock, Phone, User, Eye, EyeOff } from 'lucide-react';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        // Redirect based on role check
        const cachedUser = JSON.parse(localStorage.getItem('tripzo_user'));
        if (cachedUser && (cachedUser.role === 'Admin' || cachedUser.role === 'Operator')) {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        setError(res.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Could not connect to authentication server. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-xl">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-accent-cyan flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
            <Compass className="w-7 h-7" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 dark:text-white">
            Welcome back
          </h2>
          <p className="mt-1.5 text-center text-sm text-slate-500 dark:text-slate-400">
            Log in to manage your Tripzo journeys
          </p>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/20 text-accent-rose text-xs font-semibold rounded-xl border border-rose-200/50 dark:border-rose-900/30">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              Username or Email
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="John Doe or you@example.com"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-650"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-350 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="remember" className="ml-2 font-semibold text-slate-500 dark:text-slate-400">
                Remember me
              </label>
            </div>
            <Link to="/forgot-password" className="font-semibold text-primary-500 hover:text-primary-600">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-semibold text-white bg-primary-600 hover:bg-primary-700 shadow-md shadow-primary-500/10 hover:shadow-primary-500/25 transition-all text-sm flex items-center justify-center"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs font-semibold text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-500 hover:text-primary-600 font-bold">
            Create an account
          </Link>
        </p>

        {/* Demo Credentials Alert Box */}
        <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 rounded-xl text-[10px] text-slate-400 space-y-1">
          <p className="font-bold text-slate-500 dark:text-slate-300">💡 Demo Credentials:</p>
          <div className="flex justify-between">
            <span>Admin: <strong className="text-slate-500 dark:text-slate-300">admin@tripzo.com</strong> / admin123</span>
            <span>Customer: <strong className="text-slate-500 dark:text-slate-300">customer@tripzo.com</strong> / customer123</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await register(username, fullName, email, phone, password);
      if (res.success) {
        navigate('/');
      } else {
        setError(res.message || 'Registration failed');
      }
    } catch (err) {
      setError('Could not connect to authentication server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-xl">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-accent-cyan flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
            <Compass className="w-7 h-7" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 dark:text-white">
            Create an account
          </h2>
          <p className="mt-1.5 text-center text-sm text-slate-500 dark:text-slate-400">
            Join Tripzo for premium road transit booking
          </p>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/20 text-accent-rose text-xs font-semibold rounded-xl border border-rose-200/50 dark:border-rose-900/30">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="johndoe123"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+94 77 123 4567"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-semibold text-white bg-primary-600 hover:bg-primary-700 shadow-md shadow-primary-500/10 hover:shadow-primary-500/25 transition-all text-sm flex items-center justify-center"
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs font-semibold text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-500 hover:text-primary-600 font-bold">
            Log in instead
          </Link>
        </p>
      </div>
    </div>
  );
}
