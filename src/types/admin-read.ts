import type {
  AccessCodeStatus,
  CardStatus,
  CardVisibility,
  CustomerStatus,
} from "./domain";
import type {
  FulfillmentStatus,
  OrderPackage,
  OrderStatus,
  PaymentStatus,
} from "./order";
import type { EditorCardDTO, PublicCardDTO } from "@/dto";

export interface PageResult<T> {
  items: readonly T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
export interface AdminOrderListItem {
  id: string;
  orderNumber: string;
  customerName: string;
  email: string;
  package: OrderPackage;
  quantity: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  createdAt: Date;
  updatedAt: Date;
  planNameSnapshot?: string | null;
  planDescriptionSnapshot?: string | null;
  billingIntervalSnapshot?: import("@/dto/subscription.dto").BillingIntervalDTO | null;
  currency?: string | null;
  planPriceSnapshot?: number | null;
  subtotal?: number | null;
  discount?: number | null;
  tax?: number | null;
  total?: number | null;
}
export interface AdminCustomerListItem {
  id: string;
  displayName: string;
  email: string | null;
  phone: string | null;
  status: CustomerStatus;
  cardCount: number;
  nfcCard: { id: string; activationToken: string; activatedAt: Date | null; status: import("@/types/nfc-card").NfcCardStatus; workspaceSlug: string | null } | null;
  createdAt: Date;
  updatedAt: Date;
}
export interface AdminCardListItem {
  id: string;
  name: string;
  slug: string;
  status: CardStatus;
  visibility: CardVisibility;
  owner: { id: string; displayName: string };
  createdAt: Date;
  updatedAt: Date;
}
export interface AdminDashboardReadModel {
  metrics: {
    pendingOrders: number;
    approvedOrders: number;
    completedOrders: number;
    totalCustomers: number;
    totalCards: number;
    activeCards: number;
    cardsCreatedToday: number;
    totalVisits: number;
    cardsPublished: number;
    activeCustomers: number;
    activeSubscriptions?: number;
    monthlyRevenueMinor?: number;
    revenueMinor?: number;
  };
  recentOrders: readonly AdminOrderListItem[];
  recentCustomers: readonly AdminCustomerListItem[];
  generatedAt: Date;
}
export interface AdminAccessCodeSummary {
  id: string;
  cardId: string;
  version: number;
  status: AccessCodeStatus;
  createdAt: Date;
  lastUsedAt: Date | null;
  expiresAt: Date | null;
  useCount: number;
}
export interface AdminAccessCodeListItem extends AdminAccessCodeSummary { cardName: string; slug: string; customerName: string; }
export interface AdminAccessCodeQuery { search?: string; status?: AccessCodeStatus; page: number; pageSize: number; }
export interface AdminAuditEntry {
  id: string;
  action: string;
  success: boolean;
  actorType: "ADMIN" | "EDITOR" | "SYSTEM";
  createdAt: Date;
}
export interface AdminNotificationSummary {
  channel: "EMAIL" | "SMS" | "WHATSAPP" | "PUSH";
  template: "WELCOME" | "ORDER_APPROVED" | "CARD_READY";
  recipient: string;
  status: "PENDING" | "SENT" | "FAILED";
  provider: string;
  attemptCount: number;
  lastAttemptAt: Date | null;
  sentAt: Date | null;
  failureCode: string | null;
  createdAt: Date;
}
export interface AdminOrderDetail {
  order: AdminOrderListItem & {
    company: string | null;
    phone: string;
    notes: string | null;
    customerId: string | null;
  };
  customer: {
    id: string;
    displayName: string;
    email: string | null;
    phone: string | null;
    status: CustomerStatus;
  } | null;
  cards: ReadonlyArray<{
    id: string;
    name: string;
    slug: string;
    status: CardStatus;
    visibility: CardVisibility;
  }>;
  accessCodes: readonly AdminAccessCodeSummary[];
  notifications: readonly AdminNotificationSummary[];
  approvalHistory: readonly AdminAuditEntry[];
  paymentSubmissions: readonly { id:string; paymentMethod:string; amount:number; currency:string; senderName:string; senderPhone:string; referenceNumber:string; status:string; submittedAt:Date; proof:{ id:string; publicUrl:string|null; contentType:string; fileName:string; originalFilename:string|null; width:number|null; height:number|null; status:string; createdAt:Date; deletedAt:Date|null }|null }[];
}
export interface AdminCustomerDetail {
  customer: {
    id: string;
    displayName: string;
    email: string | null;
    phone: string | null;
    status: CustomerStatus;
    locale: string;
    timezone: string;
    createdAt: Date;
    updatedAt: Date;
  };
  cards: readonly AdminCardListItem[];
  activeCard: AdminCardListItem | null;
  orders: readonly AdminOrderListItem[];
}
export interface AdminCardDetail {
  card: AdminCardListItem & {
    publishedAt: Date | null;
  };
  owner: {
    id: string;
    displayName: string;
    email: string | null;
    phone: string | null;
    status: CustomerStatus;
  };
  profile: {
    fullName: string;
    headline: string | null;
    company: string | null;
    bio: string | null;
    email: string | null;
    phone: string | null;
    website: string | null;
    address: string | null;
    countryCode: string | null;
  } | null;
  appearance: {
    typography: string;
    buttonStyle: string;
    borderRadius: number;
    shadow: string;
    backgroundStyle: string;
  };
  preview: PublicCardDTO;
  order: { id: string; orderNumber: string } | null;
  accessCode: AdminAccessCodeSummary | null;
}
export interface AdminOrderQuery {
  search?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  package?: OrderPackage;
  from?: Date;
  to?: Date;
  page: number;
  pageSize: number;
  sortBy: "createdAt" | "orderNumber" | "customerName" | "status";
  sortDirection: "asc" | "desc";
}
export interface AdminCustomerQuery {
  search?: string;
  status?: "ACTIVE" | "SUSPENDED";
  page: number;
  pageSize: number;
  sortBy: "createdAt" | "displayName" | "status";
  sortDirection: "asc" | "desc";
}
export interface AdminCardQuery {
  search?: string;
  page: number;
  pageSize: number;
  sortBy: "createdAt" | "name" | "status";
  sortDirection: "asc" | "desc";
}

export interface AdminCardDetailSource {
  card: AdminCardDetail["card"];
  owner: AdminCardDetail["owner"];
  profile: AdminCardDetail["profile"];
  editorCard: EditorCardDTO;
  order: AdminCardDetail["order"];
  accessCode: AdminCardDetail["accessCode"];
}
