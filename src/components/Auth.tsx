import React, { useState } from 'react';
import { useAppContext } from '../store';
import { Mail, Lock, User, Languages, ShieldAlert, ArrowRight, Check } from 'lucide-react';

export default function Auth() {
  const { login, register, language, setLanguage } = useAppContext();
  const [isLogin, setIsLogin] = useState(true);
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Status states
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  // Translations
  const text = {
    en: {
      appName: 'Event Management',
      tagline: 'Streamline assignments, tracks, and communications',
      signInTitle: 'Sign in to your account',
      signUpTitle: 'Create a new account',
      signInSub: 'Welcome back! Enter your details below.',
      signUpSub: 'Join us to start managing volunteers seamlessly.',
      fullName: 'Full Name',
      fullNamePlaceholder: 'e.g. Ghanshyam Patel',
      email: 'Email Address',
      emailPlaceholder: 'you@example.com',
      password: 'Password',
      passwordPlaceholder: '••••••••',
      confirmPassword: 'Confirm Password',
      confirmPasswordPlaceholder: '••••••••',
      signInBtn: 'Sign In',
      signUpBtn: 'Sign Up',
      noAccount: "Don't have an account?",
      alreadyAccount: 'Already have an account?',
      switchSignUp: 'Register now',
      switchSignIn: 'Sign in here',
      pwdMismatch: 'Passwords do not match.',
      pwdTooShort: 'Password must be at least 6 characters.',
      nameRequired: 'Please enter your full name.',
      emailRequired: 'Please enter a valid email address.',
    },
    gu: {
      appName: 'સ્વયંસેવક દળ વ્યવસ્થાપન',
      tagline: 'કાર્યો, યાદી અને વાર્તાલાપ વ્યવસ્થિત કરો',
      signInTitle: 'તમારા ખાતામાં લોગ-ઈન કરો',
      signUpTitle: 'નવું ખાતું બનાવો',
      signInSub: 'આપનું સ્વાગત છે! તમારી વિગતો નીચે દાખલ કરો.',
      signUpSub: 'સ્વયંસેવક વ્યવસ્થાપન શરૂ કરવા માટે જોડાઓ.',
      fullName: 'પૂરેપૂરું નામ',
      fullNamePlaceholder: 'દા.ત. ઘનશ્યામ પટેલ',
      email: 'ઈમેલ એડ્રેસ',
      emailPlaceholder: 'you@example.com',
      password: 'પાસવર્ડ',
      passwordPlaceholder: '••••••••',
      confirmPassword: 'પાસવર્ડની ખાતરી કરો',
      confirmPasswordPlaceholder: '••••••••',
      signInBtn: 'લોગ-ઈન કરો',
      signUpBtn: 'રજીસ્ટર કરો',
      noAccount: 'ખાતું નથી?',
      alreadyAccount: 'પહેલેથી જ ખાતું છે?',
      switchSignUp: 'નવું રજીસ્ટ્રેશન કરો',
      switchSignIn: 'અહીં લોગ-ઈન કરો',
      pwdMismatch: 'પાસવર્ડ મેળ ખાતા નથી.',
      pwdTooShort: 'પાસવર્ડ ઓછામાં ઓછો ૬ અક્ષરનો હોવો જોઈએ.',
      nameRequired: 'કૃપા કરીને તમારું નામ દાખલ કરો.',
      emailRequired: 'કૃપા કરીને સાચો ઈમેલ દાખલ કરો.',
    }
  }[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Client-side validations
    if (!email.trim() || !email.includes('@')) {
      setError(text.emailRequired);
      return;
    }

    if (password.length < 6) {
      setError(text.pwdTooShort);
      return;
    }

    if (!isLogin) {
      if (!name.trim()) {
        setError(text.nameRequired);
        return;
      }
      if (password !== confirmPassword) {
        setError(text.pwdMismatch);
        return;
      }
    }

    setLoading(true);
    // Simulate minor network delay for feedback/polish
    setTimeout(() => {
      try {
        if (isLogin) {
          const res = login(email, password);
          if (!res.success) {
            setError(res.error || 'Authentication failed.');
            setLoading(false);
          }
        } else {
          const res = register(name, email, password);
          if (!res.success) {
            setError(res.error || 'Registration failed.');
            setLoading(false);
          } else {
            setSuccess('Account created successfully!');
          }
        }
      } catch (err) {
        setError('Something went wrong. Please try again.');
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen w-full bg-[#f5f5f0] flex flex-col justify-center items-center p-4 sm:p-6 md:p-8 relative selection:bg-[#5a5a40]/20 selection:text-[#5a5a40]">
      {/* Background visual accents */}
      <div className="absolute top-0 left-0 w-full h-1 bg-[#5a5a40]" />
      
      {/* Language switcher top-right */}
      <div className="absolute top-6 right-6 z-10">
        <button 
          onClick={() => setLanguage(language === 'gu' ? 'en' : 'gu')}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-[#e5e5de] text-[#5a5a40] hover:bg-[#fbfbf9] rounded-2xl font-bold shadow-sm transition-all text-xs uppercase tracking-wider"
        >
          <Languages size={15} />
          {language === 'gu' ? 'English' : 'ગુજરાતી'}
        </button>
      </div>

      <div className="w-full max-w-lg bg-white rounded-[32px] border border-[#e5e5de] shadow-xl overflow-hidden p-6 sm:p-10 transition-all duration-300">
        
        {/* Branding header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#5a5a40]/10 text-[#5a5a40] mb-3">
            <span className="font-serif font-bold text-xl">V</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1a1a1a] tracking-tight">{text.appName}</h1>
          <p className="text-[#8e8e70] text-xs sm:text-sm font-medium mt-1.5">{text.tagline}</p>
        </div>

        {/* Dynamic headings for Sign-In / Sign-Up */}
        <div className="mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-[#1a1a1a]">{isLogin ? text.signInTitle : text.signUpTitle}</h2>
          <p className="text-xs text-[#8e8e70] font-medium mt-1">{isLogin ? text.signInSub : text.signUpSub}</p>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3 animate-in slide-in-from-top-1 duration-200">
            <ShieldAlert size={18} className="shrink-0 mt-0.5" />
            <span className="text-xs sm:text-sm font-medium">{error}</span>
          </div>
        )}

        {/* Success Alert Box */}
        {success && (
          <div className="mb-6 p-4 rounded-2xl bg-green-50 border border-green-200 text-green-700 flex items-start gap-3 animate-in slide-in-from-top-1 duration-200">
            <Check size={18} className="shrink-0 mt-0.5" />
            <span className="text-xs sm:text-sm font-medium">{success}</span>
          </div>
        )}

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Full Name Field (Only visible during Sign-Up) */}
          {!isLogin && (
            <div className="space-y-1.5 animate-in fade-in duration-300">
              <label className="block text-xs font-bold text-[#8e8e70] uppercase tracking-wider">{text.fullName} *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8e8e70]"><User size={18} /></span>
                <input 
                  required
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)}
                  placeholder={text.fullNamePlaceholder}
                  className="w-full pl-11 pr-4 py-3 bg-[#fbfbf9] border border-[#e5e5de] rounded-xl focus:ring-2 focus:ring-[#5a5a40] focus:border-[#5a5a40] outline-none text-sm text-[#1a1a1a] font-medium transition-all"
                />
              </div>
            </div>
          )}

          {/* Email Address */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#8e8e70] uppercase tracking-wider">{text.email} *</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8e8e70]"><Mail size={18} /></span>
              <input 
                required
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                placeholder={text.emailPlaceholder}
                className="w-full pl-11 pr-4 py-3 bg-[#fbfbf9] border border-[#e5e5de] rounded-xl focus:ring-2 focus:ring-[#5a5a40] focus:border-[#5a5a40] outline-none text-sm text-[#1a1a1a] font-medium transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#8e8e70] uppercase tracking-wider">{text.password} *</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8e8e70]"><Lock size={18} /></span>
              <input 
                required
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                placeholder={text.passwordPlaceholder}
                className="w-full pl-11 pr-4 py-3 bg-[#fbfbf9] border border-[#e5e5de] rounded-xl focus:ring-2 focus:ring-[#5a5a40] focus:border-[#5a5a40] outline-none text-sm text-[#1a1a1a] font-medium transition-all"
              />
            </div>
          </div>

          {/* Confirm Password (Only visible during Sign-Up) */}
          {!isLogin && (
            <div className="space-y-1.5 animate-in fade-in duration-300">
              <label className="block text-xs font-bold text-[#8e8e70] uppercase tracking-wider">{text.confirmPassword} *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8e8e70]"><Lock size={18} /></span>
                <input 
                  required
                  type="password" 
                  value={confirmPassword} 
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder={text.confirmPasswordPlaceholder}
                  className="w-full pl-11 pr-4 py-3 bg-[#fbfbf9] border border-[#e5e5de] rounded-xl focus:ring-2 focus:ring-[#5a5a40] focus:border-[#5a5a40] outline-none text-sm text-[#1a1a1a] font-medium transition-all"
                />
              </div>
            </div>
          )}

          {/* Submit Action Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 bg-[#5a5a40] hover:bg-[#4a4a35] text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-md transition-all duration-200 mt-6 active:translate-y-0.5 disabled:opacity-75 text-sm sm:text-base cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{isLogin ? text.signInBtn : text.signUpBtn}</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Toggle Mode Footer */}
        <div className="mt-8 pt-6 border-t border-[#e5e5de] text-center">
          <p className="text-xs sm:text-sm text-[#8e8e70] font-medium">
            {isLogin ? text.noAccount : text.alreadyAccount}{' '}
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setSuccess('');
              }}
              className="text-[#5a5a40] hover:text-[#4a4a35] font-bold underline transition-all ml-1 cursor-pointer"
            >
              {isLogin ? text.switchSignUp : text.switchSignIn}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}
