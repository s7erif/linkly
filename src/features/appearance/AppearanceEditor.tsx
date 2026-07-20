"use client";
import { useEffect,useState } from "react";
import type { PublicCardDTO } from "@/dto";
import type { AppearanceSettings } from "@/types/appearance";
import { DefaultTheme } from "@/components/themes/DefaultTheme";
import { fetchPublicCard } from "@/features/public-card/public-card-client";
import styles from "./appearance-editor.module.css";
const options=<T extends string>(values:readonly T[])=>values.map(value=><option key={value} value={value}>{value.toLowerCase()}</option>);
export function AppearanceEditor({slug}:{slug:string}){
 const [card,setCard]=useState<PublicCardDTO|null>(null),[draft,setDraft]=useState<AppearanceSettings|null>(null),[message,setMessage]=useState("");
 useEffect(()=>{fetchPublicCard(slug).then(value=>{setCard(value);setDraft(value.appearance)}).catch(e=>setMessage(e instanceof Error?e.message:"Unable to load card"))},[slug]);
 const patch=<K extends keyof AppearanceSettings>(key:K,value:AppearanceSettings[K])=>setDraft(current=>current?{...current,[key]:value}:current);
 async function save(){if(!card||!draft)return;const token=sessionStorage.getItem("oi_editor_session_token");if(!token){setMessage("Create an editor session before saving.");return}setMessage("Saving…");const response=await fetch(`/cards/${card.id}/appearance`,{method:"PUT",headers:{"content-type":"application/json"},body:JSON.stringify({sessionToken:token,appearance:draft})});setMessage(response.ok?"Appearance saved.":"Unable to save appearance.")}
 if(!card||!draft)return <main aria-busy={!message}>{message||"Loading editor…"}</main>;
 return <main className={styles.layout}><form className={styles.controls} onSubmit={e=>{e.preventDefault();void save()}}><h1>Appearance</h1>
 <fieldset><legend>Colors</legend>{(["primary","accent","text","mutedText"] as const).map(key=><label key={key}>{key}<input type="color" value={draft.colors[key]} onChange={e=>patch("colors",{...draft.colors,[key]:e.target.value})}/></label>)}</fieldset>
 <fieldset><legend>Background</legend><label>Style<select value={draft.background.style} onChange={e=>patch("background",{...draft.background,style:e.target.value as AppearanceSettings["background"]["style"]})}>{options(["SOLID","GRADIENT"] as const)}</select></label>{(["color","gradientFrom","gradientTo"] as const).map(key=><label key={key}>{key}<input type="color" value={draft.background[key]} onChange={e=>patch("background",{...draft.background,[key]:e.target.value})}/></label>)}</fieldset>
 <label>Typography<select value={draft.typography} onChange={e=>patch("typography",e.target.value as AppearanceSettings["typography"])}>{options(["SYSTEM","SANS","SERIF"] as const)}</select></label><label>Button style<select value={draft.buttonStyle} onChange={e=>patch("buttonStyle",e.target.value as AppearanceSettings["buttonStyle"])}>{options(["SOLID","OUTLINE","SOFT"] as const)}</select></label><label>Border radius<input type="range" min="0" max="32" value={draft.borderRadius} onChange={e=>patch("borderRadius",Number(e.target.value))}/></label><label>Shadow<select value={draft.shadow} onChange={e=>patch("shadow",e.target.value as AppearanceSettings["shadow"])}>{options(["NONE","SMALL","MEDIUM","LARGE"] as const)}</select></label>
 <fieldset><legend>Section visibility</legend>{(Object.keys(draft.sections) as Array<keyof AppearanceSettings["sections"]>).map(key=><label key={key}><input type="checkbox" checked={draft.sections[key]} onChange={e=>patch("sections",{...draft.sections,[key]:e.target.checked})}/>{key}</label>)}</fieldset><button type="submit">Save appearance</button><p role="status">{message}</p></form><section className={styles.preview} aria-label="Live preview"><DefaultTheme card={card} appearance={draft}/></section></main>;
}
