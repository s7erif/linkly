import "server-only";
import { promisify } from "node:util";
import { randomBytes, scrypt as scryptCallback } from "node:crypto";

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

export type PasswordHash = Uint8Array<ArrayBuffer>;

/**
 * scrypt-based password hashing. Mirrors ActivationService so credentials hashed
 * at order submission are verifiable by the existing customer login path after approval.
 */
export async function hashPassword(password: string): Promise<{ hash: PasswordHash; salt: PasswordHash }> {
  const salt = randomBytes(SALT_LENGTH);
  const hash = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;
  return { salt: new Uint8Array(salt), hash: new Uint8Array(hash) };
}
