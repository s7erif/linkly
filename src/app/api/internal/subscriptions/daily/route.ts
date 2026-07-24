import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { getManualSubscriptionLifecycleService } from "@/lib/composition-root";
import { getEnvironment } from "@/lib/env";

const equal=(left:string,right:string)=>{const a=Buffer.from(left),b=Buffer.from(right);return a.length===b.length&&timingSafeEqual(a,b)};
export async function POST(request:Request){
 const secret=getEnvironment().SUBSCRIPTION_CRON_SECRET;
 if(!secret)return NextResponse.json({success:false,message:"Subscription scheduler is not configured"},{status:503});
 const authorization=request.headers.get("authorization")??"";
 if(!authorization.startsWith("Bearer ")||!equal(authorization.slice(7),secret))return NextResponse.json({success:false,message:"Unauthorized"},{status:401});
 const result=await getManualSubscriptionLifecycleService().runDaily();
 return NextResponse.json({success:true,data:result});
}
