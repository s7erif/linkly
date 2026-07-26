import type { Logger } from "@/lib/logger";
import type { EmailProvider } from "@/notifications/contracts";
import { subscriptionLifecycleEmail } from "@/notifications/templates";
import type { SubscriptionLifecycleRecord, SubscriptionLifecycleRepository, SubscriptionReminderType } from "@/repositories/subscription-lifecycle.repository";

const DAY=86_400_000;
const utcDay=(value:Date)=>Date.UTC(value.getUTCFullYear(),value.getUTCMonth(),value.getUTCDate());
export type ExpirationRunResult={expired:number;queued:number;sent:number;failed:number};
export class ManualSubscriptionLifecycleService{
 constructor(private readonly repository:SubscriptionLifecycleRepository,private readonly email:EmailProvider,private readonly logger:Logger,private readonly config:{from:string},private readonly clock:()=>Date=()=>new Date()){}
 async runDaily():Promise<ExpirationRunResult>{
  const now=this.clock();
  const expired=await this.repository.expireOverdue(now);
  const upcoming=await this.repository.listActiveExpiringBy(new Date(now.getTime()+8*DAY));
  const candidates:[SubscriptionLifecycleRecord,SubscriptionReminderType][]=[];
  for(const item of upcoming){if(!item.expiresAt||!item.customer.email)continue;const days=Math.round((utcDay(item.expiresAt)-utcDay(now))/DAY);const type=days===7?"EXPIRY_7_DAYS":days===3?"EXPIRY_3_DAYS":days===1?"EXPIRY_1_DAY":null;if(type)candidates.push([item,type])}
  for(const item of expired)if(item.expiresAt&&item.customer.email)candidates.push([item,"EXPIRED"]);
  let sent=0,failed=0;
  for(const [item,type] of candidates){const ok=await this.deliver(item,type);if(ok)sent++;else failed++}
  return{expired:expired.length,queued:candidates.length,sent,failed};
 }
 async sendRenewedById(id:string):Promise<boolean>{const item=await this.repository.findById(id);return item?this.sendRenewed(item):false}
 async sendRenewed(item:SubscriptionLifecycleRecord):Promise<boolean>{return item.expiresAt&&item.customer.email?this.deliver(item,"RENEWED"):false}
 private async deliver(item:SubscriptionLifecycleRecord,type:SubscriptionReminderType):Promise<boolean>{
  if(!item.expiresAt||!item.customer.email)return false;
  const period=item.expiresAt.toISOString();const idempotencyKey=`subscription/${item.id}/${type}/${period}`;
  const reminder=await this.repository.getOrCreateReminder({subscriptionId:item.id,workspaceId:item.workspaceId,type,periodExpiresAt:item.expiresAt,recipient:item.customer.email,provider:this.email.name,idempotencyKey});
  if(reminder.status==="SENT"||!await this.repository.claimReminder(reminder.id,this.clock()))return reminder.status==="SENT";
  try{const message=subscriptionLifecycleEmail({from:this.config.from,to:item.customer.email,customerName:item.customer.displayName,kind:type,expiresAt:item.expiresAt});const result=await this.email.send(message,{idempotencyKey});await this.repository.markReminderSent(reminder.id,result.providerMessageId,this.clock());return true}catch(error){const message=error instanceof Error?error.message:"Unknown delivery failure";await this.repository.markReminderFailed(reminder.id,"DELIVERY_FAILED",message);this.logger.error("Subscription lifecycle email failed",error,{subscriptionId:item.id,type});return false}
 }
}
