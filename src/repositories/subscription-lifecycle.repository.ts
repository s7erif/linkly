import type { Prisma, PrismaClient, SubscriptionReminderType } from "@/generated/prisma/client";

const lifecycleSelect={id:true,workspaceId:true,customerId:true,status:true,billingInterval:true,startsAt:true,expiresAt:true,activatedAt:true,renewedAt:true,expiredAt:true,canceledAt:true,suspendedAt:true,customer:{select:{displayName:true,email:true}}} satisfies Prisma.SubscriptionSelect;
export type SubscriptionLifecycleRecord=Prisma.SubscriptionGetPayload<{select:typeof lifecycleSelect}>;
export type ReminderRecord={id:string;status:"PENDING"|"SENT"|"FAILED";idempotencyKey:string;recipient:string};
export interface SubscriptionLifecycleRepository{
 findById(id:string):Promise<SubscriptionLifecycleRecord|null>;
 listActiveExpiringBy(end:Date):Promise<readonly SubscriptionLifecycleRecord[]>;
 expireOverdue(now:Date):Promise<readonly SubscriptionLifecycleRecord[]>;
 getOrCreateReminder(input:{subscriptionId:string;workspaceId:string;type:SubscriptionReminderType;periodExpiresAt:Date;recipient:string;provider:string;idempotencyKey:string}):Promise<ReminderRecord>;
 claimReminder(id:string,at:Date):Promise<boolean>;
 markReminderSent(id:string,providerMessageId:string,at:Date):Promise<void>;
 markReminderFailed(id:string,code:string,message:string):Promise<void>;
}
export class PrismaSubscriptionLifecycleRepository implements SubscriptionLifecycleRepository{
 constructor(private readonly db:PrismaClient){}
 findById(id:string){return this.db.subscription.findUnique({where:{id},select:lifecycleSelect})}
 listActiveExpiringBy(end:Date){return this.db.subscription.findMany({where:{status:"ACTIVE",expiresAt:{not:null,lte:end}},orderBy:{expiresAt:"asc"},select:lifecycleSelect})}
 expireOverdue(now:Date){return this.db.$transaction(async tx=>{const due=await tx.subscription.findMany({where:{status:"ACTIVE",expiresAt:{not:null,lte:now}},select:lifecycleSelect});if(!due.length)return due;const expired:SubscriptionLifecycleRecord[]=[];for(const item of due){const claimed=await tx.subscription.updateMany({where:{id:item.id,status:"ACTIVE",expiresAt:{lte:now}},data:{status:"EXPIRED",expiredAt:now,endedAt:now}});if(claimed.count!==1)continue;await tx.auditLog.create({data:{actorType:"SYSTEM",workspaceId:item.workspaceId,action:"SUBSCRIPTION_EXPIRED",resourceType:"Subscription",resourceId:item.id,metadata:{expiresAt:item.expiresAt?.toISOString()} as Prisma.InputJsonValue}});expired.push({...item,status:"EXPIRED",expiredAt:now})}return expired})}
 async getOrCreateReminder(input:Parameters<SubscriptionLifecycleRepository["getOrCreateReminder"]>[0]){return this.db.subscriptionReminder.upsert({where:{idempotencyKey:input.idempotencyKey},update:{},create:input,select:{id:true,status:true,idempotencyKey:true,recipient:true}})}
 async claimReminder(id:string,at:Date){const result=await this.db.subscriptionReminder.updateMany({where:{id,status:"PENDING",attemptCount:0},data:{attemptCount:{increment:1},lastAttemptAt:at}});return result.count===1}
 async markReminderSent(id:string,providerMessageId:string,at:Date){await this.db.subscriptionReminder.update({where:{id},data:{status:"SENT",providerMessageId,sentAt:at,failureCode:null,failureMessage:null}})}
 async markReminderFailed(id:string,code:string,message:string){await this.db.subscriptionReminder.update({where:{id},data:{status:"FAILED",failureCode:code,failureMessage:message.slice(0,500)}})}
}
