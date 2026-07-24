import { z } from "zod";

const RESERVED_USERNAMES = new Set([
  "activate", "admin", "api", "app", "auth", "billing", "card", "cards",
  "dashboard", "help", "login", "logout", "register", "reset-password",
  "settings", "support", "workspace", "www",
]);

export const activationTokenSchema = z.string().trim().toUpperCase().regex(/^[A-Z0-9]{8,10}$/, "The activation token is invalid.");
export const activationUsernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Username must be between 3 and 30 characters.")
  .max(30, "Username must be between 3 and 30 characters.")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Username may contain only lowercase letters, numbers and hyphens.")
  .refine((value) => !RESERVED_USERNAMES.has(value), "This username is reserved.");

export const customerEmailSchema = z.string().trim().toLowerCase().min(1, "Email is required.").email("Enter a valid email address.");
export const customerPasswordSchema = z.string()
  .min(8, "Password must contain at least 8 characters.")
  .max(128, "Password must contain no more than 128 characters.")
  .regex(/[a-z]/, "Password must contain a lowercase letter.")
  .regex(/[A-Z]/, "Password must contain an uppercase letter.")
  .regex(/[0-9]/, "Password must contain a number.");

export const activationRegistrationSchema = z.object({
  activationToken: activationTokenSchema,
  username: activationUsernameSchema,
  displayName: z.string().trim().optional(),
  firstName: z.string().trim().min(1, "First name is required.").max(80),
  lastName: z.string().trim().min(1, "Last name is required.").max(80),
  email: customerEmailSchema,
  phone: z.string().trim().max(40, "Phone must contain no more than 40 characters.").optional(),
  password: customerPasswordSchema,
  confirmPassword: z.string(),
}).refine((value) => value.password === value.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match." });

export const activationLoginSchema = z.object({
  activationToken: activationTokenSchema,
  username: activationUsernameSchema,
  email: customerEmailSchema,
  password: z.string().min(1, "Password is required.").max(128),
  rememberMe: z.boolean().default(false),
});

export const customerRegistrationSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required.").max(80),
  lastName: z.string().trim().min(1, "Last name is required.").max(80),
  email: customerEmailSchema,
  password: customerPasswordSchema,
  confirmPassword: z.string(),
}).refine((value) => value.password === value.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match." });

export const customerLoginSchema = z.object({ email: customerEmailSchema, password: z.string().min(1).max(128), rememberMe: z.boolean().default(false) });
export const passwordResetRequestSchema = z.object({ email: customerEmailSchema });
export const passwordResetSchema = z.object({
  token: z.string().trim().min(32, "The reset link is invalid."),
  password: customerPasswordSchema,
  confirmPassword: z.string(),
}).refine((value) => value.password === value.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match." });
