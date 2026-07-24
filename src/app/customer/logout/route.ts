import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getActivationService } from "@/lib/composition-root";
export async function POST(request:Request){const store=await cookies(),token=store.get("oi_customer_session")?.value;if(token)await getActivationService().logout(token);store.delete("oi_customer_session");return NextResponse.redirect(new URL("/",request.url),303);}
