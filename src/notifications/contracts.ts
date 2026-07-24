export type NotificationChannel = "EMAIL" | "SMS" | "WHATSAPP" | "PUSH";
export type NotificationTemplate = "WELCOME" | "ORDER_APPROVED" | "CARD_READY";
export type NotificationStatus = "PENDING" | "SENT" | "FAILED";

export interface EmailMessage {
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface EmailProvider {
  readonly name: string;
  send(
    message: EmailMessage,
    options: { idempotencyKey: string },
  ): Promise<{ providerMessageId: string }>;
}

export interface NotificationRecord {
  id: string;
  orderId: string;
  customerId: string;
  cardId: string;
  channel: NotificationChannel;
  template: NotificationTemplate;
  recipient: string;
  status: NotificationStatus;
  provider: string;
  providerMessageId: string | null;
  idempotencyKey: string;
  attemptCount: number;
  lastAttemptAt: Date | null;
  sentAt: Date | null;
  failureCode: string | null;
  failureMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNotificationRecord {
  orderId: string;
  customerId: string;
  cardId: string;
  channel: NotificationChannel;
  template: NotificationTemplate;
  recipient: string;
  provider: string;
  idempotencyKey: string;
}

export interface NotificationRepository {
  getOrCreate(input: CreateNotificationRecord): Promise<NotificationRecord>;
  claimFirstAttempt(id: string, attemptedAt: Date): Promise<boolean>;
  markSent(
    id: string,
    providerMessageId: string,
    sentAt: Date,
  ): Promise<NotificationRecord>;
  markFailed(
    id: string,
    failureCode: string,
    failureMessage: string,
  ): Promise<NotificationRecord>;
}
