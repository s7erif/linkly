"use server";

import type { AuthOptions } from "next-auth";
import { getServerSession } from "next-auth/next";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { customerService } from "@/lib/composition-root";
import { AppError } from "@/lib/errors";

const customerMutationSchema = z.object({
  id: z.string().uuid(),
  displayName: z.string().trim().min(1, "Full name is required").max(160),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  phone: z.string().trim().max(40, "Phone must be 40 characters or fewer").optional(),
  status: z.enum(["ACTIVE", "SUSPENDED"]),
});

export type CustomerMutationInput = z.input<typeof customerMutationSchema>;
export type CustomerMutationResult = {
  ok: boolean;
  message: string;
  customerId?: string;
  fieldErrors?: Partial<Record<"displayName" | "email" | "phone" | "status", string>>;
};

async function requireAdminSession() {
  const session = await getServerSession(authOptions as AuthOptions);
  if (!session?.user?.email) throw new Error("Administrator authentication is required.");
}

function failure(error: unknown): CustomerMutationResult {
  if (error instanceof z.ZodError) {
    const flattened = error.flatten().fieldErrors as Record<string, string[] | undefined>;
    return {
      ok: false,
      message: "Review the highlighted fields and try again.",
      fieldErrors: {
        displayName: flattened.displayName?.[0],
        email: flattened.email?.[0],
        phone: flattened.phone?.[0],
        status: flattened.status?.[0],
      },
    };
  }
  if (error instanceof AppError) return { ok: false, message: error.message };
  return { ok: false, message: "Something went wrong. Please try again." };
}

export async function saveCustomerAction(input: CustomerMutationInput): Promise<CustomerMutationResult> {
  try {
    await requireAdminSession();
    const value = customerMutationSchema.parse(input);
    const customer = await customerService.update(value.id, {
      displayName: value.displayName,
      email: value.email,
      phone: value.phone || null,
      status: value.status,
    });
    revalidatePath("/admin/customers");
    return { ok: true, message: "Customer updated successfully.", customerId: customer.id };
  } catch (error) {
    return failure(error);
  }
}

export async function deleteCustomerAction(id: string): Promise<CustomerMutationResult> {
  try {
    await requireAdminSession();
    const customerId = z.string().uuid().parse(id);
    await customerService.archive(customerId);
    revalidatePath("/admin/customers");
    return { ok: true, message: "Customer deleted successfully.", customerId };
  } catch (error) {
    return failure(error);
  }
}
