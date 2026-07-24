import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import type { BillingIntervalDTO, PlanDTO, PlanFeatureDTO, PlanLimitsDTO, SubscriptionDTO, SubscriptionStatusDTO } from "@/dto/subscription.dto";
import type { PlatformSettings } from "@/types/platform-settings";

export type AdminPermission = "CARD_MANAGE"|"CARD_SUPPORT_EDIT"|"ACCESS_CODE_MANAGE"|"PLAN_MANAGE"|"SUBSCRIPTION_MANAGE"|"ORDER_APPROVE"|"AUDIT_READ";
export type AdminActor = { id:string; email:string; roles:readonly string[] };
export type PlanWrite = { key:string; name:string; description?:string|null; currency:string; monthlyMinor?:number|null; quarterlyMinor?:number|null; yearlyMinor?:number|null; active:boolean; popular:boolean; badge?:string|null; limits:PlanLimitsDTO; sortOrder:number; features:readonly PlanFeatureDTO[] };
export type SubscriptionWrite = { customerId:string; planId:string; status:SubscriptionStatusDTO; billingInterval:BillingIntervalDTO; currentPeriodStart:Date; currentPeriodEnd:Date };
export type SubscriptionListCriteria = { status?:SubscriptionStatusDTO; expiresFrom?:Date; expiresTo?:Date; workspaceId?:string };
export type SubscriptionManagementReadModel = { subscriptions: readonly SubscriptionDTO[]; plans: readonly PlanDTO[] };
export interface PlatformManagementRepository {
  findAdminByEmail(email:string):Promise<AdminActor|null>;
  ensureAdminUser(email:string,name:string):Promise<AdminActor>;
  ensureBootstrapRole(adminUserId:string):Promise<void>;
  listPlans(activeOnly:boolean):Promise<readonly PlanDTO[]>;
  findPlan(id:string):Promise<PlanDTO|null>;
  savePlan(id:string|undefined,input:PlanWrite):Promise<PlanDTO>;
  duplicatePlan(id:string):Promise<PlanDTO>;
  archivePlan(id:string):Promise<PlanDTO>;
  setPlanActive(id:string,active:boolean):Promise<PlanDTO>;
  listSubscriptions(criteria?:SubscriptionListCriteria):Promise<readonly SubscriptionDTO[]>;
  listSubscriptionsWithPlans():Promise<SubscriptionManagementReadModel>;
  findSubscription(id:string):Promise<SubscriptionDTO|null>;
  findActiveSubscriptionByCustomer(customerId:string):Promise<SubscriptionDTO|null>;
  findActiveSubscriptionByCard(cardId:string):Promise<SubscriptionDTO|null>;
  findLatestSubscriptionByCard(cardId:string):Promise<SubscriptionDTO|null>;
  createSubscription(input:SubscriptionWrite):Promise<SubscriptionDTO>;
  updateSubscription(id:string,input:{status?:SubscriptionStatusDTO;billingInterval?:BillingIntervalDTO;startsAt?:Date|null;expiresAt?:Date|null;activatedAt?:Date|null;expiredAt?:Date|null;currentPeriodStart?:Date;currentPeriodEnd?:Date;canceledAt?:Date|null;cancelledAt?:Date|null;suspendedAt?:Date|null;renewedAt?:Date|null}):Promise<SubscriptionDTO>;
  audit(input:{actorId?:string;workspaceId?:string;action:string;resourceType:string;resourceId?:string;metadata?:Record<string,unknown>}):Promise<void>;
  getPlatformSettings():Promise<PlatformSettings|null>;
  savePlatformSettings(settings:PlatformSettings):Promise<PlatformSettings>;
}
const planSelect={id:true,key:true,name:true,description:true,priceMinor:true,intervalMonths:true,currency:true,monthlyMinor:true,quarterlyMinor:true,yearlyMinor:true,isActive:true,isPopular:true,badge:true,limits:true,sortOrder:true,archivedAt:true,createdAt:true,updatedAt:true,features:{orderBy:{key:"asc" as const},select:{key:true,enabled:true,limitValue:true}}} satisfies Prisma.PlanSelect;
const subscriptionBaseSelect={id:true,workspaceId:true,customerId:true,planId:true,status:true,billingInterval:true,startsAt:true,expiresAt:true,activatedAt:true,expiredAt:true,currentPeriodStart:true,currentPeriodEnd:true,canceledAt:true,cancelledAt:true,suspendedAt:true,renewedAt:true,createdAt:true,updatedAt:true,customer:{select:{displayName:true,email:true}}} satisfies Prisma.SubscriptionSelect;
const subscriptionSelect={id:true,workspaceId:true,customerId:true,status:true,billingInterval:true,startsAt:true,expiresAt:true,activatedAt:true,expiredAt:true,currentPeriodStart:true,currentPeriodEnd:true,canceledAt:true,cancelledAt:true,suspendedAt:true,renewedAt:true,createdAt:true,updatedAt:true,customer:{select:{displayName:true,email:true}},plan:{select:planSelect}} satisfies Prisma.SubscriptionSelect;
type Db=PrismaClient|Prisma.TransactionClient; type PlanRow=Prisma.PlanGetPayload<{select:typeof planSelect}>; type SubRow=Prisma.SubscriptionGetPayload<{select:typeof subscriptionSelect}>;
const mapPlan=(r:PlanRow):PlanDTO=>({...r,active:r.isActive,popular:r.isPopular,limits:r.limits as PlanLimitsDTO,features:r.features.map(x=>({...x}))});
const mapSub=(r:SubRow):SubscriptionDTO=>{const {customer,...rest}=r;return{...rest,customerName:customer.displayName,customerEmail:customer.email,plan:mapPlan(r.plan)}};
export class PrismaPlatformManagementRepository implements PlatformManagementRepository {
 constructor(private readonly db:Db){}
 async findAdminByEmail(email:string){const row=await this.db.adminUser.findFirst({where:{email,isActive:true,deletedAt:null},select:{id:true,email:true,roles:{select:{role:{select:{key:true}}}}}});return row?{id:row.id,email:row.email,roles:row.roles.map(x=>x.role.key)}:null}
 async ensureAdminUser(email:string,name:string){const row=await this.db.adminUser.upsert({where:{email},create:{email,name,isActive:true},update:{name,isActive:true,deletedAt:null},select:{id:true,email:true,roles:{select:{role:{select:{key:true}}}}}});return{id:row.id,email:row.email,roles:row.roles.map(x=>x.role.key)}}
 async ensureBootstrapRole(adminUserId:string){const role=await this.db.adminRole.upsert({where:{key:"SUPER_ADMIN"},create:{key:"SUPER_ADMIN",name:"Super Admin"},update:{},select:{id:true}});await this.db.adminUserRole.upsert({where:{adminUserId_roleId:{adminUserId,roleId:role.id}},create:{adminUserId,roleId:role.id},update:{}})}
 async listPlans(activeOnly:boolean){return (await this.db.plan.findMany({where:activeOnly?{isActive:true,archivedAt:null}:undefined,orderBy:[{sortOrder:"asc"},{name:"asc"}],select:planSelect})).map(mapPlan)}
 async findPlan(id:string){const r=await this.db.plan.findUnique({where:{id},select:planSelect});return r?mapPlan(r):null}
 async savePlan(id:string|undefined,input:PlanWrite){const price=input.monthlyMinor??input.yearlyMinor??0;const data={key:input.key,name:input.name,description:input.description??null,currency:input.currency,monthlyMinor:input.monthlyMinor??null,quarterlyMinor:input.quarterlyMinor??null,yearlyMinor:input.yearlyMinor??null,priceMinor:price,intervalMonths:1,isActive:input.active,isPopular:input.popular,badge:input.badge??null,limits:input.limits as Prisma.InputJsonValue,sortOrder:input.sortOrder,archivedAt:null};if(input.popular)await this.db.plan.updateMany({where:{id:id?{not:id}:undefined,isPopular:true},data:{isPopular:false}});const r=id?await this.db.plan.update({where:{id},data:{...data,features:{deleteMany:{},create:input.features.map(f=>({...f}))}},select:planSelect}):await this.db.plan.create({data:{...data,features:{create:input.features.map(f=>({...f}))}},select:planSelect});return mapPlan(r)}
 async duplicatePlan(id:string){const source=await this.db.plan.findUniqueOrThrow({where:{id},select:planSelect});const last=await this.db.plan.aggregate({_max:{sortOrder:true}});return mapPlan(await this.db.plan.create({data:{key:source.key+"-copy-"+Date.now().toString(36),name:source.name+" Copy",description:source.description,priceMinor:source.priceMinor,currency:source.currency,intervalMonths:source.intervalMonths,monthlyMinor:source.monthlyMinor,quarterlyMinor:source.quarterlyMinor,yearlyMinor:source.yearlyMinor,isActive:false,isPopular:false,badge:source.badge,limits:source.limits as Prisma.InputJsonValue,sortOrder:(last._max.sortOrder??-1)+1,features:{create:source.features.map(({key,enabled,limitValue})=>({key,enabled,limitValue}))}},select:planSelect}))}
 async archivePlan(id:string){return mapPlan(await this.db.plan.update({where:{id},data:{isActive:false,isPopular:false,archivedAt:new Date()},select:planSelect}))}
 async setPlanActive(id:string,active:boolean){return mapPlan(await this.db.plan.update({where:{id},data:{isActive:active,archivedAt:active?null:undefined},select:planSelect}))}
 async listSubscriptions(criteria:SubscriptionListCriteria={}){return (await this.db.subscription.findMany({where:{...(criteria.status?{status:criteria.status}:{}),...(criteria.workspaceId?{workspaceId:criteria.workspaceId}:{}),...((criteria.expiresFrom||criteria.expiresTo)?{expiresAt:{...(criteria.expiresFrom?{gte:criteria.expiresFrom}:{}),...(criteria.expiresTo?{lte:criteria.expiresTo}:{})}}:{})},orderBy:[{expiresAt:"asc"},{createdAt:"desc"}],select:subscriptionSelect})).map(mapSub)}
 async listSubscriptionsWithPlans(){const [rows,plans]=await Promise.all([this.db.subscription.findMany({orderBy:{createdAt:"desc"},select:subscriptionBaseSelect}),this.listPlans(false)]);const plansById=new Map(plans.map(plan=>[plan.id,plan]));return{plans,subscriptions:rows.map(row=>{const plan=plansById.get(row.planId);if(!plan)throw new Error(`Subscription ${row.id} references missing plan ${row.planId}`);const {planId:_,customer,...subscription}=row;return{...subscription,customerName:customer.displayName,customerEmail:customer.email,plan}})}}
 async findSubscription(id:string){const r=await this.db.subscription.findUnique({where:{id},select:subscriptionSelect});return r?mapSub(r):null}
 async findActiveSubscriptionByCustomer(customerId:string){const r=await this.db.subscription.findFirst({where:{customerId,status:{in:["ACTIVE","TRIALING","PAUSED"]}},orderBy:{createdAt:"desc"},select:subscriptionSelect});return r?mapSub(r):null}
 async findActiveSubscriptionByCard(cardId:string){const r=await this.db.subscription.findFirst({where:{customer:{cards:{some:{id:cardId,deletedAt:null}}},status:"ACTIVE",expiresAt:{gt:new Date()}},orderBy:{createdAt:"desc"},select:subscriptionSelect});return r?mapSub(r):null}
 async findLatestSubscriptionByCard(cardId:string){const r=await this.db.subscription.findFirst({where:{customer:{cards:{some:{id:cardId,deletedAt:null}}}},orderBy:{createdAt:"desc"},select:subscriptionSelect});return r?mapSub(r):null}
 async createSubscription(input:SubscriptionWrite){
  const customer=await this.db.customer.findUniqueOrThrow({where:{id:input.customerId},select:{workspaceId:true}});
  return mapSub(await this.db.subscription.create({data:{workspaceId:customer.workspaceId,customerId:input.customerId,planId:input.planId,status:input.status,billingInterval:input.billingInterval,startsAt:input.currentPeriodStart,expiresAt:input.currentPeriodEnd,activatedAt:input.status==="ACTIVE"?input.currentPeriodStart:null,currentPeriodStart:input.currentPeriodStart,currentPeriodEnd:input.currentPeriodEnd,provider:"OI_MANUAL"},select:subscriptionSelect}));
 }
 async updateSubscription(id:string,input:Parameters<PlatformManagementRepository["updateSubscription"]>[1]){return mapSub(await this.db.subscription.update({where:{id},data:input,select:subscriptionSelect}))}
 async audit(input:Parameters<PlatformManagementRepository["audit"]>[0]){await this.db.auditLog.create({data:{actorType:input.actorId?"ADMIN":"SYSTEM",adminUserId:input.actorId,workspaceId:input.workspaceId,action:input.action,resourceType:input.resourceType,resourceId:input.resourceId,metadata:input.metadata as Prisma.InputJsonValue|undefined}})}
 async getPlatformSettings(){const row=await this.db.setting.findFirst({where:{scope:"PLATFORM",customerId:null,cardId:null,key:"CONFIG"},orderBy:{updatedAt:"desc"},select:{value:true}});return row?.value as PlatformSettings|null}
 async savePlatformSettings(settings:PlatformSettings){const existing=await this.db.setting.findFirst({where:{scope:"PLATFORM",customerId:null,cardId:null,key:"CONFIG"},orderBy:{updatedAt:"desc"},select:{id:true}});const value=settings as unknown as Prisma.InputJsonValue;if(existing)await this.db.setting.update({where:{id:existing.id},data:{value}});else await this.db.setting.create({data:{scope:"PLATFORM",key:"CONFIG",value}});return settings}
}
