import { EncryptedPayload, encryptJSON, decryptJSON } from "@/lib/crypto";

export type VaultFields = {
  title: string;
  username?: string;
  password?: string;
  url?: string;
  notes?: string;
};

export type EncryptedVaultFields = {
  title: string; // stringified EncryptedPayload
  username?: string;
  password?: string;
  url?: string;
  notes?: string;
};

export async function encryptFields(
  master: string,
  fields: VaultFields
): Promise<EncryptedVaultFields> {
  const out: any = {};
  for (const key of Object.keys(fields) as (keyof VaultFields)[]) {
    const val = fields[key] ?? "";
    const payload = await encryptJSON(master, val);
    out[key] = JSON.stringify(payload);
  }
  return out as EncryptedVaultFields;
}

export async function decryptFields(
  master: string,
  encrypted: EncryptedVaultFields
): Promise<VaultFields> {
  const out: any = {};
  for (const key of Object.keys(encrypted) as (keyof EncryptedVaultFields)[]) {
    const raw = encrypted[key];
    if (typeof raw !== "string") {
      out[key] = "";
      continue;
    }
    const payload = JSON.parse(raw) as EncryptedPayload;
    out[key] = await decryptJSON<string>(master, payload);
  }
  return out as VaultFields;
}
