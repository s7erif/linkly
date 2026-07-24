import type { EmailMessage } from "../contracts";
import { emailLayout, escapeHtml } from "./layout";
export type SubscriptionMessageKind="EXPIRY_7_DAYS"|"EXPIRY_3_DAYS"|"EXPIRY_1_DAY"|"EXPIRED"|"RENEWED";
export function subscriptionLifecycleEmail(input:{from:string;to:string;customerName:string;kind:SubscriptionMessageKind;expiresAt:Date}):EmailMessage{
 const date=input.expiresAt.toLocaleDateString("en",{dateStyle:"long",timeZone:"UTC"});
 const days=input.kind==="EXPIRY_7_DAYS"?7:input.kind==="EXPIRY_3_DAYS"?3:input.kind==="EXPIRY_1_DAY"?1:null;
 const title=input.kind==="RENEWED"?"Subscription renewed":input.kind==="EXPIRED"?"Subscription expired":`Subscription expires in ${days} day${days===1?"":"s"}`;
 const copy=input.kind==="RENEWED"?`Your subscription has been renewed through ${date}.`:input.kind==="EXPIRED"?`Your subscription expired on ${date}. Contact support to renew it. Your public profile remains available.`:`Your subscription expires on ${date}. Contact support if you want to renew it.`;
 const body=emailLayout({preheader:title,title,greeting:`Hello ${input.customerName},`,bodyHtml:`<p>${escapeHtml(copy)}</p>`,bodyText:copy});
 return{from:input.from,to:input.to,subject:title,html:body.html,text:body.text};
}
