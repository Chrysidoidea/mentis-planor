"use client";

import Image from "next/image";
import { useState } from "react";
import { auth } from "@/firebase/config";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
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
    } catch (err: unknown) {
      if (err instanceof Error) {
      }
      if (err instanceof Error) {
        console.log(err.message);
      }
    } finally {
      setLoading(false);
    }
  };



  return (
    <section className="grid place-content-center min-h-screen text-gray-200">
      <div className="flex flex-col gap-2 p-6 bg-gray-900/40 backdrop-blur-md border border-gray-700 rounded-xl w-[260px]">
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
          className="bg-gray-600/20 rounded-md w-full px-2 py-1 text-gray-200"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-gray-600/20 rounded-md w-full px-2 py-1 text-gray-200"
        />

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          onClick={handleAuth}
          disabled={loading}
          className="mt-2 py-1 bg-gray-700 hover:bg-gray-600 rounded-md text-white cursor-pointer transition-all duration-200 ease-in-out disabled:opacity-50" 
        >
          {loading ? "Processing..." : isLogin ? "Login" : "Register"}
        </button>

        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-xs text-gray-300 mt-2 cursor-pointer transition-all duration-200 ease-in-out hover:text-gray-200 "
        >
          {isLogin
            ? "Need an account? Register"
            : "Already have an account? Login"}
        </button>

      </div>
    </section>
  );
};
