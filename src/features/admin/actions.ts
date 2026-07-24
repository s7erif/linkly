"use server";
import { getServerSession } from "next-auth/next";
import type {AuthOptions} from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAccessCodeUseCases } from "@/lib/composition-root";
import { AppError } from "@/lib/errors";
import { revalidatePath } from "next/cache";
import { authorizeAdminAction } from "@/lib/composition-root";
export type IssueCardResult={ok:true;code:string;version:number;expiresAt:string|null}|{ok:false;message:string};
export async function issueInitialCardAccessCode(cardId:string):Promise<IssueCardResult>{const session=await getServerSession(authOptions as AuthOptions);if(!session?.user)return {ok:false,message:"Administrator authentication is required."};try{const issued=await getAccessCodeUseCases().regenerateAccessCode.execute(session.user.email!,{cardId,expiresAt:null});return {ok:true,code:issued.code,version:issued.accessCode.version,expiresAt:issued.accessCode.expiresAt?.toISOString()??null}}catch(error){return {ok:false,message:error instanceof AppError?error.message:"Unable to issue this card."}}}

export async function revokeCardAccessCode(cardId:string):Promise<{ok:true}|{ok:false;message:string}>{const session=await getServerSession(authOptions as AuthOptions);if(!session?.user?.email)return {ok:false,message:"Administrator authentication is required."};try{await authorizeAdminAction.execute(session.user.email,"ACCESS_CODE_MANAGE");await getAccessCodeUseCases().revokeAccessCode.execute(cardId);revalidatePath("/admin/access-codes");revalidatePath(`/admin/cards/${cardId}`);return {ok:true}}catch(error){return {ok:false,message:error instanceof AppError?error.message:"Unable to disable this access code."}}}
