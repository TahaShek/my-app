"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const router =useRouter()

  const handleSignup = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) setMessage(error.message);
    else setMessage("Signup successful! Check your email for confirmation.");
  };

  const handleLogin = async () => {
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
  
    if (error) {
      setMessage(error.message);
      return;
    }
  
    if (data.user) {
      setMessage(`Logged in! User ID: ${data.user.id}`);
      // Redirect immediately after successful login
      router.push("/");
    }
  };
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMessage("Logged out!");
  };

  return (
    <div style={{ padding: 20, maxWidth: 400, margin: "auto" }}>
      <h1>Supabase Auth</h1>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: "100%", marginBottom: 10, padding: 8 }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ width: "100%", marginBottom: 10, padding: 8 }}
      />
      <button onClick={handleSignup} style={{ width: "100%", marginBottom: 5 }}>
        Sign Up
      </button>
      <button onClick={handleLogin} style={{ width: "100%", marginBottom: 5 }}>
        Log In
      </button>
      <button onClick={handleLogout} style={{ width: "100%" }}>
        Log Out
      </button>
      <p>{message}</p>
    </div>
  );
}
