import type { WorkspaceScope } from "@/domain/workspace-access";
import type { PaymentRepository } from "@/repositories/payment.repository";
import type { PaymentSubmissionDTO } from "@/dto/payment.dto";
import { paymentSubmissionSchema } from "@/validation/payment";
export class PaymentService {
  constructor(private readonly repository:PaymentRepository){}
  async submit(input:unknown):Promise<PaymentSubmissionDTO>{const value=paymentSubmissionSchema.parse(input);return this.repository.create({...value,customerId:value.customerId??null,paymentProofAssetId:value.paymentProofAssetId??null,notes:value.notes??null,status:"PENDING"});}
  async submitInWorkspace(scope:WorkspaceScope,input:unknown):Promise<PaymentSubmissionDTO>{const value=paymentSubmissionSchema.parse(input);return this.repository.createInWorkspace(scope,{...value,customerId:value.customerId??null,paymentProofAssetId:value.paymentProofAssetId??null,notes:value.notes??null,status:"PENDING"});}
  async find(id:string){return this.repository.find(id);}
  async findInWorkspace(scope:WorkspaceScope,id:string){return this.repository.findInWorkspace(scope,id);}
  async approve(id:string,adminId:string){return this.repository.approve(id,adminId);}
  async approveInWorkspace(scope:WorkspaceScope,id:string,adminId:string){return this.repository.approveInWorkspace(scope,id,adminId);}
  async reject(id:string,adminId:string,reason:string){return this.repository.reject(id,adminId,reason);}
  async rejectInWorkspace(scope:WorkspaceScope,id:string,adminId:string,reason:string){return this.repository.rejectInWorkspace(scope,id,adminId,reason);}
}
