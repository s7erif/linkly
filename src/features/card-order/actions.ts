"use server";

import { createOrder, getActivationService, paymentService, registrationReadService } from "@/lib/composition-root";
import { AppError } from "@/lib/errors";
import { hashPassword } from "@/services/password-hashing.service";
import { customerEmailSchema, customerPasswordSchema } from "@/validation/activation";
import type { OrderPackage } from "@/types/order";

export type SubmitOrderResult =
  | { ok: true; order: { id: string; orderNumber: string; status: "PENDING" } }
  | { ok: false; message: string };

export type EmailAvailabilityResult = {
  available: boolean;
  reason?: "registered" | "pending";
  message?: string;
};

export async function checkRegistrationEmail(email: string): Promise<EmailAvailabilityResult> {
  const normalized = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) return { available: false, message: "Enter a valid email address." };
  if (await getActivationService().emailIsRegistered(normalized)) return { available: false, reason: "registered", message: "An account already exists for this email." };
  if (await registrationReadService.pendingRegistrationByEmail(normalized)) return { available: false, reason: "pending", message: "A registration for this email is already under review." };
  return { available: true };
}

export async function submitCardOrder(input: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  password: string;
  package: OrderPackage;
  quantity: number;
  notes?: string;
  planId: string;
  billingInterval: import("@/dto/subscription.dto").BillingIntervalDTO;
  paymentMethod: "INSTAPAY" | "MOBILE_WALLET";
  senderName: string;
  senderPhone: string;
  referenceNumber: string;
  paymentProofAssetId: string;
  amount: number;
  currency: string;
}): Promise<SubmitOrderResult> {
  const emailResult = customerEmailSchema.safeParse(input.email);
  if (!emailResult.success) return { ok: false, message: "Enter a valid email address." };
  const email = emailResult.data;

  const passwordResult = customerPasswordSchema.safeParse(input.password);
  if (!passwordResult.success) return { ok: false, message: passwordResult.error.issues[0]?.message ?? "Choose a stronger password." };

  try {
    if (await getActivationService().emailIsRegistered(email)) {
      return { ok: false, message: "An account already exists for this email. Sign in instead." };
    }
    if (await registrationReadService.pendingRegistrationByEmail(email)) {
      return { ok: false, message: "A registration for this email is already under review." };
    }
    const { hash: accountPasswordHash, salt: accountPasswordSalt } = await hashPassword(passwordResult.data);
    const customerName = `${input.firstName.trim()} ${input.lastName.trim()}`;
    const { paymentMethod, senderName, senderPhone, referenceNumber, paymentProofAssetId, amount, currency, firstName: _firstName, lastName: _lastName, password: _password, email: _rawEmail, ...orderInput } = input;
    const order = await createOrder.execute({
      ...orderInput,
      customerName,
      email,
      accountPasswordHash,
      accountPasswordSalt,
    });
    await paymentService.submit({ orderId: order.id, customerId: null, paymentMethod, amount, currency, senderName, senderPhone, referenceNumber, paymentProofAssetId });
    return { ok: true, order: { id: order.id, orderNumber: order.orderNumber, status: "PENDING" } };
  } catch (error) {
    const details = error instanceof AppError && error.details?.fields ? Object.entries(error.details.fields as Record<string, readonly string[]>).map(([field, messages]) => `${field}: ${messages.join(", ")}`).join("; ") : "";
    return { ok: false, message: details ? `${error instanceof AppError ? error.message : "Validation failed"} — ${details}` : error instanceof AppError ? error.message : "Unable to submit your registration." };
  }
}
