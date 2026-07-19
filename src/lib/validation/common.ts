import { z } from "zod";

export const cuidValidator = z.string().cuid();
export const slugValidator = z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens");
export const urlValidator = z.string().url().max(2000).or(z.literal(""));
export const emailValidator = z.string().email().max(255).or(z.literal(""));
export const phoneValidator = z.string().max(50).or(z.literal(""));
