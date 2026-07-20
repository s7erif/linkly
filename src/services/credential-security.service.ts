import { ConfigurationError } from "@/lib/errors";

const ACCESS_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
export interface SecretHasher { hash(value: string): Promise<Uint8Array<ArrayBuffer>>; }
export interface AccessCodeGenerator { generate(): string; format(code: string): string; }
export interface SessionTokenGenerator { generate(): string; hash(token: string): Promise<Uint8Array<ArrayBuffer>>; }

export function createHmacSecretHasher(secret: string): SecretHasher {
  if (new TextEncoder().encode(secret).byteLength < 32) throw new ConfigurationError("Access-code HMAC key must contain at least 32 bytes");
  return { async hash(value) {
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    return new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value)));
  } };
}
export const secureAccessCodeGenerator: AccessCodeGenerator = {
  generate: () => Array.from(crypto.getRandomValues(new Uint8Array(26)), (byte) => ACCESS_ALPHABET[byte & 31]).join(""),
  format: (code) => `OI-${code.slice(0, 5)}-${code.slice(5, 10)}-${code.slice(10, 15)}-${code.slice(15, 20)}-${code.slice(20)}`,
};
export const secureSessionTokenGenerator: SessionTokenGenerator = {
  generate: () => Array.from(crypto.getRandomValues(new Uint8Array(32)), (byte) => byte.toString(16).padStart(2, "0")).join(""),
  hash: async (token) => new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token))),
};
