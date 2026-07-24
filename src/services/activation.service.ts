import { promisify } from "node:util";
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import type { ActivationRepository } from "@/repositories/contracts";
import { createHmacSecretHasher, secureAccessCodeGenerator, secureSessionTokenGenerator, type SecretHasher } from "@/services/credential-security.service";
import { activationLoginSchema, activationRegistrationSchema, activationTokenSchema, activationUsernameSchema, passwordResetRequestSchema, passwordResetSchema, customerLoginSchema, customerRegistrationSchema } from "@/validation/activation";
import { generateAccountUsername } from "@/lib/slug-generator";

const scrypt = promisify(scryptCallback);
const sessionLifetime = 60 * 60 * 24 * 30;
const editorLifetime = 60 * 60 * 8;

export class ActivationService {
  private readonly hasher: SecretHasher;
  constructor(private readonly repository: ActivationRepository, secret: string) { this.hasher = createHmacSecretHasher(secret); }

  validate(activationToken: string) { return this.repository.findCardByActivationToken(activationTokenSchema.parse(activationToken)); }
  async accountForSession(value: string) { return this.repository.findAccountBySessionHash(await secureSessionTokenGenerator.hash(value), new Date()); }
  async emailIsRegistered(email: string) { return Boolean(await this.repository.findAccountByEmail(String(email).trim().toLowerCase())); }
  private async password(password: string, salt = randomBytes(16)) { return { salt: new Uint8Array(salt), hash: new Uint8Array(await scrypt(password, salt, 64) as Buffer) }; }
  private async verifyPassword(password: string, expected: Uint8Array<ArrayBuffer>, salt: Uint8Array<ArrayBuffer>) { const actual = new Uint8Array(await scrypt(password, Buffer.from(salt), 64) as Buffer); return actual.byteLength === expected.byteLength && timingSafeEqual(actual, expected); }

  private async activate(activationToken: string, slug: string, options: { account?: Awaited<ReturnType<ActivationRepository["findAccountByEmail"]>>; registration?: { displayName: string; email: string; phone: string | null; passwordHash: Uint8Array<ArrayBuffer>; passwordSalt: Uint8Array<ArrayBuffer> } }, customerSessionLifetime = sessionLifetime) {
    const editorToken = secureSessionTokenGenerator.generate(), customerToken = secureSessionTokenGenerator.generate(), accessCode = secureAccessCodeGenerator.generate(), now = new Date();
    const result = await this.repository.activateByToken({ activationToken, slug, account: options.account ?? undefined, registration: options.registration, accessCodeHash: await this.hasher.hash(accessCode), editorSessionHash: await secureSessionTokenGenerator.hash(editorToken), editorSessionExpiresAt: new Date(now.getTime() + editorLifetime * 1000), customerSessionHash: await secureSessionTokenGenerator.hash(customerToken), customerSessionExpiresAt: new Date(now.getTime() + customerSessionLifetime * 1000), now });
    return { ...result, editorToken, editorExpiresAt: new Date(now.getTime() + editorLifetime * 1000), customerToken, customerExpiresAt: new Date(now.getTime() + customerSessionLifetime * 1000) };
  }

  async registerAndActivate(input: unknown) {
    const value = activationRegistrationSchema.parse(input);
    const card = await this.validate(value.activationToken);
    if (!card || !["AVAILABLE", "RESERVED"].includes(card.status)) throw new Error("NFC card is unavailable");
    if (await this.repository.findAccountByEmail(value.email)) throw new Error("An account already exists for this email. Sign in instead.");
    const password = await this.password(value.password);
    return this.activate(value.activationToken, value.username, { registration: { displayName: value.firstName + " " + value.lastName, email: value.email, phone: value.phone || null, passwordHash: password.hash, passwordSalt: password.salt } });
  }

  async loginAndActivate(input: unknown) {
    const value = activationLoginSchema.parse(input);
    const card = await this.validate(value.activationToken);
    if (!card || !["AVAILABLE", "RESERVED"].includes(card.status)) throw new Error("NFC card is unavailable");
    const account = await this.repository.findAccountByEmail(value.email);
    if (!account || !await this.verifyPassword(value.password, account.passwordHash, account.passwordSalt)) throw new Error("Email or password is incorrect");
    return this.activate(value.activationToken, value.username, { account }, value.rememberMe ? sessionLifetime : 60 * 60 * 24);
  }

  async registerCustomer(input: unknown) {
    const value = customerRegistrationSchema.parse(input);
    if (await this.repository.findAccountByEmail(value.email)) throw new Error("An account already exists for this email. Sign in instead.");
    const password = await this.password(value.password), token = secureSessionTokenGenerator.generate(), expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const account = await this.repository.registerCustomerAccount({ displayName: value.firstName + " " + value.lastName, email: value.email, passwordHash: password.hash, passwordSalt: password.salt, sessionHash: await secureSessionTokenGenerator.hash(token), sessionExpiresAt: expiresAt });
    return { ...account, token, expiresAt };
  }

  async loginCustomer(input: unknown) {
    const value = customerLoginSchema.parse(input);
    const account = await this.repository.findAccountByEmail(value.email);
    if (!account || !await this.verifyPassword(value.password, account.passwordHash, account.passwordSalt) || !account.workspace) throw new Error("Email or password is incorrect");
    const token = secureSessionTokenGenerator.generate();
    const expiresAt = new Date(Date.now() + (value.rememberMe ? 30 : 1) * 24 * 60 * 60 * 1000);
    await this.repository.createSession(account.id, await secureSessionTokenGenerator.hash(token), expiresAt);
    return { token, expiresAt, workspaceId: account.workspace.id };
  }

  async createDigitalCardForSession(sessionToken: string) {
    const account = await this.accountForSession(sessionToken);
    if (!account?.workspace) throw new Error("Workspace membership is required");
    const editorToken = secureSessionTokenGenerator.generate();
    const accessCode = secureAccessCodeGenerator.generate();
    const editorExpiresAt = new Date(Date.now() + editorLifetime * 1000);
    const card = await this.repository.createDigitalCardForAccount({
      accountId: account.id, customerId: account.customerId, workspaceId: account.workspace.id,
      displayName: account.displayName?.trim() || "OI Customer", email: account.email,
      slug: generateAccountUsername(account.displayName?.trim() || "my-card"),
      accessCodeHash: await this.hasher.hash(accessCode),
      editorSessionHash: await secureSessionTokenGenerator.hash(editorToken), editorSessionExpiresAt: editorExpiresAt,
    });
    return { ...card, editorToken, editorExpiresAt };
  }

  async openCardForSession(sessionToken: string, cardId: string) {
    const account = await this.accountForSession(sessionToken);
    if (!account?.workspace) throw new Error("Workspace membership is required");
    const editorToken = secureSessionTokenGenerator.generate();
    const editorExpiresAt = new Date(Date.now() + editorLifetime * 1000);
    const card = await this.repository.createEditorSessionForAccount({
      accountId: account.id, customerId: account.customerId, workspaceId: account.workspace.id,
      cardId: z.string().uuid().parse(cardId),
      editorSessionHash: await secureSessionTokenGenerator.hash(editorToken), editorSessionExpiresAt: editorExpiresAt,
    });
    return { ...card, editorToken, editorExpiresAt };
  }

  async requestPasswordReset(input: unknown) {
    const value = passwordResetRequestSchema.parse(input);
    const token = secureSessionTokenGenerator.generate();
    const created = await this.repository.createPasswordReset(value.email, await secureSessionTokenGenerator.hash(token), new Date(Date.now() + 60 * 60 * 1000));
    return { created, token, email: value.email };
  }

  async resetCustomerPassword(input: unknown) {
    const value = passwordResetSchema.parse(input);
    const password = await this.password(value.password);
    return this.repository.resetPassword({ tokenHash: await secureSessionTokenGenerator.hash(value.token), passwordHash: password.hash, passwordSalt: password.salt, now: new Date() });
  }

  async logout(sessionToken: string) {
    await this.repository.revokeSession(await secureSessionTokenGenerator.hash(sessionToken), new Date());
  }

  async activateAuthenticated(activationToken: string, usernameValue: string, sessionToken: string) {
    const card = await this.validate(activationToken), account = await this.accountForSession(sessionToken);
    if (!card || !account || !["AVAILABLE", "RESERVED"].includes(card.status)) throw new Error("NFC card or customer session is invalid");
    return this.activate(activationTokenSchema.parse(activationToken), activationUsernameSchema.parse(usernameValue), { account });
  }
}
