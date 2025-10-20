"use client";

import Image from "next/image";
import { useState } from "react";
import { auth } from "@/firebase/config";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

export const Authenticator = () => {
  const [isLogin, setIsLogin] = useState<boolean>(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async () => {
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already in use.");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email format.");
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password.");
      } else if (err.code === "auth/user-not-found") {
        setError("No user found with this email.");
      } else {
        setError("Authentication failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <section className="grid place-content-center min-h-screen text-cyan-100">
      <div className="flex flex-col gap-2 p-6 bg-black/40 backdrop-blur-md border border-cyan-700 rounded-xl w-[260px]">
        <h2 className="text-center font-bold text-xl mb-2">
          {isLogin ? "Login" : "Register"}
        </h2>

        <Image
          src={isLogin ? "/image2.jpeg" : "/image.png"}
          width={150}
          height={150}
          alt="Auth illustration"
          className="mx-auto rounded-lg"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-cyan-200 rounded-md w-full px-2 py-1 text-black"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-cyan-200 rounded-md w-full px-2 py-1 text-black"
        />

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          onClick={handleAuth}
          disabled={loading}
          className="mt-2 py-1 bg-cyan-700 hover:bg-cyan-600 rounded-md text-white disabled:opacity-50"
        >
          {loading ? "Processing..." : isLogin ? "Login" : "Register"}
        </button>

        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-xs text-cyan-300 mt-2 hover:underline"
        >
          {isLogin
            ? "Need an account? Register"
            : "Already have an account? Login"}
        </button>

        <button
          onClick={handleLogout}
          className="text-xs text-gray-400 mt-3 hover:text-red-400"
        >
          Log out
        </button>
      </div>
    </section>
  );
};