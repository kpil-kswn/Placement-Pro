"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { signIn, useSession } from "next-auth/react";
import { usePathname } from "next/navigation"; // Import usePathname

export default function AuthModal({ isOpen, onClose }) {
  const { data: session, status, update } = useSession(); 
  const pathname = usePathname(); 
  const [mounted, setMounted] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // 1. Check if they need a password
  const forcePasswordMode = session?.user?.requiresPassword === true;
  
  // 2. Check if they are logged out AND trying to access a protected page (not the homepage)
  const isProtectedRoute = pathname !== "/";
  const forceLoginMode = status === "unauthenticated" && isProtectedRoute;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // 3. The modal stays open if manually triggered, if needing a password, OR if on a protected route while logged out
  const modalIsOpen = isOpen || forcePasswordMode || forceLoginMode;
  if (!modalIsOpen) return null;

  const handleCredentialsLogin = async (e) => {
    e.preventDefault();
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (res?.ok) {
      if (onClose) onClose(); // Close manually if not forced
    } else {
      alert("Login failed. Check your email and password.");
    }
  };

  const handleGoogleAuth = async () => {
    await signIn("google", { callbackUrl: pathname }); // Return them exactly to the page they were trying to access
  };

  const handleSaveNewPassword = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session.user.email, password }),
      });
      
      if (res.ok) {
        await update({ requiresPassword: false });
        window.location.reload(); 
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save password");
      }
    } catch (err) {
      alert("Something went wrong");
    }
  };

  // Determine if we should hide the close button (Force modes)
  const isForcedMode = forcePasswordMode || forceLoginMode;

  const modalContent = (
    <div className="fixed inset-0 z-[99999] overflow-y-auto font-sans">
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-lg transition-opacity" 
        onClick={isForcedMode ? null : onClose} 
      ></div>

      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-6">
        <div className="relative w-full max-w-md transform overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-8 text-left align-middle shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/5 transition-all z-10">
          
          {!isForcedMode && (
            <button
              onClick={onClose}
              className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-full bg-slate-800/50 text-gray-400 hover:bg-slate-700 hover:text-white transition-all"
            >
              ✕
            </button>
          )}

          {forcePasswordMode ? (
             <form onSubmit={handleSaveNewPassword} className="space-y-4">
                <div className="flex flex-col items-center justify-center mb-6 space-y-2">
                  <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
                    <span className="text-green-400 text-xl">✓</span>
                  </div>
                  <p className="text-green-400 text-sm font-bold tracking-wide uppercase">Google Verified</p>
                  <p className="text-slate-400 text-sm text-center">
                    Hi {session?.user?.name?.split(' ')[0]}! Secure your account by creating a password for future email logins.
                  </p>
                </div>
                
                <input
                  type="password"
                  placeholder="Create a strong password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700/50 text-white px-4 py-3.5 rounded-xl focus:border-blue-500 focus:bg-slate-800 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-500"
                />
                
                <button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] hover:-translate-y-0.5"
                >
                  Save Password & Continue
                </button>
             </form>
          ) : (
            <>
              <div className="mb-8 mt-2 text-center">
                {/* Custom message if they are forced to log in to see a page */}
                {forceLoginMode && (
                   <p className="text-rose-400 text-xs font-bold uppercase tracking-wider mb-3">Authentication Required</p>
                )}
                <h2 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                  {isLogin ? "Welcome Back" : "Create Account"}
                </h2>
                <p className="text-sm text-slate-400 mt-2">
                  {isLogin ? "Enter your details to access your account." : "Join us to start your interview journey."}
                </p>
              </div>

              {isLogin ? (
                <div className="space-y-5">
                  <button
                    onClick={handleGoogleAuth}
                    className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 font-bold py-3.5 px-4 rounded-xl hover:bg-gray-100 transition-all shadow-sm"
                  >
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                    Continue with Google
                  </button>

                  <div className="flex items-center gap-4 my-6">
                    <div className="flex-1 border-t border-slate-700/50"></div>
                    <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">Or email</span>
                    <div className="flex-1 border-t border-slate-700/50"></div>
                  </div>

                  <form onSubmit={handleCredentialsLogin} className="space-y-4">
                    <input
                      type="email"
                      placeholder="Email Address"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-800/50 border border-slate-700/50 text-white px-4 py-3.5 rounded-xl focus:border-blue-500 focus:bg-slate-800 focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-800/50 border border-slate-700/50 text-white px-4 py-3.5 rounded-xl focus:border-blue-500 focus:bg-slate-800 focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                    <button type="submit" className="w-full mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)]">
                      Sign In
                    </button>
                  </form>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
                    <p className="text-blue-300 text-sm text-center font-medium">
                      To ensure high security, all new accounts must be verified with Google first.
                    </p>
                  </div>
                  <button
                    onClick={handleGoogleAuth} 
                    className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 font-bold py-3.5 px-4 rounded-xl hover:bg-gray-100 transition-all shadow-sm"
                  >
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                    Verify with Google
                  </button>
                </div>
              )}

              <div className="mt-8 text-center">
                <p className="text-slate-400 text-sm">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-blue-400 hover:text-blue-300 font-bold transition-colors ml-1"
                  >
                    {isLogin ? "Sign Up" : "Log In"}
                  </button>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}