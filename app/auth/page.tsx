"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Mail, Lock, Loader2, LogIn, UserPlus, Chrome } from "lucide-react";

export default function AuthPage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      }
    });
    setLoading(false);
    if (error) {
      setMessage(error.message);
    }
  };
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Signup successful! Check your email for confirmation.");
      setTimeout(() => {
        setIsSignupOpen(false);
      }, 2000);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    if (data.user) {
      localStorage.setItem('chat_user', JSON.stringify(data.user));
      router.push("/");
    }
  };

  const closeModals = () => {
    setIsLoginOpen(false);
    setIsSignupOpen(false);
    setMessage("");
    setEmail("");
    setPassword("");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-8 animate-in fade-in duration-700">
        <h1 className="text-4xl font-bold tracking-tight">Welcome to ChatApp</h1>
        <p className="text-muted-foreground text-lg">
          Connect with others in real-time. Join the conversation today.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button
            size="lg"
            className="w-full sm:w-auto px-8 py-6 text-lg rounded-2xl transition-transform active:scale-95"
            onClick={() => setIsLoginOpen(true)}
          >
            <LogIn className="mr-2 h-5 w-5" />
            Log In
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full sm:w-auto px-8 py-6 text-lg border-2 rounded-2xl transition-transform active:scale-95"
            onClick={() => setIsSignupOpen(true)}
          >
            <UserPlus className="mr-2 h-5 w-5" />
            Sign Up
          </Button>
        </div>
      </div>

      {/* Login Modal */}
      {isLoginOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={closeModals}
          />
          <div className="relative bg-card border border-border w-full max-w-sm rounded-3xl shadow-2xl p-8 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            <button
              onClick={closeModals}
              className="absolute right-6 top-6 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-8 items-center flex flex-col">
              {/* <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-4">
                <LogIn className="h-6 w-6" />
              </div> */}
              <h2 className="text-2xl font-bold">Welcome Back</h2>
              <p className="text-sm text-muted-foreground mt-1">Log in to your account</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium ml-1">Email</label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    className="pl-10 h-10 rounded-xl"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    className="pl-10 h-10 rounded-xl"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {message && (
                <div className={`p-3 rounded-xl text-sm border ${message.includes('successful') ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'bg-red-500/10 border-red-500/30 text-red-500'}`}>
                  {message}
                </div>
              )}

              <Button type="submit" className="w-full h-11 rounded-xl font-semibold" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Log In"}
              </Button>


              <div className="flex align-items-center justify-center">
                Or Continue With
              </div>

              <Button type="button" className="w-full h-11 rounded-xl font-semibold" onClick={handleGoogleLogin}>
                <Chrome className="mr-2 h-5 w-5" />
                Google
              </Button>
              <button type="button" className="w-full h-11 rounded-xl font-semibold" onClick={() => { setIsSignupOpen(true); setIsLoginOpen(false) }}>
                Don't have an account? <span className="text-primary hover:underline hover:cursor-pointer">Sign Up</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Signup Modal */}
      {isSignupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={closeModals}
          />
          <div className="relative bg-card border border-border w-full max-w-sm rounded-3xl shadow-2xl p-8 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            <button
              onClick={closeModals}
              className="absolute right-6 top-6 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-8 items-center flex flex-col">
              {/* <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-4">
                <UserPlus className="h-6 w-6" />
              </div> */}
              <h2 className="text-2xl font-bold">Create Account</h2>
              <p className="text-sm text-muted-foreground mt-1">Join our community today</p>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium ml-1">Email</label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    className="pl-10 h-10 rounded-xl"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    className="pl-10 h-10 rounded-xl"
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              </div>

              {message && (
                <div className={`p-3 rounded-xl text-sm border ${message.includes('successful') ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'bg-red-500/10 border-red-500/30 text-red-500'}`}>
                  {message}
                </div>
              )}
              <Button type="submit" className="w-full h-11 rounded-xl font-semibold" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign Up"}
              </Button>

              <div className="flex align-items-center justify-center">
                Or Continue With
              </div>

              <Button type="button" className="w-full h-11 rounded-xl font-semibold" onClick={handleGoogleLogin}>
                <Chrome className="mr-2 h-5 w-5" />
                Google
              </Button>

              <button type="button" className="w-full h-11 rounded-xl font-semibold" onClick={() => { setIsSignupOpen(false); setIsLoginOpen(true) }}>
                Already have an account? <span className="text-primary hover:underline hover:cursor-pointer">Log In</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
