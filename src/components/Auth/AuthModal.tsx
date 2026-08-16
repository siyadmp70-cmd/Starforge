import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { Sparkles, Code2, Briefcase, Mail, Lock, User, Phone, CheckCircle2, ArrowRight, X, Copy, Check, ShieldCheck, KeyRound, RefreshCw, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register, checkUsernameExists, resetPassword, resetPasswordWithOtp, sendEmailOtp, verifyEmailOtp } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login');
  const [role, setRole] = useState<UserRole>('developer');

  // Login Form
  const [loginTerm, setLoginTerm] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [loginSuccessMsg, setLoginSuccessMsg] = useState('');

  // Reset Password Form
  const [resetEmail, setResetEmail] = useState('');
  const [resetStep, setResetStep] = useState<'request' | 'verify'>('request');
  const [resetOtpCode, setResetOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetMsg, setResetMsg] = useState('');
  const [resetError, setResetError] = useState('');

  // Register Form
  const [regUsername, setRegUsername] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regError, setRegError] = useState('');

  // OTP Step (Register)
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
    setLoginSuccessMsg('');
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

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetMsg('');
    setResetError('');
    const target = resetEmail.trim();
    if (!target) {
      setResetError('Please enter your email address.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await resetPassword(target);
      if (res.success) {
        setResetMsg(`Verification code sent to ${target}. Please check your inbox and enter the 6-digit code below.`);
        setResetStep('verify');
      } else {
        setResetError(res.message || 'Failed to send reset code.');
      }
    } catch (err: any) {
      setResetError('An error occurred generating the password reset code.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetMsg('');
    const code = resetOtpCode.trim();
    if (!code || code.length !== 6) {
      setResetError('Please enter the 6-digit verification code.');
      return;
    }
    if (!newPassword.trim() || newPassword.trim().length < 6) {
      setResetError('Please choose a password with at least 6 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await resetPasswordWithOtp(resetEmail, code, newPassword);
      if (res.success) {
        setResetMsg('Password reset successful! Redirecting to login...');
        setTimeout(() => {
          setMode('login');
          setLoginTerm(resetEmail);
          setLoginSuccessMsg('Password updated successfully. Please log in with your new password.');
          setResetStep('request');
          setResetOtpCode('');
          setNewPassword('');
          setResetMsg('');
        }, 1200);
      } else {
        setResetError(res.message || 'Invalid verification code or failed to reset password.');
      }
    } catch (e: any) {
      setResetError(e?.message || 'Error updating password.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    if (!regUsername.trim() || !regFullName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setRegError('Please fill out all required fields.');
      return;
    }

    if (regPassword.length < 6) {
      setRegError('Password must be at least 6 characters long.');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Check Username uniqueness
      const isTaken = await checkUsernameExists(regUsername);
      if (isTaken) {
        setRegError('This username is already taken. Please choose a different username.');
        setSubmitting(false);
        return;
      }

      // 2. Generate and dispatch email OTP code
      const targetEmail = regEmail.trim().toLowerCase();
      await sendEmailOtp(targetEmail);
      
      setOtpMsg(`A 6-digit verification code has been sent to ${targetEmail}. Please check your email and enter the code below.`);
      setOtpError('');
      setOtpStep(true);
    } catch (err) {
      setOtpMsg(`A 6-digit verification code has been sent to ${regEmail.trim()}.`);
      setOtpError('');
      setOtpStep(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    setResending(true);
    setOtpError('');
    setOtpMsg('');
    const targetEmail = regEmail.trim().toLowerCase();
    try {
      const res = await sendEmailOtp(targetEmail);
      if (res.success) {
        setOtpMsg(`A new 6-digit verification code has been sent to ${targetEmail}.`);
      } else {
        setOtpError(res.message || 'Failed to send a new verification code.');
      }
    } catch (e) {
      setOtpError('Error sending verification code.');
    } finally {
      setResending(false);
    }
  };

  const handleVerifyOtpAndRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');
    const code = otpCode.trim();
    if (!code || code.length !== 6) {
      setOtpError('Please enter the 6-digit verification code sent to your email.');
      return;
    }

    setSubmitting(true);
    try {
      const targetEmail = regEmail.trim().toLowerCase();
      const verifyRes = await verifyEmailOtp(targetEmail, code);
      if (!verifyRes.success) {
        setOtpError(verifyRes.message || 'Invalid or expired verification code.');
        setSubmitting(false);
        return;
      }

      // Create user account in Firestore
      const res = await register({
        username: regUsername.trim(),
        fullName: regFullName.trim(),
        email: targetEmail,
        phone: regPhone.trim(),
        password: regPassword,
        role: role,
      });

      if (res.success) {
        // Direct transition to login screen with prefilled username/email
        setOtpStep(false);
        setMode('login');
        setLoginTerm(regUsername.trim());
        setLoginSuccessMsg('Account created successfully! Please sign in with your password to continue.');
        setRegPassword('');
      } else {
        setOtpError(res.message || 'Registration failed. Please try again.');
      }
    } catch (err: any) {
      setOtpError(err?.message || 'Error creating account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-zinc-900 border border-zinc-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl text-white custom-scrollbar">
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
              ? 'Create your account with email verification'
              : 'Reset your account password'}
          </p>
        </div>

        {/* Login / Register / Reset Tabs */}
        <div className="flex rounded-xl bg-zinc-800/80 p-1 mb-6 border border-zinc-700/50">
          <button
            onClick={() => {
              setMode('login');
              setOtpStep(false);
              setResetStep('request');
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
              setResetStep('request');
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
              setResetStep('request');
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
            {loginSuccessMsg && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs p-3 rounded-xl font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{loginSuccessMsg}</span>
              </div>
            )}

            {loginError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
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
                  onChange={(e) => {
                    setLoginTerm(e.target.value);
                    setLoginError('');
                  }}
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
                  onClick={() => {
                    setMode('reset');
                    setResetEmail(loginTerm);
                  }}
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

        {/* RESET PASSWORD STEP 1: REQUEST CODE */}
        {mode === 'reset' && resetStep === 'request' && (
          <form onSubmit={handleRequestReset} className="space-y-4">
            <div className="text-xs text-zinc-300 leading-relaxed bg-zinc-800/60 border border-zinc-700/50 p-3 rounded-xl">
              Enter your registered email address. A 6-digit verification code will be sent to your email to verify and reset your password.
            </div>

            {resetMsg && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs p-3 rounded-xl font-medium">
                {resetMsg}
              </div>
            )}

            {resetError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{resetError}</span>
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
              <KeyRound className="w-4 h-4" />
              <span>{submitting ? 'Sending Verification Code...' : 'Send Reset Code to Email'}</span>
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

        {/* RESET PASSWORD STEP 2: VERIFY & SET NEW PASSWORD */}
        {mode === 'reset' && resetStep === 'verify' && (
          <form onSubmit={handleCompleteReset} className="space-y-4 animate-in fade-in">
            <div className="text-xs text-zinc-300 bg-zinc-800/60 border border-zinc-700/50 p-3.5 rounded-xl leading-relaxed">
              We sent a 6-digit code to <strong className="text-white">{resetEmail}</strong>. Please enter the code below and choose your new password.
            </div>

            {resetMsg && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs p-3 rounded-xl font-medium">
                {resetMsg}
              </div>
            )}

            {resetError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{resetError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                6-Digit Verification Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="000000"
                value={resetOtpCode}
                onChange={(e) => setResetOtpCode(e.target.value)}
                className="w-full text-center tracking-widest text-xl font-mono py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Choose New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-sm focus:outline-none focus:border-orange-500 text-white placeholder-zinc-500"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setResetStep('request')}
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
                <span>{submitting ? 'Updating...' : 'Set Password & Log In'}</span>
              </button>
            </div>
          </form>
        )}

        {/* REGISTER FORM: STEP 1 (DETAILS) */}
        {mode === 'register' && !otpStep && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            {regError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{regError}</span>
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

            {/* Username */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Username *</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g. dev_sam"
                  value={regUsername}
                  onChange={(e) => {
                    setRegUsername(e.target.value);
                    setRegError('');
                  }}
                  className="w-full pl-9 pr-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs focus:outline-none focus:border-orange-500 text-white placeholder-zinc-500"
                />
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Sam Miller"
                value={regFullName}
                onChange={(e) => setRegFullName(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs focus:outline-none focus:border-orange-500 text-white placeholder-zinc-500"
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Email Address * (Verification Code Sent Here)</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-500" />
                <input
                  type="email"
                  required
                  placeholder="sam@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs focus:outline-none focus:border-orange-500 text-white placeholder-zinc-500"
                />
              </div>
            </div>

            {/* Phone Number (Strictly Optional) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-zinc-300">Phone Number</label>
                <span className="text-[10px] text-zinc-500">Optional</span>
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-500" />
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs focus:outline-none focus:border-orange-500 text-white placeholder-zinc-500"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-500" />
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs focus:outline-none focus:border-orange-500 text-white placeholder-zinc-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 font-bold text-xs text-white shadow-lg shadow-orange-500/25 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{submitting ? 'Sending Verification Code...' : 'Send Verification Code to Email'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* REGISTER FORM: STEP 2 (OTP VERIFICATION) */}
        {mode === 'register' && otpStep && (
          <form onSubmit={handleVerifyOtpAndRegister} className="space-y-4 animate-in fade-in">
            <div className="bg-zinc-800/70 border border-zinc-700/60 rounded-2xl p-4 text-xs text-zinc-300 space-y-1.5">
              <div className="flex items-center gap-1.5 text-orange-400 font-bold">
                <Mail className="w-4 h-4 text-orange-400" />
                <span>Verification Email Sent</span>
              </div>
              <p>
                We sent a 6-digit verification code to <strong className="text-white">{regEmail}</strong>.
              </p>
              <p className="text-[11px] text-zinc-400">
                Please check your inbox (and spam folder) and enter the 6-digit code below to create your account.
              </p>
            </div>

            {otpMsg && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs p-3 rounded-xl font-medium">
                {otpMsg}
              </div>
            )}

            {otpError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-xl font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{otpError}</span>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-zinc-300">
                  6-Digit Verification Code
                </label>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resending}
                  className="text-[11px] font-semibold text-orange-400 hover:underline disabled:opacity-50 flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${resending ? 'animate-spin' : ''}`} />
                  <span>{resending ? 'Sending...' : 'Resend Code'}</span>
                </button>
              </div>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="000000"
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
                <span>{submitting ? 'Creating Account...' : 'Confirm & Create Account'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
