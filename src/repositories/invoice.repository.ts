import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import type { WorkspaceScope } from "@/domain/workspace-access";
import type { InvoiceDTO } from "@/dto/payment.dto";
const select={id:true,invoiceNumber:true,orderId:true,customerId:true,planNameSnapshot:true,subtotal:true,discount:true,tax:true,total:true,currency:true,status:true,issuedAt:true,pdfPath:true} satisfies Prisma.InvoiceSelect;
type Db=PrismaClient|Prisma.TransactionClient;
type Row=Prisma.InvoiceGetPayload<{select:typeof select}>;
type CreateInvoiceInput=Omit<Prisma.InvoiceUncheckedCreateInput,"workspaceId">;
const map=(row:Row):InvoiceDTO=>row;
export interface InvoiceRepository {
  /** Explicit platform-admin paths. Tenant callers must use the InWorkspace variants. */
  find(id:string):Promise<InvoiceDTO|null>;
  findByOrder(orderId:string):Promise<InvoiceDTO|null>;
  findByCustomer(customerId:string):Promise<readonly InvoiceDTO[]>;
  findInWorkspace(scope:WorkspaceScope,id:string):Promise<InvoiceDTO|null>;
  findByOrderInWorkspace(scope:WorkspaceScope,orderId:string):Promise<InvoiceDTO|null>;
  findByCustomerInWorkspace(scope:WorkspaceScope,customerId:string):Promise<readonly InvoiceDTO[]>;
  create(input:CreateInvoiceInput):Promise<InvoiceDTO>;
  createInWorkspace(scope:WorkspaceScope,input:CreateInvoiceInput):Promise<InvoiceDTO>;
  attachPdf(id:string,pdfPath:string):Promise<InvoiceDTO>;
  attachPdfInWorkspace(scope:WorkspaceScope,id:string,pdfPath:string):Promise<InvoiceDTO|null>;
}
export class PrismaInvoiceRepository implements InvoiceRepository {
  constructor(private readonly db:Db){}
  async find(id:string){const row=await this.db.invoice.findUnique({where:{id},select});return row?map(row):null;}
  async findByOrder(orderId:string){const row=await this.db.invoice.findFirst({where:{orderId},select});return row?map(row):null;}
  async findByCustomer(customerId:string){return(await this.db.invoice.findMany({where:{customerId},orderBy:{issuedAt:"desc"},select})).map(map);}
  async findInWorkspace(scope:WorkspaceScope,id:string){const row=await this.db.invoice.findFirst({where:{id,workspaceId:scope.workspaceId},select});return row?map(row):null;}
  async findByOrderInWorkspace(scope:WorkspaceScope,orderId:string){const row=await this.db.invoice.findFirst({where:{orderId,workspaceId:scope.workspaceId},select});return row?map(row):null;}
  async findByCustomerInWorkspace(scope:WorkspaceScope,customerId:string){return(await this.db.invoice.findMany({where:{customerId,workspaceId:scope.workspaceId},orderBy:{issuedAt:"desc"},select})).map(map);}
  async create(input:CreateInvoiceInput){const order=await this.db.order.findUnique({where:{id:input.orderId},select:{workspaceId:true}});if(!order)throw new Error("Invoice order not found");return this.createForWorkspace(order.workspaceId,input);}
  async createInWorkspace(scope:WorkspaceScope,input:CreateInvoiceInput){return this.createForWorkspace(scope.workspaceId,input);}
  private async createForWorkspace(workspaceId:string,input:CreateInvoiceInput){const [order,customer]=await Promise.all([this.db.order.findFirst({where:{id:input.orderId,workspaceId},select:{id:true}}),this.db.customer.findFirst({where:{id:input.customerId,workspaceId},select:{id:true}})]);if(!order||!customer)throw new Error("Invoice relations are outside the current workspace");return map(await this.db.invoice.create({data:{...input,workspaceId},select}));}
  async attachPdf(id:string,pdfPath:string){return map(await this.db.invoice.update({where:{id},data:{pdfPath},select}));}
  async attachPdfInWorkspace(scope:WorkspaceScope,id:string,pdfPath:string){const result=await this.db.invoice.updateMany({where:{id,workspaceId:scope.workspaceId},data:{pdfPath}});if(result.count!==1)return null;return this.findInWorkspace(scope,id);}
}
