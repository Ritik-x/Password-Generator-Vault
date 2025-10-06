"use client";
import PasswordGenerator from "@/components/PasswordGenerator";
import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <section style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>Generate a strong password</h2>
        <p style={{ opacity: 0.8 }}>
          Tune length and character sets. Copy auto-clears in ~15s.
        </p>
        <PasswordGenerator />
      </section>

      <section style={{ display: "flex", gap: 12 }}>
        <Link
          href="/register"
          style={{
            color: "#111",
            background: "#9db6ff",
            padding: "8px 12px",
            borderRadius: 6,
          }}
        >
          Register
        </Link>
        <Link
          href="/login"
          style={{
            color: "#111",
            background: "#9db6ff",
            padding: "8px 12px",
            borderRadius: 6,
          }}
        >
          Login
        </Link>
        <Link
          href="/vault"
          style={{
            color: "#111",
            background: "#9db6ff",
            padding: "8px 12px",
            borderRadius: 6,
          }}
        >
          Open Vault
        </Link>
      </section>
    </main>
  );
}
