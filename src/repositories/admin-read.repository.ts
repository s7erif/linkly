import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import type {
  AdminCardDetailSource,
  AdminCardListItem,
  AdminCardQuery,
  AdminCustomerDetail,
  AdminCustomerListItem,
  AdminCustomerQuery,
  AdminDashboardReadModel,
  AdminOrderDetail,
  AdminOrderListItem,
  AdminOrderQuery,
  AdminAccessCodeQuery,
  AdminAccessCodeListItem,
  PageResult,
} from "@/types/admin-read";
import type { EditorCardDTO } from "@/dto";

const orderListSelect = {
  id: true,
  orderNumber: true,
  customerName: true,
  email: true,
  package: true,
  quantity: true,
  status: true,
  paymentStatus: true,
  fulfillmentStatus: true,
  createdAt: true,
  updatedAt: true,
  planNameSnapshot: true, planDescriptionSnapshot: true, billingIntervalSnapshot: true, currency: true, planPriceSnapshot: true, subtotal: true, discount: true, tax: true, total: true,
} satisfies Prisma.OrderSelect;
const customerListSelect = {
  id: true,
  displayName: true,
  email: true,
  phone: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { cards: { where: { deletedAt: null } } } },
  nfcCards: { orderBy: { createdAt: "desc" }, take: 1, select: { id: true, activationToken: true, activatedAt: true, status: true, workspace: { select: { primaryCard: { select: { slug: true } } } } } },
} satisfies Prisma.CustomerSelect;
const cardListSelect = {
  id: true,
  name: true,
  slug: true,
  status: true,
  visibility: true,
  createdAt: true,
  updatedAt: true,
  customer: { select: { id: true, displayName: true } },
} satisfies Prisma.CardSelect;
const profileSelect = {
  fullName: true,
  headline: true,
  company: true,
  bio: true,
  email: true,
  phone: true,
  website: true,
  address: true,
  countryCode: true,
} satisfies Prisma.CardProfileSelect;
const editorCardSelect = {
  id: true,
  customerId: true,
  slug: true,
  name: true,
  status: true,
  visibility: true,
  publishedAt: true,
  accessVersion: true,
  createdAt: true,
  updatedAt: true,
  profile: { select: profileSelect },
  themeConfig: true,
  buttons: {
    where: { deletedAt: null },
    orderBy: { position: "asc" as const },
    select: {
      id: true,
      label: true,
      url: true,
      position: true,
      isVisible: true,
      type: true,
      displayMode: true,
      color: true,
      openInNewTab: true,
      analyticsEnabled: true,
    },
  },
  socialLinks: {
    where: { deletedAt: null },
    orderBy: { position: "asc" as const },
    select: {
      id: true,
      platform: true,
      label: true,
      url: true,
      position: true,
      isVisible: true,
    },
  },
} satisfies Prisma.CardSelect;
const accessCodeSelect = {
  id: true,
  cardId: true,
  version: true,
  status: true,
  createdAt: true,
  lastUsedAt: true,
  expiresAt: true,
  useCount: true,
} satisfies Prisma.AccessCodeSelect;
const accessCodeListSelect = { ...accessCodeSelect, card: { select: { name: true, slug: true, customer: { select: { displayName: true } } } } } satisfies Prisma.AccessCodeSelect;
type AccessCodeListRow = Prisma.AccessCodeGetPayload<{ select: typeof accessCodeListSelect }>;
type OrderListRow = Prisma.OrderGetPayload<{ select: typeof orderListSelect }>;
type CustomerListRow = Prisma.CustomerGetPayload<{
  select: typeof customerListSelect;
}>;
type CardListRow = Prisma.CardGetPayload<{ select: typeof cardListSelect }>;
type EditorCardRow = Prisma.CardGetPayload<{ select: typeof editorCardSelect }>;
type AccessCodeRow = Prisma.AccessCodeGetPayload<{
  select: typeof accessCodeSelect;
}>;
const mapOrder = (row: OrderListRow): AdminOrderListItem => ({ ...row });
const mapCustomer = (row: CustomerListRow): AdminCustomerListItem => ({
  id: row.id,
  displayName: row.displayName,
  email: row.email,
  phone: row.phone,
  status: row.status,
  cardCount: row._count.cards,
  nfcCard: row.nfcCards[0] ? { id: row.nfcCards[0].id, activationToken: row.nfcCards[0].activationToken, activatedAt: row.nfcCards[0].activatedAt, status: row.nfcCards[0].status, workspaceSlug: row.nfcCards[0].workspace?.primaryCard?.slug ?? null } : null,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});
const mapCard = (row: CardListRow): AdminCardListItem => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  status: row.status,
  visibility: row.visibility,
  owner: row.customer,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});
const mapAccessCode = (row: AccessCodeRow) => ({ ...row });
const mapAccessCodeList = (row: AccessCodeListRow): AdminAccessCodeListItem => ({ ...mapAccessCode(row), cardName: row.card.name, slug: row.card.slug, customerName: row.card.customer.displayName });
function mapEditorCard(row: EditorCardRow): EditorCardDTO {
  return {
    id: row.id,
    customerId: row.customerId,
    slug: row.slug,
    name: row.name,
    status: row.status,
    visibility: row.visibility,
    publishedAt: row.publishedAt,
    accessVersion: row.accessVersion,
    profile: row.profile ? { ...row.profile } : null,
    themeConfig: row.themeConfig,
    buttons: row.buttons.map((value) => ({ ...value })),
    socialLinks: row.socialLinks.map((value) => ({ ...value })),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
export interface AdminReadRepository {
  dashboard(
    startOfToday: Date,
    generatedAt: Date,
  ): Promise<AdminDashboardReadModel>;
  listOrders(query: AdminOrderQuery): Promise<PageResult<AdminOrderListItem>>;
  getOrder(id: string, orderPackage?: "DIGITAL"): Promise<AdminOrderDetail | null>;
  listCustomers(
    query: AdminCustomerQuery,
  ): Promise<PageResult<AdminCustomerListItem>>;
  getCustomer(id: string): Promise<AdminCustomerDetail | null>;
  listCards(query: AdminCardQuery): Promise<PageResult<AdminCardListItem>>;
  listAccessCodes(query: AdminAccessCodeQuery): Promise<PageResult<AdminAccessCodeListItem>>;
  getCard(id: string): Promise<AdminCardDetailSource | null>;
}
export class PrismaAdminReadRepository implements AdminReadRepository {
  constructor(private readonly db: PrismaClient) {}
  async dashboard(
    startOfToday: Date,
    generatedAt: Date,
  ): Promise<AdminDashboardReadModel> {
    const [
      orderStatusGroups,
      customerStatusGroups,
      totalCards,
      activeCards,
      cardsCreatedToday,
      totalVisits,
      recentOrderRows,
      recentCustomerRows,
      activeSubscriptionRows,
      paidOrderRows,
    ] = await Promise.all([
      this.db.order.groupBy({ by: ["status"], _count: { _all: true } }),
      this.db.customer.groupBy({
        by: ["status"],
        where: { deletedAt: null },
        _count: { _all: true },
      }),
      this.db.card.count({ where: { deletedAt: null } }),
      this.db.card.count({ where: { status: "PUBLISHED", deletedAt: null } }),
      this.db.card.count({
        where: { createdAt: { gte: startOfToday }, deletedAt: null },
      }),
      this.db.analyticsEvent.count({ where: { type: "VISIT" } }),
      this.db.order.findMany({
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: 5,
        select: orderListSelect,
      }),
      this.db.customer.findMany({
        where: { deletedAt: null },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: 5,
        select: customerListSelect,
      }),
      this.db.subscription.findMany({ where: { status: "ACTIVE" }, select: { plan: { select: { monthlyMinor: true } } } }),
      this.db.order.findMany({ where: { paymentStatus: "PAID", total: { not: null } }, select: { total: true } }),
    ]);
    const orderCounts = new Map(orderStatusGroups.map((group) => [group.status, group._count._all]));
    const customerCounts = new Map(customerStatusGroups.map((group) => [group.status, group._count._all]));
    const pendingOrders = orderCounts.get("PENDING") ?? 0;
    const completedOrders = orderCounts.get("COMPLETED") ?? 0;
    const approvedOrders = (orderCounts.get("APPROVED") ?? 0)
      + (orderCounts.get("FULFILLED") ?? 0)
      + completedOrders;
    const totalCustomers = customerStatusGroups.reduce((total, group) => total + group._count._all, 0);
    const activeCustomers = customerCounts.get("ACTIVE") ?? 0;
    return {
      metrics: {
        pendingOrders,
        approvedOrders,
        completedOrders,
        totalCustomers,
        totalCards,
        activeCards,
        cardsCreatedToday,
        totalVisits,
        cardsPublished: activeCards,
        activeCustomers,
        activeSubscriptions: activeSubscriptionRows.length,
        monthlyRevenueMinor: activeSubscriptionRows.reduce((sum, row) => sum + (row.plan.monthlyMinor ?? 0), 0),
        revenueMinor: paidOrderRows.length ? paidOrderRows.reduce((sum, row) => sum + (row.total ?? 0), 0) : activeSubscriptionRows.reduce((sum, row) => sum + (row.plan.monthlyMinor ?? 0), 0),
      },
      recentOrders: recentOrderRows.map(mapOrder),
      recentCustomers: recentCustomerRows.map(mapCustomer),
      generatedAt,
    };
  }
  async listOrders(
    query: AdminOrderQuery,
  ): Promise<PageResult<AdminOrderListItem>> {
    const where: Prisma.OrderWhereInput = {
      ...(query.package ? { package: query.package } : {}),
      ...(query.search
        ? {
            OR: [
              { orderNumber: { contains: query.search, mode: "insensitive" } },
              { customerName: { contains: query.search, mode: "insensitive" } },
              { email: { contains: query.search, mode: "insensitive" } },
              { company: { contains: query.search, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.paymentStatus ? { paymentStatus: query.paymentStatus } : {}),
      ...(query.from || query.to
        ? {
            createdAt: {
              ...(query.from ? { gte: query.from } : {}),
              ...(query.to ? { lt: query.to } : {}),
            },
          }
        : {}),
    };
    const [total, rows] = await Promise.all([
      this.db.order.count({ where }),
      this.db.order.findMany({
        where,
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        orderBy: [{ [query.sortBy]: query.sortDirection }, { id: "desc" }],
        select: orderListSelect,
      }),
    ]);
    return {
      items: rows.map(mapOrder),
      total,
      page: query.page,
      pageSize: query.pageSize,
      totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
    };
  }
  async getOrder(id: string, orderPackage?: "DIGITAL"): Promise<AdminOrderDetail | null> {
    const row = await this.db.order.findFirst({
      where: { id, ...(orderPackage ? { package: orderPackage } : {}) },
      select: {
        ...orderListSelect,
        company: true,
        phone: true,
        notes: true,
        customerId: true,
        customer: {
          select: {
            id: true,
            displayName: true,
            email: true,
            phone: true,
            status: true,
          },
        },
        cards: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            name: true,
            slug: true,
            status: true,
            visibility: true,
            accessCodes: {
              orderBy: { createdAt: "desc" },
              select: accessCodeSelect,
            },
          },
        },
        paymentSubmissions: { orderBy: { submittedAt: "desc" }, select: { id:true, paymentMethod:true, amount:true, currency:true, senderName:true, senderPhone:true, referenceNumber:true, status:true, submittedAt:true, paymentProofAsset: { select: { id:true, publicUrl:true, contentType:true, fileName:true, originalFilename:true, width:true, height:true, status:true, createdAt:true, deletedAt:true } } } },
        notifications: {
          orderBy: { createdAt: "desc" },
          select: {
            channel: true,
            template: true,
            recipient: true,
            status: true,
            provider: true,
            attemptCount: true,
            lastAttemptAt: true,
            sentAt: true,
            failureCode: true,
            createdAt: true,
          },
        },
      },
    });
    if (!row) return null;
    const history = await this.db.auditLog.findMany({
      where: { resourceType: "ORDER", resourceId: id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        action: true,
        success: true,
        actorType: true,
        createdAt: true,
      },
    });
    return {
      order: {
        id: row.id,
        orderNumber: row.orderNumber,
        customerName: row.customerName,
        email: row.email,
        package: row.package,
        quantity: row.quantity,
        status: row.status,
        paymentStatus: row.paymentStatus,
        fulfillmentStatus: row.fulfillmentStatus,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        company: row.company,
        phone: row.phone,
        notes: row.notes,
        customerId: row.customerId,
      },
      customer: row.customer,
      cards: row.cards.map(({ accessCodes: _codes, ...card }) => card),
      accessCodes: row.cards.flatMap((card) =>
        card.accessCodes.map(mapAccessCode),
      ),
      notifications: row.notifications.map((notification) => ({
        ...notification,
      })),
      approvalHistory: history,
      paymentSubmissions: row.paymentSubmissions.map((payment) => ({ ...payment, proof: payment.paymentProofAsset })),
    };
  }
  async listCustomers(
    query: AdminCustomerQuery,
  ): Promise<PageResult<AdminCustomerListItem>> {
    const where: Prisma.CustomerWhereInput = {
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              { displayName: { contains: query.search, mode: "insensitive" } },
              { email: { contains: query.search, mode: "insensitive" } },
              { phone: { contains: query.search, mode: "insensitive" } },
            ],
          }
        : {}),
    };
    const [total, rows] = await Promise.all([
      this.db.customer.count({ where }),
      this.db.customer.findMany({
        where,
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        orderBy: [{ [query.sortBy]: query.sortDirection }, { id: "desc" }],
        select: customerListSelect,
      }),
    ]);
    return {
      items: rows.map(mapCustomer),
      total,
      page: query.page,
      pageSize: query.pageSize,
      totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
    };
  }
  async getCustomer(id: string): Promise<AdminCustomerDetail | null> {
    const row = await this.db.customer.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        displayName: true,
        email: true,
        phone: true,
        status: true,
        locale: true,
        timezone: true,
        createdAt: true,
        updatedAt: true,
        cards: {
          where: { deletedAt: null },
          orderBy: { createdAt: "desc" },
          select: cardListSelect,
        },
        orders: { orderBy: { createdAt: "desc" }, select: orderListSelect },
      },
    });
    if (!row) return null;
    const cards = row.cards.map(mapCard);
    return {
      customer: {
        id: row.id,
        displayName: row.displayName,
        email: row.email,
        phone: row.phone,
        status: row.status,
        locale: row.locale,
        timezone: row.timezone,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      },
      cards,
      activeCard: cards.find((card) => card.status === "PUBLISHED") ?? null,
      orders: row.orders.map(mapOrder),
    };
  }
  async listCards(
    query: AdminCardQuery,
  ): Promise<PageResult<AdminCardListItem>> {
    const where: Prisma.CardWhereInput = {
      deletedAt: null,
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: "insensitive" } },
              { slug: { contains: query.search, mode: "insensitive" } },
              {
                customer: {
                  displayName: { contains: query.search, mode: "insensitive" },
                },
              },
            ],
          }
        : {}),
    };
    const [total, rows] = await Promise.all([
      this.db.card.count({ where }),
      this.db.card.findMany({
        where,
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
        orderBy: [{ [query.sortBy]: query.sortDirection }, { id: "desc" }],
        select: cardListSelect,
      }),
    ]);
    return {
      items: rows.map(mapCard),
      total,
      page: query.page,
      pageSize: query.pageSize,
      totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
    };
  }
  async listAccessCodes(query: AdminAccessCodeQuery): Promise<PageResult<AdminAccessCodeListItem>> {
    const where: Prisma.AccessCodeWhereInput = { ...(query.status ? { status: query.status } : {}), ...(query.search ? { card: { OR: [{ name: { contains: query.search, mode: "insensitive" } }, { slug: { contains: query.search, mode: "insensitive" } }, { customer: { displayName: { contains: query.search, mode: "insensitive" } } }] } } : {}) };
    const [total, rows] = await Promise.all([this.db.accessCode.count({ where }), this.db.accessCode.findMany({ where, skip: (query.page - 1) * query.pageSize, take: query.pageSize, orderBy: [{ createdAt: "desc" }, { id: "desc" }], select: accessCodeListSelect })]);
    return { items: rows.map(mapAccessCodeList), total, page: query.page, pageSize: query.pageSize, totalPages: Math.max(1, Math.ceil(total / query.pageSize)) };
  }
  async getCard(id: string): Promise<AdminCardDetailSource | null> {
    const row = await this.db.card.findFirst({
      where: { id, deletedAt: null },
      select: {
        ...editorCardSelect,
        customer: {
          select: {
            id: true,
            displayName: true,
            email: true,
            phone: true,
            status: true,
          },
        },
        order: { select: { id: true, orderNumber: true } },
        accessCodes: {
          where: { status: "ACTIVE" },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: accessCodeSelect,
        },
      },
    });
    if (!row) return null;
    const editorCard = mapEditorCard(row);
    return {
      card: {
        id: row.id,
        name: row.name,
        slug: row.slug,
        status: row.status,
        visibility: row.visibility,
        owner: { id: row.customer.id, displayName: row.customer.displayName },
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        publishedAt: row.publishedAt,
      },
      owner: row.customer,
      profile: row.profile ? { ...row.profile } : null,
      editorCard,
      order: row.order,
      accessCode: row.accessCodes[0] ? mapAccessCode(row.accessCodes[0]) : null,
    };
  }
}
