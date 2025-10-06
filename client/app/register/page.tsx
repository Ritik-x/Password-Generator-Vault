"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.register(email, password);
      router.push("/vault");
    } catch (err: any) {
      setError(err?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <h2>Register</h2>
      <form
        onSubmit={onSubmit}
        style={{ display: "grid", gap: 12, maxWidth: 420 }}
      >
        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            padding: 8,
            borderRadius: 6,
            border: "1px solid #2a3358",
            background: "#0e1530",
            color: "#e9eefb",
          }}
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            padding: 8,
            borderRadius: 6,
            border: "1px solid #2a3358",
            background: "#0e1530",
            color: "#e9eefb",
          }}
        />
        <button
          disabled={loading}
          type="submit"
          style={{
            padding: "8px 12px",
            borderRadius: 6,
            background: "#9db6ff",
            color: "#111",
          }}
        >
          {loading ? "Loading..." : "Register"}
        </button>
        {error && <div style={{ color: "#ff9b9b" }}>{error}</div>}
      </form>
    </main>
  );
}
