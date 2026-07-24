import { randomBytes } from "node:crypto";
import { z } from "zod";
import { NotFoundError } from "@/lib/errors";
import type { NfcCardRepository } from "@/repositories/contracts";
import type { NfcCardInventoryQuery, NfcCardStatus } from "@/types/nfc-card";
import { buildActivationUrl } from "@/lib/public-links";

const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const createSchema = z.object({ quantity: z.coerce.number().int().min(1).max(500) });
const statusSchema = z.enum(["AVAILABLE", "RESERVED", "DISABLED", "LOST", "ARCHIVED"]);
function token(length = 8) {
  return Array.from(randomBytes(length), (byte) => alphabet[byte % alphabet.length]).join("");
}

export class NfcCardService {
  constructor(private readonly repository: NfcCardRepository) {}
  list(query: NfcCardInventoryQuery) { return this.repository.list(query); }
  listForExport(query: Pick<NfcCardInventoryQuery, "search" | "status" | "sortDirection">) { return this.repository.listForExport(query); }
  summary() { return this.repository.summary(); }
  inventory(query: NfcCardInventoryQuery) { return this.repository.inventory(query); }
  listForWorkspace(workspaceId: string, query: NfcCardInventoryQuery) { return this.repository.listForWorkspace(z.string().uuid().parse(workspaceId), query); }
  summaryForWorkspace(workspaceId: string) { return this.repository.summaryForWorkspace(z.string().uuid().parse(workspaceId)); }
  activationUrl(activationToken: string) { return buildActivationUrl(activationToken); }

  async create(input: unknown) {
    const { quantity } = createSchema.parse(input);
    const tokens = new Set<string>();
    while (tokens.size < quantity) tokens.add(token());
    return this.repository.createCards([...tokens]);
  }

  async setStatus(id: string, status: unknown) {
    const updated = await this.repository.updateStatus(z.string().uuid().parse(id), statusSchema.parse(status) as NfcCardStatus);
    if (!updated) throw new NotFoundError("NFC card not found");
    return updated;
  }

  async remove(id: string) {
    if (!await this.repository.softDelete(z.string().uuid().parse(id))) throw new NotFoundError("NFC card not found or cannot be archived while activated");
  }

  async setStatusForWorkspace(workspaceId: string, id: string, status: unknown) {
    const updated = await this.repository.updateStatusForWorkspace(z.string().uuid().parse(workspaceId), z.string().uuid().parse(id), statusSchema.parse(status) as NfcCardStatus);
    if (!updated) throw new NotFoundError("NFC card not found");
    return updated;
  }

  async removeForWorkspace(workspaceId: string, id: string) {
    if (!await this.repository.softDeleteForWorkspace(z.string().uuid().parse(workspaceId), z.string().uuid().parse(id))) throw new NotFoundError("NFC card not found or cannot be archived while activated");
  }
}
