import React, { useState } from 'react';
import { Shield, Mail, Lock, ArrowRight, Sparkles, CheckCircle } from 'lucide-react';

interface LoginProps {
  onLogin: (name: string, email: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('demo@notice2action.com');
  const [password, setPassword] = useState('password');
  const [name, setName] = useState('John Doe');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Please enter your email.'); return; }
    if (!password.trim()) { setError('Please enter your password.'); return; }

    setIsLoading(true);
    // Client-side auth — no backend DB needed
    const resolvedName = (isRegistering ? name.trim() : '') || email.split('@')[0];
    const displayName = resolvedName.charAt(0).toUpperCase() + resolvedName.slice(1);

    // Brief success flash before transitioning
    setSuccess(true);
    setTimeout(() => {
      onLogin(displayName, email.trim());
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-60 pointer-events-none" />
      
      <div className="w-full max-w-md relative z-10">
        {/* Brand Logo */}
        <div className="text-center mb-8 flex flex-col items-center">
          <img src="/favicon.svg" alt="Notice2Action" className="h-12 w-12 rounded-2xl shadow-md mb-3" />
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Notice2Action
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Sign in to start converting announcements into tasks
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5 text-left">
            {isRegistering && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-250 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none transition-colors"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-250 bg-white pl-11 pr-4 py-2.5 text-sm text-slate-850 placeholder-slate-400 focus:border-indigo-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Password</label>
                {!isRegistering && (
                  <a href="#" className="text-xs font-bold text-indigo-600 hover:underline">Forgot?</a>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-250 bg-white pl-11 pr-4 py-2.5 text-sm text-slate-850 placeholder-slate-400 focus:border-indigo-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-rose-600 font-medium text-center -mt-1">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading || success}
              className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white shadow-sm transition-all duration-300 mt-2 disabled:opacity-80
                ${success ? 'bg-emerald-500' : 'bg-indigo-600 hover:bg-indigo-700'}`}
            >
              {success ? (
                <><CheckCircle size={16} /><span>Signed in!</span></>
              ) : isLoading ? (
                <span>Signing in...</span>
              ) : (
                <><span>{isRegistering ? 'Create Account' : 'Sign In'}</span><ArrowRight size={16} /></>
              )}
            </button>
          </form>

          {/* Toggle Register */}
          <div className="text-center mt-6 pt-5 border-t border-slate-100">
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
            >
              {isRegistering ? 'Already have an account? Sign in' : "Don't have an account? Register"}
            </button>
          </div>
        </div>

        {/* Demo Badges */}
        <div className="mt-6 flex justify-center gap-2">
          <span className="inline-flex items-center gap-1 rounded bg-slate-105 border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-500 uppercase">
            <Shield size={10} />
            Secure Session
          </span>
          <span className="inline-flex items-center gap-1 rounded bg-indigo-50 border border-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700 uppercase">
            <Sparkles size={10} />
            Demo Credentials Pre-filled
          </span>
        </div>
      </div>
    </div>
  );
}
