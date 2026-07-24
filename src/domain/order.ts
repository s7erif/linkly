import { InvalidOrderTransitionError } from "@/lib/errors";
import type { FulfillmentStatus, OrderStatus } from "@/types/order";
const transitions:Readonly<Record<OrderStatus,readonly OrderStatus[]>>={DRAFT:["SUBMITTED","CANCELLED"],SUBMITTED:["PENDING","CANCELLED"],PENDING:["APPROVED","CANCELLED"],APPROVED:["FULFILLED"],FULFILLED:["COMPLETED"],COMPLETED:[],CANCELLED:[]};
export function assertOrderTransition(from:OrderStatus,to:OrderStatus):void{if(!transitions[from].includes(to))throw new InvalidOrderTransitionError(from,to)}
const fulfillment:Readonly<Record<FulfillmentStatus,readonly FulfillmentStatus[]>>={NOT_STARTED:["CUSTOMER_CREATED"],CUSTOMER_CREATED:["CARD_CREATED"],CARD_CREATED:["ACCESS_CODE_ISSUED"],ACCESS_CODE_ISSUED:["PRINTING"],PRINTING:["DELIVERED"],DELIVERED:["COMPLETED"],COMPLETED:[]};
export function assertFulfillmentTransition(from:FulfillmentStatus,to:FulfillmentStatus):void{if(!fulfillment[from].includes(to))throw new InvalidOrderTransitionError(from,to)}
export function nextFulfillmentStep(current:FulfillmentStatus):FulfillmentStatus|null{if(current==="ACCESS_CODE_ISSUED")return "PRINTING";if(current==="PRINTING")return "DELIVERED";if(current==="DELIVERED")return "COMPLETED";return null}
