import{ForbiddenError,NotFoundError,UnauthorizedError}from"@/lib/errors";import type{AutosaveCardProjection,BuilderCardProjection,TransactionRepositories}from"@/repositories";import type{AdminActor}from"@/repositories/platform-management.repository";import type{SessionTokenGenerator}from"@/services/credential-security.service";import{requireAdmin}from"./subscription-platform";
import { requestTag } from "@/lib/request-context";
export interface EditorAuthorizationContext{adminEmail:string}
export type EditorMutationActor={kind:"CUSTOMER"}|{kind:"ADMIN";actor:AdminActor};
export interface AuthorizedEditorAccess<T>{card:T;actor:EditorMutationActor}
export function authorizeEditorAccess(repositories:TransactionRepositories,tokens:SessionTokenGenerator,cardId:string,sessionToken:string,now:Date,authorization:EditorAuthorizationContext|undefined,projection:"AUTOSAVE"|"PUBLISH"):Promise<AuthorizedEditorAccess<AutosaveCardProjection>>;
export function authorizeEditorAccess(repositories:TransactionRepositories,tokens:SessionTokenGenerator,cardId:string,sessionToken:string,now:Date,authorization?:EditorAuthorizationContext,projection?:"BUILDER"):Promise<AuthorizedEditorAccess<BuilderCardProjection>>;
export async function authorizeEditorAccess(repositories:TransactionRepositories,tokens:SessionTokenGenerator,cardId:string,sessionToken:string,now:Date,authorization?:EditorAuthorizationContext,projection:"AUTOSAVE"|"PUBLISH"|"BUILDER"="BUILDER"):Promise<AuthorizedEditorAccess<AutosaveCardProjection|BuilderCardProjection>>{
const t0=performance.now();
let actor:EditorMutationActor;
if(authorization){
if (process.env.NODE_ENV==="development") console.log(`${requestTag()} [auth] admin path`);
const ta=performance.now();
actor={kind:"ADMIN",actor:await requireAdmin(repositories,authorization.adminEmail,"CARD_SUPPORT_EDIT")};
if (process.env.NODE_ENV==="development") console.log(`${requestTag()} [auth] requireAdmin: ${Math.round(performance.now()-ta)}ms`);
}else{
const ta=performance.now();
const hash=await tokens.hash(sessionToken);
if (process.env.NODE_ENV==="development") console.log(`${requestTag()} [auth] tokens.hash: ${Math.round(performance.now()-ta)}ms`);
const tb=performance.now();
const session=await repositories.editorSessions.findByTokenHash(hash);
if (process.env.NODE_ENV==="development") console.log(`${requestTag()} [auth] findSessionByTokenHash: ${Math.round(performance.now()-tb)}ms`);
if(!session||session.status!=="ACTIVE"||session.expiresAt<=now)throw new UnauthorizedError("Editor session is invalid or expired");
if(session.cardId!==cardId)throw new ForbiddenError("Editor session does not grant access to this card");actor={kind:"CUSTOMER"}}
let card:AutosaveCardProjection|BuilderCardProjection|null;
if(projection==="BUILDER"){
const source=await(repositories.cards.findBuilderById?.(cardId,null)??repositories.cards.findEditorForMutationById?.(cardId,null)??repositories.cards.findEditorById(cardId,null));
card=source?"buttonIds"in source?source:{id:source.id,slug:source.slug,status:source.status,sections:source.sections??[],blocks:source.blocks??[],buttonIds:source.buttons.map(button=>button.id),socialLinkIds:source.socialLinks.map(link=>link.id)}:null;
}else{
const source=await((projection==="PUBLISH"?repositories.cards.findPublishById?.(cardId,null):repositories.cards.findAutosaveById?.(cardId,null))??repositories.cards.findEditorForMutationById?.(cardId,null)??repositories.cards.findEditorById(cardId,null));
card=source?{id:source.id,slug:source.slug,status:source.status}:null;
}
if(!card)throw new NotFoundError("Card",cardId);
if(!authorization&&repositories.platform){
const td=performance.now();
const subscription=await repositories.platform.findLatestSubscriptionByCard(cardId);
if (process.env.NODE_ENV==="development") console.log(`${requestTag()} [auth] findLatestSubscriptionByCard: ${Math.round(performance.now()-td)}ms`);
if(subscription&&subscription.status!=="ACTIVE")throw new ForbiddenError(subscription.status==="EXPIRED"?"Subscription expired. Contact support to renew your subscription.":"An active subscription is required to manage this Workspace");
if(subscription?.expiresAt&&subscription.expiresAt<=now)throw new ForbiddenError("Subscription expired. Contact support to renew your subscription.")}
if (process.env.NODE_ENV==="development") console.log(`${requestTag()} [auth] authorizeEditorAccess TOTAL: ${Math.round(performance.now()-t0)}ms`);
return{card,actor}}
/**
 * Lightweight session-only validation — does NOT load the full card.
 * Use for endpoints where the response body is not consumed by the client
 * (optimistic UI already has the latest data) and the heavy findEditorById
 * is wasted work.
 *
 * Returns { cardId } so callers can verify the card exists in a single
 * lightweight DB round-trip if needed.
 */
export async function authorizeEditorSession(
  repositories: TransactionRepositories,
  tokens: SessionTokenGenerator,
  cardId: string,
  sessionToken: string,
  now: Date,
  authorization?: EditorAuthorizationContext,
): Promise<EditorMutationActor> {
  if (authorization) {
    return { kind: "ADMIN", actor: await requireAdmin(repositories, authorization.adminEmail, "CARD_SUPPORT_EDIT") };
  } else {
    const hash = await tokens.hash(sessionToken);
    const session = await repositories.editorSessions.findByTokenHash(hash);
    if (!session || session.status !== "ACTIVE" || session.expiresAt <= now)
      throw new UnauthorizedError("Editor session is invalid or expired");
    if (session.cardId !== cardId)
      throw new ForbiddenError("Editor session does not grant access to this card");
    return { kind: "CUSTOMER" };
  }
}
export async function auditAdminWorkspaceEdit(repositories:TransactionRepositories,actor:EditorMutationActor,cardId:string,operation:string){if(actor.kind!=="ADMIN")return;if(!repositories.platform)throw new Error("Platform repository is not configured");await repositories.platform.audit({actorId:actor.actor.id,action:"ADMIN_WORKSPACE_EDIT",resourceType:"Card",resourceId:cardId,metadata:{operation}})}
