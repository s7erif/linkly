import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import type { WorkspaceScope } from "@/domain/workspace-access";
import type { PaymentSubmissionDTO } from "@/dto/payment.dto";
const select={id:true,orderId:true,customerId:true,paymentMethod:true,amount:true,currency:true,senderName:true,senderPhone:true,referenceNumber:true,paymentProofAssetId:true,notes:true,status:true,submittedAt:true,verifiedAt:true,verifiedBy:true,rejectionReason:true} satisfies Prisma.PaymentSubmissionSelect;
type Db=PrismaClient|Prisma.TransactionClient;
type Row=Prisma.PaymentSubmissionGetPayload<{select:typeof select}>;
type CreatePaymentInput=Omit<Prisma.PaymentSubmissionUncheckedCreateInput,"workspaceId">;
const map=(row:Row):PaymentSubmissionDTO=>row;
export interface PaymentRepository {
  create(input:CreatePaymentInput):Promise<PaymentSubmissionDTO>;
  createInWorkspace(scope:WorkspaceScope,input:CreatePaymentInput):Promise<PaymentSubmissionDTO>;
  find(id:string):Promise<PaymentSubmissionDTO|null>;
  findInWorkspace(scope:WorkspaceScope,id:string):Promise<PaymentSubmissionDTO|null>;
  approve(id:string,adminId:string):Promise<PaymentSubmissionDTO>;
  approveInWorkspace(scope:WorkspaceScope,id:string,adminId:string):Promise<PaymentSubmissionDTO|null>;
  reject(id:string,adminId:string,reason:string):Promise<PaymentSubmissionDTO>;
  rejectInWorkspace(scope:WorkspaceScope,id:string,adminId:string,reason:string):Promise<PaymentSubmissionDTO|null>;
}
export class PrismaPaymentRepository implements PaymentRepository {
  constructor(private readonly db:Db){}
  async create(input:CreatePaymentInput){const order=await this.db.order.findUnique({where:{id:input.orderId},select:{workspaceId:true}});if(!order)throw new Error("Payment order not found");return this.createForWorkspace(order.workspaceId,input);}
  async createInWorkspace(scope:WorkspaceScope,input:CreatePaymentInput){return this.createForWorkspace(scope.workspaceId,input);}
  private async createForWorkspace(workspaceId:string,input:CreatePaymentInput){const [order,customer]=await Promise.all([this.db.order.findFirst({where:{id:input.orderId,workspaceId},select:{id:true}}),input.customerId?this.db.customer.findFirst({where:{id:input.customerId,workspaceId},select:{id:true}}):null]);if(!order||(input.customerId&&!customer))throw new Error("Payment relations are outside the current workspace");if(input.paymentProofAssetId){let proof=await this.db.mediaAsset.findFirst({where:{id:input.paymentProofAssetId,workspaceId},select:{id:true}});if(!proof){const provisional=await this.db.mediaAsset.findFirst({where:{id:input.paymentProofAssetId,workspace:{memberships:{none:{}},ownedCustomers:{none:{}},cards:{none:{}},orders:{none:{}}}},select:{id:true,workspaceId:true}});if(!provisional)throw new Error("Payment proof is outside the current workspace");const moved=await this.db.mediaAsset.updateMany({where:{id:provisional.id,workspaceId:provisional.workspaceId},data:{workspaceId,folderId:null}});if(moved.count!==1)throw new Error("Payment proof ownership changed");proof={id:provisional.id};}}return map(await this.db.paymentSubmission.create({data:{...input,workspaceId},select}));}
  async find(id:string){const row=await this.db.paymentSubmission.findUnique({where:{id},select});return row?map(row):null;}
  async findInWorkspace(scope:WorkspaceScope,id:string){const row=await this.db.paymentSubmission.findFirst({where:{id,workspaceId:scope.workspaceId},select});return row?map(row):null;}
  async approve(id:string,adminId:string){return map(await this.db.paymentSubmission.update({where:{id},data:{status:"APPROVED",verifiedAt:new Date(),verifiedBy:adminId},select}));}
  async approveInWorkspace(scope:WorkspaceScope,id:string,adminId:string){const result=await this.db.paymentSubmission.updateMany({where:{id,workspaceId:scope.workspaceId},data:{status:"APPROVED",verifiedAt:new Date(),verifiedBy:adminId}});if(result.count!==1)return null;return this.findInWorkspace(scope,id);}
  async reject(id:string,adminId:string,reason:string){return map(await this.db.paymentSubmission.update({where:{id},data:{status:"REJECTED",verifiedAt:new Date(),verifiedBy:adminId,rejectionReason:reason},select}));}
  async rejectInWorkspace(scope:WorkspaceScope,id:string,adminId:string,reason:string){const result=await this.db.paymentSubmission.updateMany({where:{id,workspaceId:scope.workspaceId},data:{status:"REJECTED",verifiedAt:new Date(),verifiedBy:adminId,rejectionReason:reason}});if(result.count!==1)return null;return this.findInWorkspace(scope,id);}
}
