import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { Sparkles, Code2, Briefcase, Mail, Lock, User, Phone, CheckCircle2, ArrowRight, X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register, checkUsernameExists, resetPassword } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login');
  const [role, setRole] = useState<UserRole>('developer');

  // Login Form
  const [loginTerm, setLoginTerm] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Reset Password Form
  const [resetEmail, setResetEmail] = useState('');
  const [resetMsg, setResetMsg] = useState('');
  const [resetError, setResetError] = useState('');

  // Register Form
  const [regUsername, setRegUsername] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regError, setRegError] = useState('');

  // OTP Step
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpMsg, setOtpMsg] = useState('');
  const [otpError, setOtpError] = useState('');
  const [resending, setResending] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginTerm.trim()) return;
    setLoginError('');
    setSubmitting(true);

    try {
      const res = await login(loginTerm, loginPassword);
      if (res.success) {
        onClose();
      } else {
        setLoginError(res.message || 'Invalid credentials or account not found.');
      }
    } catch (err: any) {
      setLoginError(err?.message || 'Login failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetMsg('');
    setResetError('');
    if (!resetEmail.trim()) {
      setResetError('Please enter your email address.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await resetPassword(resetEmail);
      if (res.success) {
        setResetMsg(res.message || 'Password reset link sent to your email address!');
      } else {
        setResetError(res.message || 'Failed to send password reset email.');
      }
    } catch (err: any) {
      setResetError('An error occurred sending the password reset link.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    if (!regUsername.trim() || !regFullName.trim() || !regEmail.trim()) {
      setRegError('Please fill out all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      // Unique Username Check
      const isTaken = await checkUsernameExists(regUsername);
      if (isTaken) {
        setRegError('This username is already in use. Please choose another.');
        setSubmitting(false);
        return;
      }

      // Send OTP via server API
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: regEmail.trim() }),
      });

      const data = await response.json();
      if (!response.ok) {
        setRegError(data.error || 'Failed to send verification code.');
        setSubmitting(false);
        return;
      }

      setOtpMsg(data.message || `Verification code sent to ${regEmail.trim()}. Please check your email.`);
      setOtpError('');
      setOtpStep(true);
    } catch (err) {
      setRegError('Failed to send verification email. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    setResending(true);
    setOtpError('');
    setOtpMsg('');
    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: regEmail.trim() }),
      });
      const data = await response.json();
      if (response.ok) {
        setOtpMsg('A fresh verification code has been sent to your email address.');
      } else {
        setOtpError(data.error || 'Failed to resend verification code.');
      }
    } catch (e) {
      setOtpError('Error resending verification code.');
    } finally {
      setResending(false);
    }
  };

  const handleVerifyOtpAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');
    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setOtpError('Please enter the 6-digit OTP code sent to your email.');
      return;
    }

    setSubmitting(true);
    try {
      // Verify OTP with Server API
      const verifyRes = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: regEmail.trim(), otp: otpCode.trim() }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.success) {
        setOtpError(verifyData.message || 'Invalid or expired OTP code.');
        setSubmitting(false);
        return;
      }

      // Create Firebase Auth user & Firestore profile
      const res = await register({
        username: regUsername,
        fullName: regFullName,
        email: regEmail,
        phone: regPhone,
        password: regPassword || 'password123',
        role: role,
      });

      if (res.success) {
        setOtpStep(false);
        onClose();
      } else {
        setOtpError(res.message || 'Registration failed.');
      }
    } catch (err: any) {
      setOtpError(err?.message || 'Error creating account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center text-white mx-auto mb-3 shadow-lg shadow-orange-500/30">
            <Sparkles className="w-6 h-6 fill-white" />
          </div>
          <h3 className="text-2xl font-extrabold tracking-tight">Starforge</h3>
          <p className="text-xs text-zinc-400 mt-1">
            {mode === 'login'
              ? 'Sign in to your account'
              : mode === 'register'
              ? 'Join the developer & client network'
              : 'Reset your account password'}
          </p>
        </div>

        {/* Login / Register / Reset Toggle Tabs */}
        <div className="flex rounded-xl bg-zinc-800/80 p-1 mb-6 border border-zinc-700/50">
          <button
            onClick={() => {
              setMode('login');
              setOtpStep(false);
              setRegError('');
              setLoginError('');
              setResetMsg('');
              setResetError('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              mode === 'login' ? 'bg-orange-500 text-white shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Log In
          </button>
          <button
            onClick={() => {
              setMode('register');
              setOtpStep(false);
              setRegError('');
              setLoginError('');
              setResetMsg('');
              setResetError('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              mode === 'register' ? 'bg-orange-500 text-white shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
          <button
            onClick={() => {
              setMode('reset');
              setOtpStep(false);
              setRegError('');
              setLoginError('');
              setResetMsg('');
              setResetError('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              mode === 'reset' ? 'bg-orange-500 text-white shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Reset
          </button>
        </div>

        {/* LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {loginError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl font-medium">
                {loginError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Username or Email
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  required
                  placeholder="alex_dev or email@example.com"
                  value={loginTerm}
                  onChange={(e) => setLoginTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm focus:outline-none focus:border-orange-500 text-white placeholder-zinc-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-zinc-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setMode('reset')}
                  className="text-[11px] font-semibold text-orange-400 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm focus:outline-none focus:border-orange-500 text-white placeholder-zinc-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 font-bold text-sm text-white shadow-lg shadow-orange-500/25 transition hover:scale-[1.02] disabled:opacity-50"
            >
              {submitting ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        )}

        {/* RESET PASSWORD FORM */}
        {mode === 'reset' && (
          <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
            <div className="text-xs text-zinc-400 leading-relaxed bg-zinc-800/60 border border-zinc-700/50 p-3 rounded-xl">
              Enter your registered email address below. We will send a secure password reset link to your email.
            </div>

            {resetMsg && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs p-3 rounded-xl font-medium">
                {resetMsg}
              </div>
            )}

            {resetError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl font-medium">
                {resetError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Your Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm focus:outline-none focus:border-orange-500 text-white placeholder-zinc-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 font-bold text-sm text-white shadow-lg shadow-orange-500/25 transition hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4" />
              <span>{submitting ? 'Sending Reset Link...' : 'Send Reset Link to Email'}</span>
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-xs font-semibold text-zinc-400 hover:text-white transition"
              >
                ← Return to Log In
              </button>
            </div>
          </form>
        )}

        {/* REGISTER FORM */}
        {mode === 'register' && !otpStep && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            {regError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl font-medium">
                {regError}
              </div>
            )}

            {/* Choose Role */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-2">
                I am a:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('developer')}
                  className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold transition ${
                    role === 'developer'
                      ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                      : 'border-zinc-800 bg-zinc-800/50 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <Code2 className="w-4 h-4 text-orange-400" />
                  <span>Developer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('client')}
                  className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold transition ${
                    role === 'client'
                      ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                      : 'border-zinc-800 bg-zinc-800/50 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <Briefcase className="w-4 h-4 text-blue-400" />
                  <span>Client / Employer</span>
                </button>
              </div>
            </div>

            {/* Input fields */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Username</label>
              <input
                type="text"
                required
                placeholder="e.g. dev_sam"
                value={regUsername}
                onChange={(e) => {
                  setRegUsername(e.target.value);
                  setRegError('');
                }}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs focus:outline-none focus:border-orange-500 text-white placeholder-zinc-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Sam Miller"
                value={regFullName}
                onChange={(e) => setRegFullName(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs focus:outline-none focus:border-orange-500 text-white placeholder-zinc-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="sam@example.com"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs focus:outline-none focus:border-orange-500 text-white placeholder-zinc-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs focus:outline-none focus:border-orange-500 text-white placeholder-zinc-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Phone Number (Optional)</label>
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs focus:outline-none focus:border-orange-500 text-white placeholder-zinc-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 font-bold text-xs text-white shadow-lg shadow-orange-500/25 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{submitting ? 'Checking username...' : 'Send Email OTP Verification'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* OTP VERIFICATION STEP */}
        {mode === 'register' && otpStep && (
          <form onSubmit={handleVerifyOtpAndRegister} className="space-y-4 animate-in fade-in">
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-4 text-center">
              <Mail className="w-6 h-6 text-orange-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-zinc-200">
                Verification code sent to <span className="text-orange-400 font-bold">{regEmail}</span>
              </p>
              <p className="text-[11px] text-zinc-400 mt-1">
                Please check your email inbox and enter the 6-digit verification code below. Code expires in 10 minutes.
              </p>
            </div>

            {otpMsg && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs p-3 rounded-xl font-medium">
                {otpMsg}
              </div>
            )}

            {otpError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl font-medium">
                {otpError}
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-zinc-300">
                  Enter 6-Digit Verification Code
                </label>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resending}
                  className="text-[11px] font-semibold text-orange-400 hover:underline disabled:opacity-50"
                >
                  {resending ? 'Sending...' : 'Resend Code'}
                </button>
              </div>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="6-Digit OTP"
                value={otpCode}
                onChange={(e) => {
                  setOtpCode(e.target.value);
                  setOtpError('');
                }}
                className="w-full text-center tracking-widest text-xl font-mono py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setOtpStep(false);
                  setOtpCode('');
                  setOtpError('');
                }}
                className="w-1/3 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 transition"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-xs font-bold text-white shadow-lg shadow-orange-500/25 flex items-center justify-center gap-1.5 transition disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{submitting ? 'Verifying...' : 'Verify & Create Account'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
