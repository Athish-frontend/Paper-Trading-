import React, { useState } from "react";
import { 
  TrendingUp, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight,
  Loader2,
  CheckCircle2,
  Rocket,
  LineChart
} from "lucide-react";

export default function AuthPage({ onLoginSuccess }) {
  const [isActive, setIsActive] = useState(false);
  const [showPassword, setShowPassword] = useState({
    signIn: false,
    signUp: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const togglePassword = (type) => {
    setShowPassword((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const handleSubmit = async (e, type) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.target);
    const email = formData.get("email");
    const password = formData.get("password");
    const username = formData.get("username") || email.split('@')[0];

    try {
      const endpoint = type === "signup" ? "register" : "login";
      const payload = type === "signup" 
        ? { username, email, password }
        : { email, password };

      const response = await fetch(`http://localhost:8000/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Authentication failed");

      setIsLoading(false);
      setIsSuccess(true);

      setTimeout(() => {
        setIsSuccess(false);
        if (onLoginSuccess) {

          onLoginSuccess(type === "signup" ? { name: username, email: email } : data.user);
        }
      }, 1000);
    } catch (err) {
      alert(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-4000"></div>

      <div className="w-full max-w-4xl bg-white/70 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white relative overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        {}
        <div className={`hidden md:flex flex-col justify-center items-center p-12 w-1/2 transition-all duration-700 absolute inset-y-0 ${isActive ? 'translate-x-full bg-blue-600' : 'translate-x-0 bg-blue-600'}`}>
          <div className="relative z-10 text-center text-white space-y-6">
            <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto backdrop-blur-md shadow-xl">
              {isActive ? <Rocket size={40} className="text-white" /> : <LineChart size={40} className="text-white" />}
            </div>
            <h2 className="text-3xl font-light tracking-tight">
              {isActive ? "Welcome Back!" : "Hello, Trader!"}
            </h2>
            <p className="text-blue-100 text-sm font-medium leading-relaxed max-w-[240px] mx-auto opacity-80">
              {isActive 
                ? "Already have an account? Sign in and get back to trading." 
                : "Don't have an account yet? Join us and start your simulation adventure."}
            </p>
            <button 
              onClick={() => setIsActive(!isActive)}
              className="px-8 py-3 bg-white text-blue-600 rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
              {isActive ? "Sign In" : "Sign Up"}
            </button>
          </div>
          {}
          <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
             <div className="absolute top-10 right-10 flex flex-wrap gap-4 rotate-45 scale-150">
                {[...Array(20)].map((_, i) => (
                  <div key={i} className="w-8 h-8 rounded-lg bg-white" />
                ))}
             </div>
          </div>
        </div>

        {}
        <div className={`w-full md:w-1/2 p-8 md:p-16 flex items-center transition-all duration-700 ${isActive ? 'md:translate-x-0' : 'md:translate-x-full'}`}>
          <div className="w-full">
            <form onSubmit={(e) => handleSubmit(e, isActive ? "signup" : "signin")} className="space-y-8 animate-in fade-in duration-700">
               <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
                     <TrendingUp size={16} className="text-white" />
                  </div>
                  <span className="text-slate-900 font-bold tracking-tighter uppercase text-[10px] tracking-[3px]">PaperTrade</span>
               </div>

               <div>
                  <h1 className="text-3xl font-light text-slate-900 tracking-tight mb-2">
                    {isActive ? "Create Account" : "Access Station"}
                  </h1>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                    {isActive ? "Start your simulation journey" : "Sign in to manage your portfolio"}
                  </p>
               </div>

               <div className="space-y-4">
                  {isActive && (
                    <div className="relative group">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Username</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={18} />
                        <input type="text" name="username" placeholder="John Doe" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-6 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50/50 transition-all" />
                      </div>
                    </div>
                  )}

                  <div className="relative group">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={18} />
                      <input type="email" name="email" placeholder="name@company.com" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-6 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50/50 transition-all" />
                    </div>
                  </div>

                  <div className="relative group">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Security Token</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={18} />
                      <input name="password" type={showPassword[isActive ? "signUp" : "signIn"] ? "text" : "password"} placeholder="••••••••" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-14 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50/50 transition-all" />
                      <button 
                        type="button" 
                        onClick={() => togglePassword(isActive ? "signUp" : "signIn")}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
                      >
                        {showPassword[isActive ? "signUp" : "signIn"] ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
               </div>

               <button type="submit" disabled={isLoading} className="w-full py-4 bg-blue-600 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-white shadow-xl shadow-blue-600/20 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                  {isLoading ? (
                    <><Loader2 className="animate-spin" size={16} /> Authenticating</>
                  ) : isSuccess ? (
                    <><CheckCircle2 size={16} /> Welcome Aboard</>
                  ) : (
                    <>{isActive ? "Sign Up" : "Sign In"} <ArrowRight size={16} /></>
                  )}
               </button>

               <div className="flex items-center gap-4 py-2">
                  <div className="h-px bg-slate-100 flex-grow"></div>
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">or</span>
                  <div className="h-px bg-slate-100 flex-grow"></div>
               </div>

               <p className="text-center text-xs font-medium text-slate-400">
                  {isActive ? "Already Have an account?" : "Don't have an account?"}{" "}
                  <button type="button" onClick={() => setIsActive(!isActive)} className="text-blue-600 font-bold hover:underline underline-offset-4 decoration-2">
                    {isActive ? "Sign In" : "Register Now"}
                  </button>
               </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}