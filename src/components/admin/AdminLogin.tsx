import React, { useState } from 'react';
import { Lock, User, ArrowLeft, Loader2, AlertCircle, ShieldCheck, Eye, EyeOff } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: (user: any) => void;
  onBackToWebsite: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onBackToWebsite }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMessage('Please enter both username and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || 'Authentication failed. Please check your credentials.');
        setIsLoading(false);
        return;
      }

      // Store token in localStorage as backup for non-cookie auth headers
      if (data.token) {
        localStorage.setItem('dentacare_admin_jwt', data.token);
      }

      onLoginSuccess(data.user);
    } catch (err: any) {
      setErrorMessage('Unable to connect to the server. Please check your connection.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Back to Public Site button */}
        <button
          onClick={onBackToWebsite}
          className="inline-flex items-center gap-2 text-xs font-bold text-sky-400 hover:text-sky-300 mb-6 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Denta Care Public Website</span>
        </button>

        {/* Brand Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 justify-center mb-2">
            <span className="font-extrabold text-3xl tracking-tight text-sky-400">DENTA</span>
            <span className="font-black text-3xl tracking-tight text-white">CARE</span>
          </div>
          <div className="inline-flex items-center gap-1 bg-slate-800 text-slate-300 text-xs px-3 py-1 rounded-full border border-slate-700 mt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
            <span>Clinic Staff & Admin Portal</span>
          </div>
          <h2 className="mt-4 text-xl sm:text-2xl font-bold tracking-tight text-slate-100">
            Sign in to Clinic Management
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Restricted access for authorized clinic coordinators and dentists.
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-slate-800/90 backdrop-blur-md py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-slate-700/80">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-900/40 border border-red-700/50 text-red-200 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Admin Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-sky-500 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-sky-500 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-full bg-[#f2542d] hover:bg-[#e0451f] text-white font-extrabold text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Access Admin Dashboard</span>
              )}
            </button>
          </form>

          {/* Development Setup Notice */}
          <div className="mt-6 pt-6 border-t border-slate-700/60 text-center">
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Default administrator credentials initialized:
              <br />
              Username: <code className="text-sky-300 bg-slate-900 px-1.5 py-0.5 rounded font-mono">admin</code>
              <br />
              Password: <code className="text-sky-300 bg-slate-900 px-1.5 py-0.5 rounded font-mono">DentaCare2026!Secure</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
