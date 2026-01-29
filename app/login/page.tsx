"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/user/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("userId", data.accountNo);
      localStorage.setItem("username", data.username);
      router.push("/");
    } else {
      const data = await res.json();
      setError(data.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-rp-base via-rp-surface to-rp-overlay text-soft px-4">
      <div className="w-full max-w-md bg-rp-surface/90 border border-rp-border p-8 rounded-2xl shadow-xl shadow-black/40 backdrop-blur">
        <h1 className="text-2xl font-semibold mb-2 text-center text-soft">
          Sign in
        </h1>
        <p className="mb-8 text-center text-sm text-subtle">
          Continue to your cost-of-living dashboard.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-love/10 border border-love/40 text-love rounded-md text-sm text-center">
              {error}
            </div>
          )}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-soft">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full rounded-md border border-rp-border bg-rp-overlay px-3 py-2 text-sm text-soft placeholder-muted focus:outline-none focus:ring-2 focus:ring-foam focus:border-foam"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-soft">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-rp-border bg-rp-overlay px-3 py-2 text-sm text-soft placeholder-muted focus:outline-none focus:ring-2 focus:ring-foam focus:border-foam"
              required
            />
          </div>

          <Button type="submit" className="w-full">
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
}
