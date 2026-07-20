import { AppearanceEditor } from "@/features/appearance/AppearanceEditor";
export default async function AppearancePage({params}:{params:Promise<{slug:string}>}){const {slug}=await params;return <AppearanceEditor slug={slug}/>;}
