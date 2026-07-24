import { describe, expect, it, vi } from "vitest";
import type { EditorCardDTO } from "@/dto";
import { ForbiddenError } from "@/lib/errors";
import type { TransactionRepositories, UnitOfWork } from "@/repositories";
import { ReadWorkspaceCard } from "@/use-cases";

const CARD_ID="0915a8e0-60eb-4cfc-b6dc-adcb01dd249a", OTHER_ID="3e2c0f16-c0e2-40be-97c0-25cbaf324deb", NOW=new Date("2026-07-20T08:00:00.000Z");
const source:EditorCardDTO={id:CARD_ID,customerId:"3d594650-c44b-4f60-8c9a-c0f44f57615d",themeId:null,slug:"sherif-osman-49486b01",name:"Sherif Osman Card",status:"DRAFT",visibility:"PRIVATE",publishedAt:null,accessVersion:1,profile:{fullName:"Sherif Osman",headline:null,company:null,bio:null,email:"sherif@example.com",phone:"01000000000",website:null,address:null,countryCode:null},themeConfig:null,buttons:[],socialLinks:[],createdAt:NOW,updatedAt:NOW};
function dependencies(sessionCardId = CARD_ID) {
  const repositories = {
    editorSessions: {
      findByTokenHash: vi.fn(async () => ({
        id: "ee50b035-0824-4551-a2ea-dfc7a40f62f0",
        cardId: sessionCardId,
        accessCodeId: "32ca1ea0-f889-49ff-aa1a-ab72691492e9",
        status: "ACTIVE" as const,
        expiresAt: new Date("2026-07-20T10:00:00.000Z"),
        lastSeenAt: null,
        createdAt: NOW,
        revokedAt: null,
      })),
    },
    cards: { findEditorById: vi.fn(async () => source) },
  } as unknown as TransactionRepositories;
  const unitOfWork: UnitOfWork = { execute: work => work(repositories) };
  return { repositories, unitOfWork };
}
describe("session-authorized Workspace card read",()=>{
  it("returns the renderer DTO for a Draft/Private card attached to the session",async()=>{const {repositories,unitOfWork}=dependencies();const result=await new ReadWorkspaceCard(unitOfWork,{generate:()=>"",hash:vi.fn(async()=>new Uint8Array([1]))},()=>NOW).execute({cardId:CARD_ID,sessionToken:"a".repeat(64)});expect(repositories.cards.findEditorById).toHaveBeenCalledWith(CARD_ID,null);expect(result).toMatchObject({id:CARD_ID,slug:source.slug,status:"DRAFT",visibility:"PRIVATE"});expect(result).not.toHaveProperty("customerId");expect(result).not.toHaveProperty("accessVersion");});
  it("rejects a token scoped to another card before reading",async()=>{const {repositories,unitOfWork}=dependencies(OTHER_ID);await expect(new ReadWorkspaceCard(unitOfWork,{generate:()=>"",hash:vi.fn(async()=>new Uint8Array([1]))},()=>NOW).execute({cardId:CARD_ID,sessionToken:"a".repeat(64)})).rejects.toBeInstanceOf(ForbiddenError);expect(repositories.cards.findEditorById).not.toHaveBeenCalled();});
});
