import type { WorkspaceScope } from "@/domain/workspace-access";
import type { InvoiceRepository } from "@/repositories/invoice.repository";
import type { InvoiceDTO } from "@/dto/payment.dto";
interface CreateInvoiceInput {orderId:string;customerId:string;planName:string;subtotal:number;discount?:number;tax?:number;total:number;currency:string}
export class InvoiceService {
  constructor(private readonly repository:InvoiceRepository){}
  async create(input:CreateInvoiceInput):Promise<InvoiceDTO>{const existing=await this.repository.findByOrder(input.orderId);if(existing)return existing;return this.repository.create(this.command(input));}
  async createInWorkspace(scope:WorkspaceScope,input:CreateInvoiceInput):Promise<InvoiceDTO>{const existing=await this.repository.findByOrderInWorkspace(scope,input.orderId);if(existing)return existing;return this.repository.createInWorkspace(scope,this.command(input));}
  private command(input:CreateInvoiceInput){return{invoiceNumber:"OI-"+new Date().getUTCFullYear()+"-"+crypto.randomUUID().slice(0,8).toUpperCase(),orderId:input.orderId,customerId:input.customerId,planNameSnapshot:input.planName,subtotal:input.subtotal,discount:input.discount??0,tax:input.tax??0,total:input.total,currency:input.currency,status:"ISSUED" as const};}
  async attachPdf(id:string,path:string){return this.repository.attachPdf(id,path);}
  async attachPdfInWorkspace(scope:WorkspaceScope,id:string,path:string){return this.repository.attachPdfInWorkspace(scope,id,path);}
  async history(customerId:string){return this.repository.findByCustomer(customerId);}
  async historyInWorkspace(scope:WorkspaceScope,customerId:string){return this.repository.findByCustomerInWorkspace(scope,customerId);}
}
