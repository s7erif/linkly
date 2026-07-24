import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import type { WorkspaceScope } from "@/domain/workspace-access";
import type { CreateNotificationRecord, NotificationRecord, NotificationRepository } from "@/notifications/contracts";

const notificationSelect={id:true,orderId:true,customerId:true,cardId:true,channel:true,template:true,recipient:true,status:true,provider:true,providerMessageId:true,idempotencyKey:true,attemptCount:true,lastAttemptAt:true,sentAt:true,failureCode:true,failureMessage:true,createdAt:true,updatedAt:true} satisfies Prisma.NotificationDeliverySelect;
type NotificationRow=Prisma.NotificationDeliveryGetPayload<{select:typeof notificationSelect}>;
const mapNotification=(row:NotificationRow):NotificationRecord=>({...row});

export class PrismaNotificationRepository implements NotificationRepository {
  constructor(private readonly db:PrismaClient){}
  async getOrCreate(input:CreateNotificationRecord):Promise<NotificationRecord>{
    return this.db["\u0024transaction"](async tx=>{
      const order=await tx.order.findUnique({where:{id:input.orderId},select:{workspaceId:true}});
      if(!order)throw new Error("Notification order not found");
      const [customer,card]=await Promise.all([
        tx.customer.findFirst({where:{id:input.customerId,workspaceId:order.workspaceId},select:{id:true}}),
        tx.card.findFirst({where:{id:input.cardId,workspaceId:order.workspaceId},select:{id:true}}),
      ]);
      if(!customer||!card)throw new Error("Notification relations are outside the order workspace");
      const existing=await tx.notificationDelivery.findUnique({where:{idempotencyKey:input.idempotencyKey},select:{workspaceId:true}});
      if(existing&&existing.workspaceId!==order.workspaceId)throw new Error("Notification idempotency key belongs to another workspace");
      return mapNotification(await tx.notificationDelivery.upsert({where:{idempotencyKey:input.idempotencyKey},update:{},create:{...input,workspaceId:order.workspaceId},select:notificationSelect}));
    });
  }
  /** Internal platform delivery path; tenant callers must use claimFirstAttemptInWorkspace. */
  async claimFirstAttempt(id:string,attemptedAt:Date):Promise<boolean>{const result=await this.db.notificationDelivery.updateMany({where:{id,status:"PENDING",attemptCount:0},data:{attemptCount:{increment:1},lastAttemptAt:attemptedAt}});return result.count===1;}
  async claimFirstAttemptInWorkspace(scope:WorkspaceScope,id:string,attemptedAt:Date):Promise<boolean>{const result=await this.db.notificationDelivery.updateMany({where:{id,workspaceId:scope.workspaceId,status:"PENDING",attemptCount:0},data:{attemptCount:{increment:1},lastAttemptAt:attemptedAt}});return result.count===1;}
  /** Internal platform delivery path; tenant callers must use markSentInWorkspace. */
  async markSent(id:string,providerMessageId:string,sentAt:Date):Promise<NotificationRecord>{return mapNotification(await this.db.notificationDelivery.update({where:{id},data:{status:"SENT",providerMessageId,sentAt,failureCode:null,failureMessage:null},select:notificationSelect}));}
  async markSentInWorkspace(scope:WorkspaceScope,id:string,providerMessageId:string,sentAt:Date):Promise<NotificationRecord|null>{const result=await this.db.notificationDelivery.updateMany({where:{id,workspaceId:scope.workspaceId},data:{status:"SENT",providerMessageId,sentAt,failureCode:null,failureMessage:null}});if(result.count!==1)return null;const row=await this.db.notificationDelivery.findFirst({where:{id,workspaceId:scope.workspaceId},select:notificationSelect});return row?mapNotification(row):null;}
  /** Internal platform delivery path; tenant callers must use markFailedInWorkspace. */
  async markFailed(id:string,failureCode:string,failureMessage:string):Promise<NotificationRecord>{return mapNotification(await this.db.notificationDelivery.update({where:{id},data:{status:"FAILED",failureCode,failureMessage},select:notificationSelect}));}
  async markFailedInWorkspace(scope:WorkspaceScope,id:string,failureCode:string,failureMessage:string):Promise<NotificationRecord|null>{const result=await this.db.notificationDelivery.updateMany({where:{id,workspaceId:scope.workspaceId},data:{status:"FAILED",failureCode,failureMessage}});if(result.count!==1)return null;const row=await this.db.notificationDelivery.findFirst({where:{id,workspaceId:scope.workspaceId},select:notificationSelect});return row?mapNotification(row):null;}
}
