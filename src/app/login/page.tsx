"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f2f5f0] px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-[#d9e1d8]">
        <div className="bg-[#2c5a43] p-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2 font-serif">Pig Project</h1>
          <p className="text-[#e4ede6] text-sm">Value Protocols, Rwanda</p>
        </div>
        
        <div className="p-8">
          <h2 className="text-2xl font-semibold text-[#1c2b23] mb-6 text-center">
            Sign In
          </h2>
          
          {error && (
            <div className="bg-[#a63a3a]/10 border border-[#a63a3a] text-[#a63a3a] p-3 rounded-lg text-sm mb-6 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#5d6e64] mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-[#9db0a4]" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-[#d9e1d8] rounded-lg focus:ring-2 focus:ring-[#c9577a] focus:border-[#c9577a] sm:text-sm bg-white text-[#1c2b23]"
                  placeholder="admin@valueprotocols.rw"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#5d6e64] mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-[#9db0a4]" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-[#d9e1d8] rounded-lg focus:ring-2 focus:ring-[#c9577a] focus:border-[#c9577a] sm:text-sm bg-white text-[#1c2b23]"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#2c5a43] hover:bg-[#1c2b23] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#c9577a] transition-colors"
            >
              {loading ? (
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
              ) : null}
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
