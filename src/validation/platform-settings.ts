import { z } from "zod";
const optionalUrl=z.union([z.literal(""),z.string().url("Enter a valid URL")]);
const optionalEmail=z.union([z.literal(""),z.string().email("Enter a valid email address")]);
export const platformSettingsSchema=z.object({
 version:z.literal(1),
 general:z.object({platformName:z.string().trim().min(2).max(120),platformLogo:optionalUrl,favicon:optionalUrl,timezone:z.string().trim().min(1).max(80),currency:z.string().trim().length(3).transform(v=>v.toUpperCase()),defaultLanguage:z.string().trim().min(2).max(12)}),
 contact:z.object({supportEmail:optionalEmail,supportPhone:z.string().trim().max(40),whatsapp:z.string().trim().max(40),companyAddress:z.string().trim().max(500)}),
 email:z.object({senderName:z.string().trim().min(2).max(120),senderEmail:optionalEmail,replyToEmail:optionalEmail,provider:z.enum(["RESEND","SMTP"]),providerSettings:z.string().trim().max(2000)}),
 payment:z.object({instapayAccount:z.string().trim().max(160),vodafoneCashNumber:z.string().trim().max(40),bankAccountDetails:z.string().trim().max(2000),instructions:z.string().trim().max(4000),qrImage:optionalUrl,acceptedProofTypes:z.array(z.string().trim().min(1).max(120)).max(20)}),
 uploads:z.object({maxSizeMb:z.number().int().min(1).max(100),allowedFileTypes:z.array(z.string().trim().min(1).max(120)).min(1).max(30)}),
 security:z.object({registrationEnabled:z.boolean(),maintenanceMode:z.boolean(),emailVerificationRequired:z.boolean(),sessionTimeoutMinutes:z.number().int().min(5).max(43200)}),
 seo:z.object({metaTitle:z.string().trim().max(120),metaDescription:z.string().trim().max(320),ogImage:optionalUrl,robots:z.string().trim().max(500)}),
 social:z.object({facebook:optionalUrl,instagram:optionalUrl,linkedin:optionalUrl,x:optionalUrl,youtube:optionalUrl})
});
