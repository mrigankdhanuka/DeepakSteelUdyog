
import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, ShieldCheck, ArrowLeft, KeyRound, MessageSquareCode, CheckCircle2 } from 'lucide-react';
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
  
  // Track if we are verifying OTP for registration or password reset
  const [isResetFlow, setIsResetFlow] = useState(false);
  
  const { login, register, forgotPassword, resetPassword } = useStore();

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
    }
  }, [isOpen]);

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
        setError(result.message || 'Login failed');
      }
    } catch (e) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupInit = (e: React.FormEvent) => {
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

    // Move to OTP Verify - In real app, trigger email here too if needed for signup verification
    setIsResetFlow(false);
    setIsLoading(true);
    setTimeout(() => {
       setIsLoading(false);
       setView('OTP_VERIFY');
    }, 800);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (otp.length !== 4) {
        setError("Please enter 4 digit code");
        return;
    }

    // If it's the Reset Flow, we move to the RESET_PASSWORD screen after collecting OTP
    // We don't verify against backend here to save a round trip (verify in final submit), 
    // or we could verify here. Let's move to next step.
    if (isResetFlow) {
        setView('RESET_PASSWORD');
        return;
    }
    
    // Registration Flow (Using mock OTP 1234 for signup demo)
    if (otp === '1234') {
       setIsLoading(true);
       const role = showAdminKey ? UserRole.ADMIN : UserRole.CUSTOMER;
       const result = await register(name, email, password, role, adminKey);
       setIsLoading(false);
       
       if (result.success) {
          onClose();
       } else {
          setError(result.message || 'Registration failed');
          setView('SIGNUP'); // Go back to fix
       }
    } else {
       setError("Invalid OTP for registration. Try 1234");
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
        <label className="text-sm font-medium text-gray-700">Email Address</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all duration-300"
            placeholder="name@example.com"
          />
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-gray-700">Password</label>
          <button type="button" onClick={() => setView('FORGOT_PASSWORD')} className="text-xs text-blue-600 hover:underline transition-colors duration-300">Forgot?</button>
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all duration-300"
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

      <p className="text-center text-sm text-gray-600 pt-4 border-t border-gray-100 mt-4">
        Don't have an account? <button type="button" onClick={() => setView('SIGNUP')} className="text-blue-600 font-bold hover:underline transition-colors duration-300">Sign Up</button>
      </p>
    </form>
  );

  const renderSignup = () => (
    <form onSubmit={handleSignupInit} className="space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Full Name</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all duration-300"
            placeholder="John Doe"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Email Address</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all duration-300"
            placeholder="name@example.com"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all duration-300"
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
            <span className="text-sm text-gray-600">Register as Administrator</span>
         </label>
         {showAdminKey && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
               <input 
                  type="password" 
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="Enter Admin Key (LUMINA_ADMIN)"
                  className="w-full px-4 py-2.5 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50 text-sm transition-all duration-300"
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

      <p className="text-center text-sm text-gray-600 pt-4 border-t border-gray-100 mt-4">
        Already have an account? <button type="button" onClick={() => setView('LOGIN')} className="text-blue-600 font-bold hover:underline transition-colors duration-300">Sign In</button>
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
         <p className="text-sm text-gray-500 mt-1">We sent a 4-digit code to <span className="font-medium text-gray-900">{email}</span></p>
         {!isResetFlow && <p className="text-xs text-blue-500 mt-2">(Hint: Use 1234 for signup demo)</p>}
      </div>

      <div>
        <input 
          type="text" 
          maxLength={4}
          value={otp}
          onChange={(e) => {
             setOtp(e.target.value.replace(/[^0-9]/g, ''));
             setError('');
          }}
          className="w-full text-center text-3xl tracking-[1em] font-bold py-3 border-b-2 border-gray-200 focus:border-blue-600 outline-none transition-colors duration-300"
          placeholder="0000"
          autoFocus
        />
      </div>

      <button
        type="submit"
        disabled={isLoading || otp.length !== 4}
        className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all duration-300 disabled:opacity-50"
      >
        {isLoading ? 'Verifying...' : 'Verify Code'}
      </button>

      <button type="button" onClick={() => setView(view === 'OTP_VERIFY' && !isResetFlow ? 'SIGNUP' : 'FORGOT_PASSWORD')} className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-300">Go Back</button>
    </form>
  );

  const renderForgotPassword = () => (
    <form onSubmit={handleForgotPassword} className="space-y-4">
       <p className="text-sm text-gray-500 mb-4">Enter your email address and we'll send you an OTP to reset your password.</p>
       <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">Email Address</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all duration-300"
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
      <button type="button" onClick={() => setView('LOGIN')} className="w-full text-center text-sm text-gray-500 hover:text-gray-700 mt-2 transition-colors duration-300">Back to Login</button>
    </form>
  );

  const renderResetPassword = () => (
     <form onSubmit={handleResetPassword} className="space-y-4">
        <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">New Password</label>
        <div className="relative">
          <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all duration-300"
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

        <div className="p-6">
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
