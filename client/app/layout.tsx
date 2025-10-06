export const metadata = {
  title: "Password Vault",
  description: "Generate and store passwords securely",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
          background: "#0b1020",
          color: "#e9eefb",
        }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px" }}>
          <header
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <h1 style={{ fontSize: 20, margin: 0 }}>Password Vault</h1>
            <nav style={{ display: "flex", gap: 12 }}>
              <a href="/" style={{ color: "#9db6ff" }}>
                Home
              </a>
              <a href="/vault" style={{ color: "#9db6ff" }}>
                Vault
              </a>
              <a href="/login" style={{ color: "#9db6ff" }}>
                Login
              </a>
              <a href="/register" style={{ color: "#9db6ff" }}>
                Register
              </a>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
