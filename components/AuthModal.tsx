import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, ArrowLeft, KeyRound, MessageSquareCode, CheckCircle2, Clock } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { UserRole } from '../types';
import { validatePasswordStrength, validateEmail } from '../utils/security';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthView = 'LOGIN' | 'SIGNUP' | 'OTP_VERIFY' | 'FORGOT_PASSWORD' | 'RESET_PASSWORD';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [view, setView] = useState<AuthView>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showAdminKey, setShowAdminKey] = useState(false);
  
  // Timer State
  const [timer, setTimer] = useState(60);
  
  // Track if we are verifying OTP for registration or password reset
  const [isResetFlow, setIsResetFlow] = useState(false);
  
  const { login, register, verifyEmail, resendOtp, forgotPassword, resetPassword } = useStore();

  // Reset state when opening/closing
  useEffect(() => {
    if (isOpen) {
      setView('LOGIN');
      setEmail('');
      setPassword('');
      setName('');
      setOtp('');
      setAdminKey('');
      setError('');
      setSuccessMsg('');
      setIsLoading(false);
      setShowAdminKey(false);
      setIsResetFlow(false);
      setTimer(60);
    }
  }, [isOpen]);

  // Timer Countdown
  useEffect(() => {
    let interval: any;
    if (view === 'OTP_VERIFY' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [view, timer]);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await login(email, password);
      if (result.success) {
        onClose();
      } else {
        if (result.isUnverified) {
           // If user tries to login but is unverified, trigger OTP flow
           await resendOtp(email, 'REGISTER');
           setIsResetFlow(false);
           setTimer(60);
           setView('OTP_VERIFY');
           setSuccessMsg('Email not verified. New code sent.');
        } else {
           setError(result.message || 'Login failed');
        }
      }
    } catch (e) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupInit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
       setError("Please fill all fields");
       return;
    }
    
    if (!validateEmail(email)) {
      setError('Invalid email address.');
      return;
    }

    if (!validatePasswordStrength(password)) {
      setError('Password must be at least 8 chars and include a number/symbol.');
      return;
    }

    if (showAdminKey && adminKey !== 'LUMINA_ADMIN') {
      setError('Invalid Admin Key');
      return;
    }

    setIsLoading(true);
    const role = showAdminKey ? UserRole.ADMIN : UserRole.CUSTOMER;
    const result = await register(name, email, password, role, adminKey);
    setIsLoading(false);

    if (result.success) {
       setIsResetFlow(false);
       setTimer(60);
       setView('OTP_VERIFY');
    } else {
       setError(result.message || 'Registration failed');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (otp.length !== 6) {
        setError("Please enter 6 digit code");
        return;
    }

    setIsLoading(true);

    if (isResetFlow) {
        // Password Reset Flow - We verify by trying to move to next step, backend verifies on final reset
        // But let's assume we proceed to RESET_PASSWORD view
        setView('RESET_PASSWORD');
        setIsLoading(false);
    } else {
        // Registration Flow
        const result = await verifyEmail(email, otp);
        setIsLoading(false);
        
        if (result.success) {
           setSuccessMsg('Email Verified Successfully!');
           setTimeout(() => onClose(), 1500);
        } else {
           setError(result.message || 'Invalid OTP');
        }
    }
  };

  const handleResendCode = async () => {
     if (timer > 0) return;
     setError('');
     setSuccessMsg('');
     setIsLoading(true);
     
     const type = isResetFlow ? 'RESET' : 'REGISTER';
     const result = await resendOtp(email, type);
     
     setIsLoading(false);
     if (result.success) {
        setTimer(60);
        setSuccessMsg('Code resent successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
     } else {
        setError(result.message || 'Failed to resend code');
     }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setError('');
    if (!email) {
      setError("Please enter your email");
      return;
    }
    setIsLoading(true);
    try {
      const result = await forgotPassword(email);
      if (result.success) {
         setSuccessMsg("OTP sent! Please check your email.");
         setIsResetFlow(true);
         setOtp('');
         setTimer(60);
         setTimeout(() => {
             setSuccessMsg('');
             setView('OTP_VERIFY');
         }, 1500);
      } else {
         setError(result.message || "Failed to send code.");
      }
    } catch (e) {
       setError("Something went wrong.");
    } finally {
       setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validatePasswordStrength(password)) {
      setError("Password too weak. Use 8+ chars with numbers/symbols.");
      return;
    }
    
    setIsLoading(true);
    try {
        const result = await resetPassword(email, otp, password);
        if (result.success) {
            setSuccessMsg("Password reset successfully! You are now logged in.");
            setTimeout(() => {
                onClose();
            }, 2000);
        } else {
            setError(result.message || "Failed to reset password.");
        }
    } catch (err) {
        setError("Error resetting password.");
    } finally {
        setIsLoading(false);
    }
  };

  const renderLogin = () => (
    <form onSubmit={handleLogin} className="space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-bold text-gray-900">Email Address</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 caret-blue-600 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            placeholder="name@example.com"
          />
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <label className="text-sm font-bold text-gray-900">Password</label>
          <button type="button" onClick={() => setView('FORGOT_PASSWORD')} className="text-xs text-blue-700 font-semibold hover:underline transition-colors duration-300">Forgot?</button>
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 caret-blue-600 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            placeholder="••••••••"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-blue-700 to-blue-600 text-white py-3 rounded-xl font-bold hover:from-blue-800 hover:to-blue-700 transition-all duration-300 shadow-lg shadow-blue-500/20 active:scale-[0.98] mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Verifying...' : 'Sign In'}
      </button>

      <p className="text-center text-sm text-gray-900 pt-4 border-t border-gray-200 mt-4">
        Don't have an account? <button type="button" onClick={() => setView('SIGNUP')} className="text-blue-700 font-bold hover:underline transition-colors duration-300">Sign Up</button>
      </p>
    </form>
  );

  const renderSignup = () => (
    <form onSubmit={handleSignupInit} className="space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-bold text-gray-900">Full Name</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 caret-blue-600 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            placeholder="John Doe"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-bold text-gray-900">Email Address</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 caret-blue-600 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            placeholder="name@example.com"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-bold text-gray-900">Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 caret-blue-600 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            placeholder="Min 8 chars, 1 special/number"
          />
        </div>
      </div>

      <div>
         <label className="flex items-center gap-2 cursor-pointer mb-2">
            <input 
               type="checkbox" 
               checked={showAdminKey} 
               onChange={(e) => setShowAdminKey(e.target.checked)} 
               className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm font-medium text-gray-900">Register as Administrator</span>
         </label>
         {showAdminKey && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
               <input 
                  type="password" 
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="Enter Admin Key (LUMINA_ADMIN)"
                  className="w-full px-4 py-2.5 border border-blue-300 rounded-lg bg-blue-50 text-gray-900 caret-blue-600 placeholder-blue-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
               />
            </div>
         )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-blue-700 to-blue-600 text-white py-3 rounded-xl font-bold hover:from-blue-800 hover:to-blue-700 transition-all duration-300 shadow-lg shadow-blue-500/20 active:scale-[0.98] mt-2 disabled:opacity-70"
      >
        {isLoading ? 'Processing...' : 'Create Account'}
      </button>

      <p className="text-center text-sm text-gray-900 pt-4 border-t border-gray-200 mt-4">
        Already have an account? <button type="button" onClick={() => setView('LOGIN')} className="text-blue-700 font-bold hover:underline transition-colors duration-300">Sign In</button>
      </p>
    </form>
  );

  const renderOtp = () => (
    <form onSubmit={handleVerifyOtp} className="space-y-6 text-center">
      <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-blue-600">
         <MessageSquareCode className="h-8 w-8" />
      </div>
      <div>
         <h3 className="text-gray-900 font-bold text-lg">Verify Email</h3>
         <p className="text-sm text-gray-600 mt-1">We sent a 6-digit code to <span className="font-medium text-gray-900">{email}</span></p>
      </div>

      <div>
        <input 
          type="text" 
          maxLength={6}
          value={otp}
          onChange={(e) => {
             setOtp(e.target.value.replace(/[^0-9]/g, ''));
             setError('');
          }}
          className="w-full text-center text-3xl tracking-[0.5em] font-bold py-3 border-b-2 border-gray-200 bg-transparent text-gray-900 caret-blue-600 placeholder-gray-300 focus:border-blue-600 outline-none transition-colors"
          placeholder="000000"
          autoFocus
        />
      </div>

      <div className="flex flex-col gap-3">
        <button
          type="submit"
          disabled={isLoading || otp.length !== 6}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all duration-300 disabled:opacity-50"
        >
          {isLoading ? 'Verifying...' : 'Verify Code'}
        </button>

        <div className="flex justify-center items-center gap-2 text-sm">
           {timer > 0 ? (
              <span className="text-gray-500 flex items-center gap-1"><Clock className="h-3 w-3" /> Resend code in 00:{timer < 10 ? `0${timer}` : timer}</span>
           ) : (
              <button type="button" onClick={handleResendCode} className="text-blue-600 font-bold hover:underline">
                 Resend Code
              </button>
           )}
        </div>
      </div>

      <button type="button" onClick={() => setView(view === 'OTP_VERIFY' && !isResetFlow ? 'SIGNUP' : 'FORGOT_PASSWORD')} className="text-sm text-gray-500 hover:text-gray-900 transition-colors duration-300 mt-2">Go Back</button>
    </form>
  );

  const renderForgotPassword = () => (
    <form onSubmit={handleForgotPassword} className="space-y-4">
       <p className="text-sm text-gray-900 mb-4">Enter your email address and we'll send you an OTP to reset your password.</p>
       <div className="space-y-1">
        <label className="text-sm font-bold text-gray-900">Email Address</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 caret-blue-600 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
            placeholder="name@example.com"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all duration-300 disabled:opacity-70"
      >
        {isLoading ? 'Sending...' : 'Send OTP Code'}
      </button>
      <button type="button" onClick={() => setView('LOGIN')} className="w-full text-center text-sm text-gray-500 hover:text-gray-900 mt-2 transition-colors duration-300">Back to Login</button>
    </form>
  );

  const renderResetPassword = () => (
     <form onSubmit={handleResetPassword} className="space-y-4">
        <div className="space-y-1">
        <label className="text-sm font-bold text-gray-900">New Password</label>
        <div className="relative">
          <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-900 caret-blue-600 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
            placeholder="New strong password"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all duration-300 disabled:opacity-70"
      >
        {isLoading ? 'Updating...' : 'Update Password'}
      </button>
     </form>
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-blue-950/60 backdrop-blur-sm transition-opacity duration-300">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-gray-100">
        <div className="relative p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors duration-300 bg-white rounded-full p-1 shadow-sm"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="flex items-center gap-3">
             {view !== 'LOGIN' && view !== 'SIGNUP' && (
                <button onClick={() => setView('LOGIN')} className="text-gray-400 hover:text-blue-600 transition-colors duration-300"><ArrowLeft className="h-5 w-5" /></button>
             )}
             <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {view === 'LOGIN' && 'Welcome Back'}
                  {view === 'SIGNUP' && 'Create Account'}
                  {view === 'OTP_VERIFY' && 'Verification'}
                  {view === 'FORGOT_PASSWORD' && 'Reset Password'}
                  {view === 'RESET_PASSWORD' && 'Set New Password'}
                </h2>
             </div>
          </div>
        </div>

        <div className="p-6 text-gray-900">
          {error && (
             <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2 animate-in slide-in-from-top-2 duration-300">
                <span className="w-1 h-4 bg-red-500 rounded-full"></span> {error}
             </div>
          )}
          
          {successMsg && (
             <div className="mb-4 p-3 bg-green-50 text-green-600 text-sm rounded-lg flex items-center gap-2 animate-in slide-in-from-top-2 duration-300">
                <CheckCircle2 className="h-4 w-4" /> {successMsg}
             </div>
          )}

          {view === 'LOGIN' && renderLogin()}
          {view === 'SIGNUP' && renderSignup()}
          {view === 'OTP_VERIFY' && renderOtp()}
          {view === 'FORGOT_PASSWORD' && renderForgotPassword()}
          {view === 'RESET_PASSWORD' && renderResetPassword()}
        </div>
      </div>
    </div>
  );
};
