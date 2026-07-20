import type { CustomerStatus } from "@/types";

export interface CustomerDTO {
  id: string;
  displayName: string;
  email: string | null;
  phone: string | null;
  status: CustomerStatus;
  locale: string;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}
