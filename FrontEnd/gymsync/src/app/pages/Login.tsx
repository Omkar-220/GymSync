import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Dumbbell, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';

export function Login() {
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regWeight, setRegWeight] = useState('');
  const [regHeight, setRegHeight] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(loginEmail, loginPassword);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({
        username: regUsername,
        email: regEmail,
        password: regPassword,
        firstName: regFirstName,
        lastName: regLastName,
        weight: regWeight ? parseFloat(regWeight) : undefined,
        height: regHeight ? parseFloat(regHeight) : undefined,
      });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center p-4">
      <div className="w-full max-w-[390px]">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Dumbbell className="w-8 h-8 text-[#5C5CFF]" />
          <h1 className="text-2xl font-bold text-white tracking-tight">GymSync</h1>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-[#181820] rounded-xl p-1 border border-[#2A2A35] mb-6">
          <button
            onClick={() => { setTab('login'); setError(''); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${tab === 'login' ? 'bg-[#2A2A35] text-white' : 'text-[#8B8CA8]'}`}
          >
            Login
          </button>
          <button
            onClick={() => { setTab('register'); setError(''); }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${tab === 'register' ? 'bg-[#2A2A35] text-white' : 'text-[#8B8CA8]'}`}
          >
            Register
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl text-[#EF4444] text-sm text-center">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {tab === 'login' ? (
            <motion.form
              key="login"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={handleLogin}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-bold text-[#8B8CA8] uppercase tracking-wider mb-2 block">Email</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full bg-[#181820] border border-[#2A2A35] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#5C5CFF] transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#8B8CA8] uppercase tracking-wider mb-2 block">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-[#181820] border border-[#2A2A35] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#5C5CFF] transition-colors pr-12"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8B8CA8]">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#5C5CFF] hover:bg-[#4B4BFF] disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-colors mt-2"
              >
                {loading ? 'Logging in...' : 'LOGIN'}
              </button>
            </motion.form>
          ) : (
            <motion.form
              key="register"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              onSubmit={handleRegister}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#8B8CA8] uppercase tracking-wider mb-2 block">First Name</label>
                  <input type="text" value={regFirstName} onChange={(e) => setRegFirstName(e.target.value)} required placeholder="John"
                    className="w-full bg-[#181820] border border-[#2A2A35] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#5C5CFF] transition-colors" />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#8B8CA8] uppercase tracking-wider mb-2 block">Last Name</label>
                  <input type="text" value={regLastName} onChange={(e) => setRegLastName(e.target.value)} required placeholder="Doe"
                    className="w-full bg-[#181820] border border-[#2A2A35] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#5C5CFF] transition-colors" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-[#8B8CA8] uppercase tracking-wider mb-2 block">Username</label>
                <input type="text" value={regUsername} onChange={(e) => setRegUsername(e.target.value)} required placeholder="johndoe"
                  className="w-full bg-[#181820] border border-[#2A2A35] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#5C5CFF] transition-colors" />
              </div>
              <div>
                <label className="text-xs font-bold text-[#8B8CA8] uppercase tracking-wider mb-2 block">Email</label>
                <input type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required placeholder="you@example.com"
                  className="w-full bg-[#181820] border border-[#2A2A35] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#5C5CFF] transition-colors" />
              </div>
              <div>
                <label className="text-xs font-bold text-[#8B8CA8] uppercase tracking-wider mb-2 block">Password</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required placeholder="••••••••"
                    className="w-full bg-[#181820] border border-[#2A2A35] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#5C5CFF] transition-colors pr-12" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8B8CA8]">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#8B8CA8] uppercase tracking-wider mb-2 block">Weight (kg)</label>
                  <input type="number" value={regWeight} onChange={(e) => setRegWeight(e.target.value)} placeholder="75"
                    className="w-full bg-[#181820] border border-[#2A2A35] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#5C5CFF] transition-colors" />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#8B8CA8] uppercase tracking-wider mb-2 block">Height (cm)</label>
                  <input type="number" value={regHeight} onChange={(e) => setRegHeight(e.target.value)} placeholder="175"
                    className="w-full bg-[#181820] border border-[#2A2A35] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#5C5CFF] transition-colors" />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#5C5CFF] hover:bg-[#4B4BFF] disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-colors mt-2"
              >
                {loading ? 'Creating account...' : 'CREATE ACCOUNT'}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
