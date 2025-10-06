"use client";
import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import {
  encryptFields,
  decryptFields,
  VaultFields,
  EncryptedVaultFields,
} from "@/lib/vaultCodec";
import { useRouter } from "next/navigation";

interface VaultItemDoc {
  _id: string;
  user: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  username?: string;
  password?: string;
  url?: string;
  notes?: string;
}

export default function VaultPage() {
  const router = useRouter();
  const [master, setMaster] = useState("");
  const [items, setItems] = useState<VaultItemDoc[]>([]);
  const [decrypted, setDecrypted] = useState<Record<string, VaultFields>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const [form, setForm] = useState<VaultFields>({
    title: "",
    username: "",
    password: "",
    url: "",
    notes: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [copyState, setCopyState] = useState<Record<string, boolean>>({});

  const load = async () => {
    try {
      setLoading(true);
      const list = await api.getVault();
      setItems(list as VaultItemDoc[]);
    } catch (err: any) {
      const msg = String(err?.message || "");
      if (msg.includes("Unauthorized") || msg.includes("401")) {
        router.push("/login");
        return;
      }
      setError(err?.message || "Failed to load vault");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Decrypt whenever items or master change
  useEffect(() => {
    (async () => {
      if (!master) {
        setDecrypted({});
        return;
      }
      const map: Record<string, VaultFields> = {};
      for (const it of items) {
        try {
          map[it._id] = await decryptFields(master, {
            title: it.title,
            username: it.username,
            password: it.password,
            url: it.url,
            notes: it.notes,
          } as EncryptedVaultFields);
        } catch {
          // ignore decrypt errors for individual items
        }
      }
      setDecrypted(map);
    })();
  }, [items, master]);

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter((it) => {
      const dec = decrypted[it._id];
      const blob = [dec?.title, dec?.username, dec?.url, dec?.notes]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return blob.includes(q);
    });
  }, [items, decrypted, query]);

  const resetForm = () => {
    setForm({ title: "", username: "", password: "", url: "", notes: "" });
    setEditingId(null);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!master) {
      alert("Enter master password to encrypt");
      return;
    }
    setSaving(true);
    try {
      const payload = await encryptFields(master, form);
      if (editingId) {
        await api.updateVault(editingId, payload);
      } else {
        await api.createVault(payload);
      }
      resetForm();
      await load();
    } catch (err: any) {
      setError(err?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const onEdit = (id: string) => {
    const dec = decrypted[id];
    if (!dec) return;
    setForm({ ...dec });
    setEditingId(id);
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this entry?")) return;
    try {
      await api.deleteVault(id);
      await load();
    } catch (err: any) {
      setError(err?.message || "Delete failed");
    }
  };

  const copy = async (id: string) => {
    const pwd = decrypted[id]?.password || "";
    if (!pwd) return;
    await navigator.clipboard.writeText(pwd);
    setCopyState((s) => ({ ...s, [id]: true }));
    setTimeout(async () => {
      try {
        await navigator.clipboard.writeText("");
      } catch {}
      setCopyState((s) => ({ ...s, [id]: false }));
    }, 15000);
  };

  const logout = async () => {
    try {
      await api.logout();
      router.push("/login");
    } catch {}
  };

  return (
    <main>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <h2 style={{ margin: 0 }}>Your Vault</h2>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="password"
            placeholder="Master password (in-memory only)"
            value={master}
            onChange={(e) => setMaster(e.target.value)}
            style={{
              padding: 8,
              borderRadius: 6,
              border: "1px solid #2a3358",
              background: "#0e1530",
              color: "#e9eefb",
            }}
          />
          <button
            onClick={logout}
            style={{
              padding: "8px 12px",
              borderRadius: 6,
              background: "#9db6ff",
              color: "#111",
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <input
          placeholder="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            width: "100%",
            padding: 8,
            borderRadius: 6,
            border: "1px solid #2a3358",
            background: "#0e1530",
            color: "#e9eefb",
          }}
        />
      </div>

      <section
        style={{
          marginTop: 16,
          border: "1px solid #2a3358",
          borderRadius: 8,
          padding: 12,
        }}
      >
        <h3 style={{ marginTop: 0 }}>{editingId ? "Edit Item" : "Add Item"}</h3>
        <form onSubmit={onSubmit} style={{ display: "grid", gap: 8 }}>
          <input
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
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
            placeholder="Username"
            value={form.username || ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, username: e.target.value }))
            }
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
            value={form.password || ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, password: e.target.value }))
            }
            style={{
              padding: 8,
              borderRadius: 6,
              border: "1px solid #2a3358",
              background: "#0e1530",
              color: "#e9eefb",
            }}
          />
          <input
            placeholder="URL"
            value={form.url || ""}
            onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
            style={{
              padding: 8,
              borderRadius: 6,
              border: "1px solid #2a3358",
              background: "#0e1530",
              color: "#e9eefb",
            }}
          />
          <textarea
            placeholder="Notes"
            value={form.notes || ""}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            rows={3}
            style={{
              padding: 8,
              borderRadius: 6,
              border: "1px solid #2a3358",
              background: "#0e1530",
              color: "#e9eefb",
            }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button
              disabled={saving}
              type="submit"
              style={{
                padding: "8px 12px",
                borderRadius: 6,
                background: "#9db6ff",
                color: "#111",
              }}
            >
              {saving ? "Saving..." : editingId ? "Update" : "Create"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                style={{
                  padding: "8px 12px",
                  borderRadius: 6,
                  background: "#39406b",
                  color: "#e9eefb",
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section style={{ marginTop: 16 }}>
        {loading && <div>Loading...</div>}
        {error && <div style={{ color: "#ff9b9b" }}>{error}</div>}
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "grid",
            gap: 12,
          }}
        >
          {filtered.map((it) => {
            const dec = decrypted[it._id];
            return (
              <li
                key={it._id}
                style={{
                  border: "1px solid #2a3358",
                  borderRadius: 8,
                  padding: 12,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>
                      {dec?.title || "(locked: enter master password)"}
                    </div>
                    <div style={{ opacity: 0.8, fontSize: 12 }}>
                      {dec?.username}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => onEdit(it._id)}
                      style={{
                        padding: "6px 10px",
                        borderRadius: 6,
                        background: "#9db6ff",
                        color: "#111",
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(it._id)}
                      style={{
                        padding: "6px 10px",
                        borderRadius: 6,
                        background: "#ff9b9b",
                        color: "#111",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {dec && (
                  <div style={{ marginTop: 8, display: "grid", gap: 4 }}>
                    {dec.url && (
                      <a
                        href={dec.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: "#9db6ff" }}
                      >
                        {dec.url}
                      </a>
                    )}
                    {dec.notes && (
                      <div style={{ opacity: 0.85 }}>{dec.notes}</div>
                    )}
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <input
                        type="password"
                        readOnly
                        value={dec.password || ""}
                        style={{
                          flex: 1,
                          padding: 6,
                          borderRadius: 6,
                          border: "1px solid #2a3358",
                          background: "#0e1530",
                          color: "#e9eefb",
                        }}
                      />
                      <button
                        onClick={() => copy(it._id)}
                        style={{
                          padding: "6px 10px",
                          borderRadius: 6,
                          background: "#9db6ff",
                          color: "#111",
                        }}
                      >
                        {copyState[it._id]
                          ? "Copied (auto-clear ~15s)"
                          : "Copy"}
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
