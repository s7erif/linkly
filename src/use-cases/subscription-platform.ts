import { ConflictError, ForbiddenError, NotFoundError, ValidationError } from "@/lib/errors";
import type { TransactionRepositories, UnitOfWork } from "@/repositories";
import type { AdminPermission, PlanWrite } from "@/repositories/platform-management.repository";
import type { BillingIntervalDTO, ManualSubscriptionDuration, PlanDTO, SubscriptionDTO } from "@/dto/subscription.dto";

const ROLE_PERMISSIONS:Record<string,readonly AdminPermission[]>={
 SUPER_ADMIN:["CARD_MANAGE","CARD_SUPPORT_EDIT","ACCESS_CODE_MANAGE","PLAN_MANAGE","SUBSCRIPTION_MANAGE","ORDER_APPROVE","AUDIT_READ"],
 ADMIN:["CARD_MANAGE","CARD_SUPPORT_EDIT","ACCESS_CODE_MANAGE","PLAN_MANAGE","SUBSCRIPTION_MANAGE","ORDER_APPROVE","AUDIT_READ"],
 SUPPORT:["CARD_SUPPORT_EDIT","ACCESS_CODE_MANAGE","AUDIT_READ"],
 VIEWER:["AUDIT_READ"],
};
export function hasAdminPermission(actor:{roles:readonly string[]},permission:AdminPermission){return actor.roles.some(role=>ROLE_PERMISSIONS[role]?.includes(permission))}
function platform(r:TransactionRepositories){if(!r.platform)throw new Error("Platform repository is not configured");return r.platform}
export async function requireAdmin(r:TransactionRepositories,email:string,permission:AdminPermission){const actor=await platform(r).findAdminByEmail(email);if(!actor)throw new ForbiddenError("Administrator account is inactive or unavailable");if(!hasAdminPermission(actor,permission))throw new ForbiddenError(`Missing permission: ${permission}`);return actor}
const addMonths=(date:Date,count:number)=>{const next=new Date(date);next.setUTCMonth(next.getUTCMonth()+count);return next};
const monthsFor=(value:BillingIntervalDTO)=>value==="MONTHLY"?1:value==="QUARTERLY"?3:12;
export class EnsureBootstrapAdmin {
 constructor(private readonly uow:UnitOfWork){}
 execute(email:string,name:string){
  return this.uow.execute(async r=>{
   const existing=await platform(r).findAdminByEmail(email);
   const actor=existing??await platform(r).ensureAdminUser(email,name);
   if(actor.roles.length===0)await platform(r).ensureBootstrapRole(actor.id);
   return actor;
  });
 }
}
export class ListActivePlans {constructor(private readonly repo:import("@/repositories/platform-management.repository").PlatformManagementRepository){}execute(){return this.repo.listPlans(true)}}
export class ManagePlan {constructor(private readonly uow:UnitOfWork){} execute(email:string,id:string|undefined,input:PlanWrite):Promise<PlanDTO>{if(!input.name.trim())throw new ValidationError("Plan name is required");if(!input.key.match(/^[a-z0-9-]+$/))throw new ValidationError("Slug must contain lowercase letters, numbers, and hyphens only");if([input.monthlyMinor,input.yearlyMinor].some(value=>value!=null&&value<0))throw new ValidationError("Prices must be zero or greater");if(!Number.isInteger(input.sortOrder)||input.sortOrder<0)throw new ValidationError("Sort order must be a non-negative whole number");return this.uow.execute(async r=>{const actor=await requireAdmin(r,email,"PLAN_MANAGE");const plans=await platform(r).listPlans(false);if(plans.some(plan=>plan.id!==id&&plan.key===input.key))throw new ConflictError("Plan slug already exists");if(plans.some(plan=>plan.id!==id&&plan.sortOrder===input.sortOrder))throw new ConflictError("Sort order already exists");const saved=await platform(r).savePlan(id,input);await platform(r).audit({actorId:actor.id,action:id?"PLAN_UPDATED":"PLAN_CREATED",resourceType:"Plan",resourceId:saved.id});return saved})}}
export class ManagePlanOperation {constructor(private readonly uow:UnitOfWork){} execute(email:string,id:string,operation:"DUPLICATE"|"ARCHIVE"|"ACTIVATE"|"DEACTIVATE"){return this.uow.execute(async r=>{const actor=await requireAdmin(r,email,"PLAN_MANAGE");const current=await platform(r).findPlan(id);if(!current)throw new NotFoundError("Plan",id);const saved=operation==="DUPLICATE"?await platform(r).duplicatePlan(id):operation==="ARCHIVE"?await platform(r).archivePlan(id):await platform(r).setPlanActive(id,operation==="ACTIVATE");await platform(r).audit({actorId:actor.id,action:"PLAN_"+operation,resourceType:"Plan",resourceId:saved.id,metadata:operation==="DUPLICATE"?{sourcePlanId:id}:undefined});return saved})}}
export class ListSubscriptions {constructor(private readonly repo:import("@/repositories/platform-management.repository").PlatformManagementRepository){}execute(criteria?:import("@/repositories/platform-management.repository").SubscriptionListCriteria){return this.repo.listSubscriptions(criteria)}}
export class CreateOrderSubscription {constructor(private readonly uow:UnitOfWork){}executeIn(r:TransactionRepositories,input:{customerId:string;planId:string;billingInterval:BillingIntervalDTO;now?:Date}){const now=input.now??new Date();return platform(r).createSubscription({customerId:input.customerId,planId:input.planId,status:"PENDING_PAYMENT",billingInterval:input.billingInterval,currentPeriodStart:now,currentPeriodEnd:addMonths(now,monthsFor(input.billingInterval))})}}

function addDuration(start:Date,duration:ManualSubscriptionDuration):Date{
 const end=new Date(start);
 const day=end.getUTCDate();
 end.setUTCDate(1);
 end.setUTCMonth(end.getUTCMonth()+(duration==="MONTHLY"?1:12));
 const lastDay=new Date(Date.UTC(end.getUTCFullYear(),end.getUTCMonth()+1,0)).getUTCDate();
 end.setUTCDate(Math.min(day,lastDay));
 return end;
}

export type ManualSubscriptionAction="ACTIVATE"|"RENEW"|"SUSPEND"|"CANCEL";
export class ManageSubscription {
 constructor(private readonly uow:UnitOfWork,private readonly clock:()=>Date=()=>new Date()){}
 execute(email:string,input:{id:string;action:ManualSubscriptionAction;duration?:ManualSubscriptionDuration}):Promise<SubscriptionDTO>{
  return this.uow.execute(async r=>{
   const actor=await requireAdmin(r,email,"SUBSCRIPTION_MANAGE");
   const current=await platform(r).findSubscription(input.id);
   if(!current)throw new NotFoundError("Subscription",input.id);
   const now=this.clock();
   let update:Parameters<ReturnType<typeof platform>["updateSubscription"]>[1];
   if(input.action==="ACTIVATE"){
    if(!["PENDING_PAYMENT","SUSPENDED"].includes(current.status))throw new ConflictError(`Cannot activate a subscription from ${current.status}`);
    if(!input.duration)throw new ValidationError("Duration is required");
    const expiresAt=addDuration(now,input.duration);
    update={status:"ACTIVE",billingInterval:input.duration,startsAt:now,expiresAt,activatedAt:now,expiredAt:null,currentPeriodStart:now,currentPeriodEnd:expiresAt,canceledAt:null,cancelledAt:null,suspendedAt:null};
   }else if(input.action==="RENEW"){
    if(!["ACTIVE","EXPIRED"].includes(current.status))throw new ConflictError(`Cannot renew a subscription from ${current.status}`);
    if(!input.duration)throw new ValidationError("Duration is required");
    const startsAt=current.status==="ACTIVE"&&current.expiresAt&&current.expiresAt>now?current.expiresAt:now;
    const expiresAt=addDuration(startsAt,input.duration);
    update={status:"ACTIVE",billingInterval:input.duration,startsAt:current.startsAt??now,expiresAt,currentPeriodStart:startsAt,currentPeriodEnd:expiresAt,renewedAt:now,expiredAt:null,canceledAt:null,cancelledAt:null,suspendedAt:null};
   }else if(input.action==="SUSPEND"){
    if(current.status!=="ACTIVE")throw new ConflictError(`Cannot suspend a subscription from ${current.status}`);
    update={status:"SUSPENDED",suspendedAt:now};
   }else{
    if(["CANCELED","EXPIRED"].includes(current.status))throw new ConflictError(`Cannot cancel a subscription from ${current.status}`);
    update={status:"CANCELED",canceledAt:now,cancelledAt:now};
   }
   const saved=await platform(r).updateSubscription(input.id,update);
   await platform(r).audit({actorId:actor.id,workspaceId:saved.workspaceId,action:`SUBSCRIPTION_${input.action}`,resourceType:"Subscription",resourceId:saved.id,metadata:{fromStatus:current.status,toStatus:saved.status,duration:input.duration,expiresAt:saved.expiresAt?.toISOString()}});
   return saved;
  });
 }
}
