"use client";
import { useEffect,useState } from "react";
import type { PublicCardDTO } from "@/dto";
import { DefaultTheme } from "@/components/themes/DefaultTheme";
import { fetchPublicCard } from "./public-card-client";
export function PublicCardExperience({slug}:{slug:string}){
 const [card,setCard]=useState<PublicCardDTO|null>(null);const [error,setError]=useState<string|null>(null);
 useEffect(()=>{const controller=new AbortController();fetchPublicCard(slug,controller.signal).then(setCard).catch(error=>{if(error instanceof Error&&error.name!=="AbortError")setError(error.message)});return()=>controller.abort()},[slug]);
 if(error)return <main role="alert">{error}</main>;if(!card)return <main aria-busy="true">Loading card…</main>;
 return <DefaultTheme card={card} appearance={card.appearance}/>;
}
