"use client";
import { useEffect, useMemo, useState } from "react";

const LOOK_ALIKES = /[O0Il1|]/g; // characters to exclude when enabled

function generatePassword(
  len: number,
  opts: {
    lower: boolean;
    upper: boolean;
    digits: boolean;
    symbols: boolean;
    excludeLookAlikes: boolean;
  }
) {
  let lower = "abcdefghijklmnopqrstuvwxyz";
  let upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let digits = "0123456789";
  let symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";
  if (opts.excludeLookAlikes) {
    lower = lower.replace(LOOK_ALIKES, "");
    upper = upper.replace(LOOK_ALIKES, "");
    digits = digits.replace(LOOK_ALIKES, "");
  }
  let alphabet = "";
  if (opts.lower) alphabet += lower;
  if (opts.upper) alphabet += upper;
  if (opts.digits) alphabet += digits;
  if (opts.symbols) alphabet += symbols;
  if (!alphabet) alphabet = lower + upper + digits; // sensible default
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  let pwd = Array.from(bytes)
    .map((b) => alphabet[b % alphabet.length])
    .join("");
  // Ensure presence of selected categories (simple fixup)
  function ensure(charset: string, s: string) {
    if (!charset) return s;
    if (!s.split("").some((c) => charset.includes(c))) {
      const idx = Math.floor(Math.random() * s.length);
      const repl = charset[Math.floor(Math.random() * charset.length)];
      s = s.slice(0, idx) + repl + s.slice(idx + 1);
    }
    return s;
  }
  pwd = ensure(opts.lower ? lower : "", pwd);
  pwd = ensure(opts.upper ? upper : "", pwd);
  pwd = ensure(opts.digits ? digits : "", pwd);
  pwd = ensure(opts.symbols ? symbols : "", pwd);
  return pwd;
}

export default function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [lower, setLower] = useState(true);
  const [upper, setUpper] = useState(true);
  const [digits, setDigits] = useState(true);
  const [symbols, setSymbols] = useState(false);
  const [excludeLookAlikes, setExclude] = useState(true);
  const [value, setValue] = useState("");
  const [copied, setCopied] = useState(false);
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    setValue(
      generatePassword(length, {
        lower,
        upper,
        digits,
        symbols,
        excludeLookAlikes,
      })
    );
  }, [length, lower, upper, digits, symbols, excludeLookAlikes]);

  const copy = async () => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setCleared(false);
    setTimeout(async () => {
      try {
        await navigator.clipboard.writeText("");
        setCleared(true);
      } catch {}
      setCopied(false);
    }, 15000); // ~15s auto-clear
  };

  return (
    <div style={{ border: "1px solid #2a3358", borderRadius: 8, padding: 16 }}>
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <input
          value={value}
          readOnly
          style={{
            flex: 1,
            padding: 8,
            borderRadius: 6,
            border: "1px solid #2a3358",
            background: "#0e1530",
            color: "#e9eefb",
          }}
        />
        <button
          onClick={copy}
          style={{
            padding: "8px 12px",
            borderRadius: 6,
            background: "#9db6ff",
            color: "#111",
          }}
        >
          Copy
        </button>
      </div>
      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <label>
          Length: {length}
          <input
            type="range"
            min={8}
            max={64}
            value={length}
            onChange={(e) => setLength(parseInt(e.target.value))}
          />
        </label>
        <label>
          <input
            type="checkbox"
            checked={lower}
            onChange={(e) => setLower(e.target.checked)}
          />{" "}
          lower
        </label>
        <label>
          <input
            type="checkbox"
            checked={upper}
            onChange={(e) => setUpper(e.target.checked)}
          />{" "}
          upper
        </label>
        <label>
          <input
            type="checkbox"
            checked={digits}
            onChange={(e) => setDigits(e.target.checked)}
          />{" "}
          digits
        </label>
        <label>
          <input
            type="checkbox"
            checked={symbols}
            onChange={(e) => setSymbols(e.target.checked)}
          />{" "}
          symbols
        </label>
        <label>
          <input
            type="checkbox"
            checked={excludeLookAlikes}
            onChange={(e) => setExclude(e.target.checked)}
          />{" "}
          exclude look-alikes
        </label>
      </div>
      <div style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
        {copied && !cleared && "Copied. Will auto-clear in ~15s."}
        {cleared && "Clipboard cleared."}
      </div>
    </div>
  );
}
