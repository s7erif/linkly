"use server";

import type { AuthOptions } from "next-auth";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { adminReadService } from "@/lib/composition-root";
import type { AdminOrderDetail } from "@/types/admin-read";

export type EntityDrawerResult<T> = { ok: true; detail: T } | { ok: false; message: string };

async function isAdministrator() {
  const session = await getServerSession(authOptions as AuthOptions);
  return Boolean(session?.user?.email);
}

export async function loadOrderDrawer(orderId: string): Promise<EntityDrawerResult<AdminOrderDetail>> {
  if (!await isAdministrator()) return { ok: false, message: "Administrator authentication is required." };
  try {
    return { ok: true, detail: await adminReadService.getOrder(orderId) };
  } catch (error) {
    if (process.env.NODE_ENV !== "production") console.error("[admin-drawer] Order load failed", { orderId, error });
    return { ok: false, message: "Order details could not be loaded." };
  }
}

export type CustomerDrawerRecord = {
  id: string;
  displayName: string;
  email: string | null;
  phone: string | null;
  status: string;
  nfcCard: null;
  createdAtLabel: string;
  createdAtValue: string;
  updatedAtLabel: string;
  updatedAtValue: string;
};

export async function loadCustomerDrawer(customerId: string): Promise<EntityDrawerResult<CustomerDrawerRecord>> {
  if (!await isAdministrator()) return { ok: false, message: "Administrator authentication is required." };
  try {
    const { customer } = await adminReadService.getCustomer(customerId);
    return {
      ok: true,
      detail: {
        id: customer.id,
        displayName: customer.displayName,
        email: customer.email,
        phone: customer.phone,
        status: customer.status,
        nfcCard: null,
        createdAtLabel: customer.createdAt.toLocaleString(),
        createdAtValue: customer.createdAt.toISOString(),
        updatedAtLabel: customer.updatedAt.toLocaleString(),
        updatedAtValue: customer.updatedAt.toISOString(),
      },
    };
  } catch (error) {
    if (process.env.NODE_ENV !== "production") console.error("[admin-drawer] Customer load failed", { customerId, error });
    return { ok: false, message: "Customer details could not be loaded." };
  }
}
