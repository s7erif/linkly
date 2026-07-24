export interface EmailProvider { send(input: { to: string; subject: string; html: string; text?: string }): Promise<{ providerMessageId: string }>; }
export interface PaymentProvider { createCheckout(input: { orderId: string; amountMinor: number; currency: string }): Promise<{ checkoutUrl: string }>; }
export interface StorageProvider { put(input: { key: string; body: Uint8Array; contentType: string }): Promise<{ key: string; url?: string }>; delete(key: string): Promise<void>; }
export interface AnalyticsProvider { record(input: { event: string; occurredAt: Date; dimensions?: Readonly<Record<string,string>> }): Promise<void>; }
export interface BackgroundJobScheduler { enqueue(input: { name: string; payload: Readonly<Record<string, unknown>>; runAt?: Date }): Promise<{ id: string }>; }
