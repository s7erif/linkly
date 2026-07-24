import { describe, expect, it, vi } from "vitest";
import type { EmailProvider, NotificationRecord, NotificationRepository } from "@/notifications/contracts";
import { NotificationService } from "@/notifications/notification.service";
import { ResendEmailProvider } from "@/notifications/resend-email.provider";

const now = new Date("2026-07-20T12:00:00.000Z");
vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://app.test");

function notificationRepository(): NotificationRepository & { record: NotificationRecord } {
  const repository = {
    record: {
      id: "notification-id", orderId: "order-id", customerId: "customer-id", cardId: "card-id",
      channel: "EMAIL", template: "WELCOME", recipient: "customer@example.com", status: "PENDING",
      provider: "test", providerMessageId: null, idempotencyKey: "welcome/order-id/card-id", attemptCount: 0,
      lastAttemptAt: null, sentAt: null, failureCode: null, failureMessage: null, createdAt: now, updatedAt: now,
    } as NotificationRecord,
    async getOrCreate() { return repository.record; },
    async claimFirstAttempt() {
      if (repository.record.attemptCount > 0) return false;
      repository.record = { ...repository.record, attemptCount: 1, lastAttemptAt: now };
      return true;
    },
    async markSent(_id: string, providerMessageId: string, sentAt: Date) {
      repository.record = { ...repository.record, status: "SENT", providerMessageId, sentAt };
      return repository.record;
    },
    async markFailed(_id: string, failureCode: string, failureMessage: string) {
      repository.record = { ...repository.record, status: "FAILED", failureCode, failureMessage };
      return repository.record;
    },
  };
  return repository;
}

const input = { orderId:"order-id",customerId:"customer-id",cardId:"card-id",customerName:"Ada Lovelace",recipient:"customer@example.com",slug:"ada-card",accessCode:"OI-SECRET" };
const silentLogger = { debug:vi.fn(),info:vi.fn(),warn:vi.fn(),error:vi.fn() };

describe("Sprint 12 notification platform", () => {
  it("sends a welcome email once and suppresses duplicate approval delivery", async () => {
    const repository=notificationRepository();
    const provider:EmailProvider={name:"test",send:vi.fn().mockResolvedValue({providerMessageId:"email-id"})};
    const service=new NotificationService(repository,provider,silentLogger,{from:"OI <hello@oi.example>"},()=>now);
    await service.sendWelcome(input);
    await service.sendWelcome(input);
    expect(provider.send).toHaveBeenCalledTimes(1);
    expect(repository.record.status).toBe("SENT");
    expect(provider.send).toHaveBeenCalledWith(expect.objectContaining({to:input.recipient,html:expect.stringContaining(input.accessCode)}),{idempotencyKey:"welcome/order-id/card-id"});
  });

  it("records delivery failure without throwing to the approval caller", async () => {
    const repository=notificationRepository();
    const provider:EmailProvider={name:"test",send:vi.fn().mockRejectedValue(new Error("provider unavailable"))};
    const service=new NotificationService(repository,provider,silentLogger,{from:"OI <hello@oi.example>"},()=>now);
    await expect(service.sendWelcome(input)).resolves.toMatchObject({status:"FAILED",failureCode:"DELIVERY_FAILED"});
    expect(repository.record.attemptCount).toBe(1);
  });

  it("uses Resend's API and propagates the deterministic idempotency key", async () => {
    const request=vi.fn().mockResolvedValue(new Response(JSON.stringify({id:"resend-id"}),{status:200,headers:{"Content-Type":"application/json"}}));
    const provider=new ResendEmailProvider("resend-key",request);
    await expect(provider.send({from:"OI <hello@oi.example>",to:"customer@example.com",subject:"Ready",html:"<p>Ready</p>",text:"Ready"},{idempotencyKey:"welcome/order/card"})).resolves.toEqual({providerMessageId:"resend-id"});
    expect(request).toHaveBeenCalledWith("https://api.resend.com/emails",expect.objectContaining({method:"POST",headers:expect.objectContaining({"Idempotency-Key":"welcome/order/card"})}));
  });
});
