"use server";
import type {AuthOptions} from "next-auth";
import {getServerSession} from "next-auth/next";
import {revalidatePath} from "next/cache";
import {authOptions} from "@/lib/auth";
import {getManualSubscriptionLifecycleService,managePlan,managePlanOperation,manageSubscription} from "@/lib/composition-root";
import {AppError} from "@/lib/errors";
import type{ManualSubscriptionDuration,PlanLimitsDTO}from "@/dto/subscription.dto";

async function email(){const session=await getServerSession(authOptions as AuthOptions);if(!session?.user?.email)throw new Error("Administrator authentication is required");return session.user.email}
const text=(form:FormData,key:string)=>String(form.get(key)??"").trim();
const optionalMinor=(form:FormData,key:string)=>{const value=text(form,key);return value===""?null:Math.round(Number(value)*100)};
const featureList=(value:string)=>value.split("\n").map(item=>item.trim()).filter(Boolean).map(key=>({key:key.toUpperCase().replace(/[^A-Z0-9]+/g,"_"),enabled:true,limitValue:null}));
export type PlanFormState={ok:boolean;message:string;errors?:Record<string,string>};
export async function savePlanAction(_:PlanFormState,form:FormData):Promise<PlanFormState>{
 const limits:PlanLimitsDTO={maxCards:Number(text(form,"maxCards")||0),maxLinks:Number(text(form,"maxLinks")||0),maxTeamMembers:Number(text(form,"maxTeamMembers")||0),customDomain:form.get("customDomain")==="on",analytics:form.get("analytics")==="on",prioritySupport:form.get("prioritySupport")==="on"};
 try{await managePlan.execute(await email(),text(form,"id")||undefined,{key:text(form,"slug").toLowerCase(),name:text(form,"name"),description:text(form,"description")||null,currency:text(form,"currency").toUpperCase(),monthlyMinor:optionalMinor(form,"monthlyPrice"),yearlyMinor:optionalMinor(form,"yearlyPrice"),quarterlyMinor:null,active:form.get("active")==="on",popular:form.get("popular")==="on",badge:text(form,"badge")||null,sortOrder:Number(text(form,"sortOrder")),features:featureList(text(form,"features")),limits});revalidatePath("/admin/plans");revalidatePath("/register");return{ok:true,message:text(form,"id")?"Plan updated.":"Plan created."}}catch(error){const message=error instanceof AppError?error.message:error instanceof Error?error.message:"Unable to save plan";const field=message.toLowerCase().includes("slug")?"slug":message.toLowerCase().includes("sort order")?"sortOrder":message.toLowerCase().includes("name")?"name":undefined;return{ok:false,message,errors:field?{[field]:message}:undefined}}
}
export async function planOperationAction(form:FormData){const operation=text(form,"operation") as "DUPLICATE"|"ARCHIVE"|"ACTIVATE"|"DEACTIVATE";await managePlanOperation.execute(await email(),text(form,"id"),operation);revalidatePath("/admin/plans");revalidatePath("/register")}
export async function subscriptionAction(form:FormData){
 try{
  const action=String(form.get("action")) as "ACTIVATE"|"RENEW"|"SUSPEND"|"CANCEL";
  const saved=await manageSubscription.execute(await email(),{id:String(form.get("id")),action,duration:(String(form.get("duration")||"")||undefined) as ManualSubscriptionDuration|undefined});
  if(action==="RENEW")await getManualSubscriptionLifecycleService().sendRenewedById(saved.id);
  revalidatePath("/admin/subscriptions");revalidatePath("/workspace");
 }catch(error){throw new Error(error instanceof AppError?error.message:"Unable to update subscription")}
}
