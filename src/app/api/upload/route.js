import { NextResponse } from "next/server";
import { mediaService } from "@/lib/composition-root";
const allowed = new Set(["image/jpeg","image/png","image/webp"]);
export async function POST(req) {
  try { const form=await req.formData(); const file=form.get("file"); if(!(file instanceof File)) return NextResponse.json({message:"No file provided"},{status:400}); if(!allowed.has(file.type)) return NextResponse.json({message:"Only JPG, PNG, and WEBP files are supported"},{status:415}); if(file.size>10*1024*1024) return NextResponse.json({message:"File exceeds the 10 MB limit"},{status:413}); const extension=(file.name.split(".").pop()||"bin").toLowerCase(); const result=await mediaService.uploadForAcquisition({fileName:file.name,originalFilename:file.name,contentType:file.type,byteSize:file.size,extension,body:new Uint8Array(await file.arrayBuffer())}); return NextResponse.json({mediaAssetId:result.id,publicUrl:result.publicUrl,metadata:result}); } catch(error){return NextResponse.json({message:error instanceof Error?error.message:"Upload failed"},{status:400})}
}
