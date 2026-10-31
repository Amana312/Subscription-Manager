'use client';

import React, { useState, useEffect } from 'react';
import { Check, X, ArrowRight, Mail, Lock, User, KeyRound, Sparkles, LogOut, CheckCircle2 } from 'lucide-react';

export default function AccountsPage() {
  const [tab, setTab] = useState<'register' | 'login' | 'forgot' | 'reset'>('register');
  
  // Registration State
  const [fullName, setFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<'CUSTOMER' | 'STAFF' | 'ADMIN'>('CUSTOMER');
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Forgot & Reset Password State
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [simulatedEmailLink, setSimulatedEmailLink] = useState<string | null>(null);

  // Status feedback
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loggedInUser, setLoggedInUser] = useState<any>(null);

  // Read URL query params on mount for reset token
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlTab = params.get('tab');
      const urlToken = params.get('token');
      if (urlTab === 'reset' && urlToken) {
        setTab('reset');
        setResetToken(urlToken);
      }
    }
  }, []);

  // Live password validation checks
  const passMoreThanEight = regPassword.length > 8;
  const passHasUpper = /[A-Z]/.test(regPassword);
  const passHasLower = /[a-z]/.test(regPassword);
  const passHasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(regPassword);
  const isPasswordValid = passMoreThanEight && passHasUpper && passHasLower && passHasSpecial;

  const validCount = [passMoreThanEight, passHasUpper, passHasLower, passHasSpecial].filter(Boolean).length;

  // Reset password checks
  const resetMoreThanEight = newPassword.length > 8;
  const resetHasUpper = /[A-Z]/.test(newPassword);
  const resetHasLower = /[a-z]/.test(newPassword);
  const resetHasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(newPassword);
  const isResetPasswordValid = resetMoreThanEight && resetHasUpper && resetHasLower && resetHasSpecial;

  const handleTabChange = (newTab: 'register' | 'login' | 'forgot' | 'reset') => {
    setTab(newTab);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!isPasswordValid) {
      setErrorMessage('Please satisfy all password security requirements.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email: regEmail,
          password: regPassword,
          role: regRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Registration failed');
      } else {
        setSuccessMessage(`Account created successfully for ${data.user.email}.`);
        setFullName('');
        setRegEmail('');
        setRegPassword('');
        setTab('login');
      }
    } catch (err: any) {
      setErrorMessage('Network error during registration.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Invalid credentials');
      } else {
        setLoggedInUser(data.user);
        setSuccessMessage(`Welcome back, ${data.user.fullName}`);
      }
    } catch (err: any) {
      setErrorMessage('Network error during login.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to process request');
      } else {
        setSuccessMessage(data.message);
        if (data.simulatedLink) {
          setSimulatedEmailLink(data.simulatedLink);
          setResetToken(data.token);
        }
      }
    } catch (err) {
      setErrorMessage('Network error requesting password reset.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!isResetPasswordValid) {
      setErrorMessage('Password must be more than 8 characters and contain uppercase, lowercase, and a special character.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: resetToken,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Password reset failed');
      } else {
        setSuccessMessage('Password updated. Please log in with your new credentials.');
        setSimulatedEmailLink(null);
        setNewPassword('');
        setTab('login');
      }
    } catch (err) {
      setErrorMessage('Network error resetting password.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (email: string, pass: string) => {
    setLoginEmail(email);
    setLoginPassword(pass);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6">
      <div className="w-full max-w-[460px]">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-slate-900 text-white mb-3 shadow-sm">
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Brightloop</h1>
          <p className="text-sm text-slate-500 mt-1">Unified Subscription & Recurring Billing</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.05)] p-7 sm:p-9">
          
          {/* Minimalist Segmented Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
            <button
              onClick={() => handleTabChange('register')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                tab === 'register'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign Up
            </button>
            <button
              onClick={() => handleTabChange('login')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                tab === 'login'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => handleTabChange('forgot')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                tab === 'forgot' || tab === 'reset'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Recovery
            </button>
          </div>

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50/80 border border-rose-200/60 text-rose-700 text-xs font-medium flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/60 text-emerald-800 text-xs font-medium flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* 1. SIGN UP */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-800 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-800 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-800 transition-all"
                  />
                </div>

                {/* Minimalist Strength Meter */}
                <div className="mt-2.5 flex space-x-1.5">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        validCount >= step
                          ? validCount === 4
                            ? 'bg-emerald-500'
                            : 'bg-amber-400'
                          : 'bg-slate-100'
                      }`}
                    />
                  ))}
                </div>

                {/* Criteria Indicators */}
                <div className="mt-3 grid grid-cols-2 gap-2 p-3 bg-slate-50/80 rounded-xl border border-slate-100 text-[11px]">
                  <div className={`flex items-center space-x-1.5 ${passMoreThanEight ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {passMoreThanEight ? <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 ml-1 mr-1" />}
                    <span>&gt; 8 characters</span>
                  </div>
                  <div className={`flex items-center space-x-1.5 ${passHasUpper ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {passHasUpper ? <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 ml-1 mr-1" />}
                    <span>Uppercase letter</span>
                  </div>
                  <div className={`flex items-center space-x-1.5 ${passHasLower ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {passHasLower ? <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 ml-1 mr-1" />}
                    <span>Lowercase letter</span>
                  </div>
                  <div className={`flex items-center space-x-1.5 ${passHasSpecial ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {passHasSpecial ? <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 ml-1 mr-1" />}
                    <span>Special character</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Account Role
                </label>
                <select
                  value={regRole}
                  onChange={(e: any) => setRegRole(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-800 transition-all"
                >
                  <option value="CUSTOMER">Customer (Client Portal)</option>
                  <option value="STAFF">Staff (Sales & Management)</option>
                  <option value="ADMIN">Administrator (Full Access)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading || !isPasswordValid}
                className="w-full mt-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-xl shadow-sm disabled:opacity-40 transition-all flex items-center justify-center space-x-2"
              >
                <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>
            </form>
          )}

          {/* 2. SIGN IN */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-800 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => handleTabChange('forgot')}
                    className="text-xs text-slate-500 hover:text-slate-900 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-800 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-xl shadow-sm transition-all flex items-center justify-center space-x-2"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>

              {/* Minimal Demo Access Selector */}
              <div className="mt-6 pt-5 border-t border-slate-100">
                <span className="block text-[11px] uppercase tracking-wider font-semibold text-slate-400 mb-2.5 text-center">
                  Quick Demo Access
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => fillCredentials('admin@brightloop.com', 'Admin@12345')}
                    className="py-1.5 px-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium rounded-lg border border-slate-200/70 transition-all text-center"
                  >
                    Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => fillCredentials('staff@brightloop.com', 'Staff@12345')}
                    className="py-1.5 px-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium rounded-lg border border-slate-200/70 transition-all text-center"
                  >
                    Staff
                  </button>
                  <button
                    type="button"
                    onClick={() => fillCredentials('customer@brightloop.com', 'Customer@12345')}
                    className="py-1.5 px-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium rounded-lg border border-slate-200/70 transition-all text-center"
                  >
                    Customer
                  </button>
                </div>
              </div>

              {/* Logged in state */}
              {loggedInUser && (
                <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{loggedInUser.fullName}</p>
                      <p className="text-slate-500">{loggedInUser.email}</p>
                      <span className="inline-block mt-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-200 text-slate-800 uppercase tracking-wider">
                        {loggedInUser.role}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setLoggedInUser(null);
                        setSuccessMessage('Logged out successfully.');
                      }}
                      className="inline-flex items-center space-x-1 px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-medium rounded-lg border border-slate-200 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5 text-slate-500" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </form>
          )}

          {/* 3. RECOVERY */}
          {tab === 'forgot' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                Enter your registered email address and we will generate a secure reset link.
              </p>

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-800 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-xl shadow-sm transition-all"
                >
                  {loading ? 'Generating link...' : 'Send Password Reset Link'}
                </button>
              </form>

              {/* Minimalist Simulation Alert */}
              {simulatedEmailLink && (
                <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <p className="font-medium text-slate-800">
                    A secure reset token was created for <b>{forgotEmail}</b>.
                  </p>
                  <button
                    onClick={() => setTab('reset')}
                    className="mt-2.5 inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition-all"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Open Reset Link</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 4. RESET PASSWORD */}
          {tab === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-800 transition-all"
                  />
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 p-3 bg-slate-50/80 rounded-xl border border-slate-100 text-[11px]">
                  <div className={`flex items-center space-x-1.5 ${resetMoreThanEight ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {resetMoreThanEight ? <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 ml-1 mr-1" />}
                    <span>&gt; 8 characters</span>
                  </div>
                  <div className={`flex items-center space-x-1.5 ${resetHasUpper ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {resetHasUpper ? <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 ml-1 mr-1" />}
                    <span>Uppercase letter</span>
                  </div>
                  <div className={`flex items-center space-x-1.5 ${resetHasLower ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {resetHasLower ? <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 ml-1 mr-1" />}
                    <span>Lowercase letter</span>
                  </div>
                  <div className={`flex items-center space-x-1.5 ${resetHasSpecial ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {resetHasSpecial ? <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300 ml-1 mr-1" />}
                    <span>Special character</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !isResetPasswordValid}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-xl shadow-sm disabled:opacity-40 transition-all"
              >
                {loading ? 'Updating Password...' : 'Save New Password'}
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
