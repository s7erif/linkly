import type { LegacyBusinessCardDTO, LegacyUserDTO } from "@/dto";
import { NotFoundError } from "@/lib/errors";
import type { LegacyCardPatchCommand, LegacyCardWriteCommand, LegacyReadRepository, UnitOfWork } from "@/repositories";
import { businessCardCreateSchema, businessCardUpdateSchema } from "@/lib/validation/business-card";
import type { z } from "zod";

export type CreateLegacyCardInput = z.infer<typeof businessCardCreateSchema>;
export type UpdateLegacyCardInput = z.infer<typeof businessCardUpdateSchema>;
export class LegacyCardService {
  constructor(private readonly reads: LegacyReadRepository, private readonly unitOfWork: UnitOfWork) {}
  list(userId: string): Promise<LegacyBusinessCardDTO[]> { return this.reads.listCardsByUser(userId); }
  async get(id: string, userId: string): Promise<LegacyBusinessCardDTO> {
    const card = await this.reads.findCardByIdAndUser(id, userId);
    if (!card) throw new NotFoundError("Card not found");
    return card;
  }
  getByHash(hash: string): Promise<LegacyBusinessCardDTO | null> { return this.reads.findCardByHash(hash); }
  async create(input: CreateLegacyCardInput, userId: string): Promise<LegacyBusinessCardDTO> {
    const data = businessCardCreateSchema.parse(input);
    return this.unitOfWork.execute(async ({ legacy }) => {
      const urlHash = await createUniqueHash((hash) => legacy.cardHashExists(hash));
      const slug = await createUniqueSlug(data.name || "card", (candidate) => legacy.cardSlugExists(candidate));
      return legacy.createCard({ ...cleanCreate(data), userId, urlHash, slug });
    });
  }
  async update(id: string, input: UpdateLegacyCardInput, userId: string): Promise<LegacyBusinessCardDTO> {
    const data = businessCardUpdateSchema.parse(input);
    return this.unitOfWork.execute(async ({ legacy }) => {
      if (!await legacy.findCardByIdAndUser(id, userId)) throw new NotFoundError("Card not found");
      return legacy.updateCard(id, cleanPatch(data));
    });
  }
  async delete(id: string, userId: string): Promise<void> {
    await this.unitOfWork.execute(async ({ legacy }) => {
      if (!await legacy.findCardByIdAndUser(id, userId)) throw new NotFoundError("Card not found");
      await legacy.deleteCard(id);
    });
  }
}
export class LegacyAdminUserService {
  constructor(private readonly reads: LegacyReadRepository, private readonly unitOfWork: UnitOfWork) {}
  async ensure(email: string, name: string): Promise<LegacyUserDTO> {
    const existing = await this.reads.findUserByEmail(email);
    if (existing) return existing;
    return this.unitOfWork.execute(async ({ legacy }) => {
      const concurrent = await legacy.findUserByEmail(email);
      return concurrent ?? legacy.createUser({ email, name });
    });
  }
}
function cleanCreate(data: CreateLegacyCardInput): LegacyCardWriteCommand {
  return {
    name: data.name?.trim() ?? "", title: data.title?.trim() ?? "", company: data.company?.trim() ?? "",
    address: data.address?.trim() || null, phone: data.phone?.trim() || null, email: data.email?.trim() || null,
    website: data.website?.trim() || null, bio: data.bio?.trim() || null, avatar: data.avatar || null,
    backgroundImage: data.backgroundImage || null, templateId: data.templateId || "classic",
    isActive: data.isActive ?? true,
    updateTime: new Date(),
    socialLinks: typeof data.socialLinks === "string" ? data.socialLinks : JSON.stringify(data.socialLinks || {}),
  };
}
function cleanPatch(data: UpdateLegacyCardInput): LegacyCardPatchCommand {
  const command: LegacyCardPatchCommand = {};
  command.updateTime = new Date();
  if (data.name !== undefined) command.name = data.name.trim();
  if (data.title !== undefined) command.title = data.title.trim();
  if (data.company !== undefined) command.company = data.company.trim();
  if (data.address !== undefined) command.address = data.address?.trim() || null;
  if (data.phone !== undefined) command.phone = data.phone?.trim() || null;
  if (data.email !== undefined) command.email = data.email?.trim() || null;
  if (data.website !== undefined) command.website = data.website?.trim() || null;
  if (data.bio !== undefined) command.bio = data.bio?.trim() || null;
  if (data.avatar !== undefined) command.avatar = data.avatar || null;
  if (data.backgroundImage !== undefined) command.backgroundImage = data.backgroundImage || null;
  if (data.templateId !== undefined) command.templateId = data.templateId;
  if (data.isActive !== undefined) command.isActive = data.isActive;
  if (data.socialLinks !== undefined) command.socialLinks = typeof data.socialLinks === "string" ? data.socialLinks : JSON.stringify(data.socialLinks || {});
  return command;
}

async function createUniqueHash(isTaken: (hash: string) => Promise<boolean>): Promise<string> {
  while (true) {
    const hash = Array.from(crypto.getRandomValues(new Uint8Array(8)), (byte) => (byte & 31).toString(32)).join("");
    if (!await isTaken(hash)) return hash;
  }
}
function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "") || "card";
}
async function createUniqueSlug(name: string, isTaken: (slug: string) => Promise<boolean>): Promise<string> {
  const base = slugify(name);
  for (let suffix = 1; ; suffix += 1) {
    const candidate = suffix === 1 ? base : `${base}-${suffix}`;
    if (!await isTaken(candidate)) return candidate;
  }
}
