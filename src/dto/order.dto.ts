import type { AccessCodeDTO, CardDTO, CustomerDTO } from "@/dto";
import type {
  FulfillmentStatus,
  OrderPackage,
  OrderStatus,
  PaymentStatus,
} from "@/types/order";
export interface OrderDTO {
  id: string;
  orderNumber: string;
  customerName: string;
  company: string | null;
  email: string;
  phone: string;
  package: OrderPackage;
  quantity: number;
  notes: string | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  customerId: string | null;
  planId?: string | null;
  billingInterval?: import("./subscription.dto").BillingIntervalDTO | null;
  planNameSnapshot?: string | null;
  planDescriptionSnapshot?: string | null;
  billingIntervalSnapshot?: import("./subscription.dto").BillingIntervalDTO | null;
  currency?: string | null;
  planPriceSnapshot?: number | null;
  subtotal?: number | null;
  discount?: number | null;
  tax?: number | null;
  total?: number | null;
  cardIds: readonly string[];
  createdAt: Date;
  updatedAt: Date;
}
export interface ApprovedOrderDTO {
  order: OrderDTO;
  customer: CustomerDTO;
  cards: readonly CardDTO[];
  issuedAccessCodes: ReadonlyArray<{ accessCode: AccessCodeDTO; code: string }>;
  subscription?: import("./subscription.dto").SubscriptionDTO;
}
