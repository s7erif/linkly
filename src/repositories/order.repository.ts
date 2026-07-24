import type { Prisma, PrismaClient } from "@/generated/prisma/client";
import type { WorkspaceScope } from "@/domain/workspace-access";
import type { OrderDTO } from "@/dto";
import type { CreateOrderCommand, OrderListCriteria, OrderReadRepository, OrderWriteRepository, TransitionOrderCommand, UpdateOrderCommand, WorkspaceOrderRepository } from "./contracts";

const orderSelect={id:true,orderNumber:true,customerName:true,company:true,email:true,phone:true,package:true,quantity:true,notes:true,status:true,paymentStatus:true,fulfillmentStatus:true,customerId:true,planId:true,billingInterval:true,planNameSnapshot:true,planDescriptionSnapshot:true,billingIntervalSnapshot:true,currency:true,planPriceSnapshot:true,subtotal:true,discount:true,tax:true,total:true,createdAt:true,updatedAt:true,cards:{select:{id:true},orderBy:{createdAt:"asc" as const}}} satisfies Prisma.OrderSelect;
type OrderRow=Prisma.OrderGetPayload<{select:typeof orderSelect}>;
function mapOrder(row:OrderRow):OrderDTO{return {id:row.id,orderNumber:row.orderNumber,customerName:row.customerName,company:row.company,email:row.email,phone:row.phone,package:row.package,quantity:row.quantity,notes:row.notes,status:row.status,paymentStatus:row.paymentStatus,fulfillmentStatus:row.fulfillmentStatus,customerId:row.customerId,planId:row.planId,billingInterval:row.billingInterval,planNameSnapshot:row.planNameSnapshot,planDescriptionSnapshot:row.planDescriptionSnapshot,billingIntervalSnapshot:row.billingIntervalSnapshot,currency:row.currency,planPriceSnapshot:row.planPriceSnapshot,subtotal:row.subtotal,discount:row.discount,tax:row.tax,total:row.total,cardIds:row.cards.map(card=>card.id),createdAt:row.createdAt,updatedAt:row.updatedAt}}
interface OrderDatabase{order:Prisma.TransactionClient["order"];workspace:Prisma.TransactionClient["workspace"]}
abstract class OrderRepositoryBase implements OrderReadRepository{
  constructor(protected readonly db:OrderDatabase){}
  /** Platform-admin compatibility path; tenant callers must use findByIdInWorkspace. */
  async findById(id:string):Promise<OrderDTO|null>{return this.findByIdForPlatformAdmin(id)}
  async findByIdForPlatformAdmin(id:string):Promise<OrderDTO|null>{const row=await this.db.order.findUnique({where:{id},select:orderSelect});return row?mapOrder(row):null}
  /** Platform-admin compatibility path; tenant callers must use listInWorkspace. */
  async list(criteria:OrderListCriteria):Promise<readonly OrderDTO[]>{return this.listForPlatformAdmin(criteria)}
  async listForPlatformAdmin(criteria:OrderListCriteria):Promise<readonly OrderDTO[]>{const rows=await this.db.order.findMany({where:criteria.status?{status:criteria.status}:undefined,orderBy:[{createdAt:"desc"},{id:"desc"}],take:criteria.take,select:orderSelect});return rows.map(mapOrder)}
  async findAccountCredentials(orderId:string):Promise<{accountPasswordHash:Uint8Array<ArrayBuffer>;accountPasswordSalt:Uint8Array<ArrayBuffer>}|null>{const row=await this.db.order.findUnique({where:{id:orderId},select:{accountPasswordHash:true,accountPasswordSalt:true}});return row&&row.accountPasswordHash&&row.accountPasswordSalt?{accountPasswordHash:row.accountPasswordHash,accountPasswordSalt:row.accountPasswordSalt}:null}
  async findPendingRegistrationByEmail(email:string):Promise<{orderNumber:string}|null>{const row=await this.db.order.findFirst({where:{email:{equals:email,mode:"insensitive"},status:{in:["PENDING","SUBMITTED"]}},orderBy:{createdAt:"desc"},select:{orderNumber:true}});return row?{orderNumber:row.orderNumber}:null}
  async findByIdInWorkspace(scope:WorkspaceScope,id:string):Promise<OrderDTO|null>{const row=await this.db.order.findFirst({where:{workspaceId:scope.workspaceId,id},select:orderSelect});return row?mapOrder(row):null}
  async listInWorkspace(scope:WorkspaceScope,criteria:OrderListCriteria):Promise<readonly OrderDTO[]>{const rows=await this.db.order.findMany({where:{workspaceId:scope.workspaceId,...(criteria.status?{status:criteria.status}:{})},orderBy:[{createdAt:"desc"},{id:"desc"}],take:criteria.take,select:orderSelect});return rows.map(mapOrder)}
}
export class PrismaOrderReadRepository extends OrderRepositoryBase implements Pick<WorkspaceOrderRepository,"findByIdInWorkspace"|"listInWorkspace">{constructor(db:PrismaClient){super(db)}}
export class PrismaOrderTransactionRepository extends OrderRepositoryBase implements OrderWriteRepository,WorkspaceOrderRepository{
  constructor(db:Prisma.TransactionClient){super(db)}
  async create(command:CreateOrderCommand):Promise<OrderDTO>{const workspace=await this.db.workspace.create({data:{},select:{id:true}});return mapOrder(await this.db.order.create({data:{...command,workspaceId:workspace.id},select:orderSelect}))}
  async update(id:string,command:UpdateOrderCommand):Promise<OrderDTO>{return mapOrder(await this.db.order.update({where:{id},data:command,select:orderSelect}))}
  async transition(command:TransitionOrderCommand):Promise<OrderDTO|null>{const result=await this.db.order.updateMany({where:{id:command.id,status:command.fromStatus,...(command.fromFulfillmentStatus?{fulfillmentStatus:command.fromFulfillmentStatus}:{})},data:command.update});if(result.count!==1)return null;return this.findById(command.id)}
  async createInWorkspace(scope:WorkspaceScope,command:CreateOrderCommand):Promise<OrderDTO>{return mapOrder(await this.db.order.create({data:{...command,workspaceId:scope.workspaceId},select:orderSelect}))}
  async updateInWorkspace(scope:WorkspaceScope,id:string,command:UpdateOrderCommand):Promise<OrderDTO|null>{const result=await this.db.order.updateMany({where:{workspaceId:scope.workspaceId,id},data:command});if(result.count!==1)return null;return this.findByIdInWorkspace(scope,id)}
  async transitionInWorkspace(scope:WorkspaceScope,command:TransitionOrderCommand):Promise<OrderDTO|null>{const result=await this.db.order.updateMany({where:{workspaceId:scope.workspaceId,id:command.id,status:command.fromStatus,...(command.fromFulfillmentStatus?{fulfillmentStatus:command.fromFulfillmentStatus}:{})},data:command.update});if(result.count!==1)return null;return this.findByIdInWorkspace(scope,command.id)}
}
