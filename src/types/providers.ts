export interface EmailProvider { send(input: { to: string; subject: string; html: string; text?: string }): Promise<{ providerMessageId: string }>; }
export interface PaymentProvider { createCheckout(input: { orderId: string; amountMinor: number; currency: string }): Promise<{ checkoutUrl: string }>; }

export interface StoragePutResult { key: string; url?: string }

export interface StorageProvider {
  /** Upload to the public bucket. Returns a permanent public URL. */
  put(input: { key: string; body: Uint8Array; contentType: string }): Promise<StoragePutResult>;
  /** Upload to the private bucket. Returns a signed URL (expires). Store only the key for permanent access. */
  putPrivate?(input: { key: string; body: Uint8Array; contentType: string }): Promise<StoragePutResult>;
  /** Generate a fresh signed URL for a private asset. */
  getSignedUrl?(key: string, expiresIn?: number): Promise<string | undefined>;
  delete(key: string): Promise<void>;
}

export interface AnalyticsProvider { record(input: { event: string; occurredAt: Date; dimensions?: Readonly<Record<string,string>> }): Promise<void>; }
export interface BackgroundJobScheduler { enqueue(input: { name: string; payload: Readonly<Record<string, unknown>>; runAt?: Date }): Promise<{ id: string }>; }
