import { PublicCardExperience } from "@/features/public-card/PublicCardExperience";
export default async function PublicCardPage({params}:{params:Promise<{slug:string}>}){const {slug}=await params;return <PublicCardExperience slug={slug}/>;}
