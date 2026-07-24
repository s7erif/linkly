"use client";
import { useState } from "react"; import styles from "./admin-records.module.css";
export function UploadZone(){return <label className={styles.uploadZone}>Drop images here or <span>browse files</span><input type="file" accept="image/png,image/jpeg,image/webp,image/avif,image/svg+xml" multiple hidden/></label>}
export function MediaGrid(){const [selected,setSelected]=useState<string|null>(null);return <div className={styles.mediaGrid}>{["No uploaded assets yet"].map(item=><button type="button" className={styles.mediaEmpty} key={item} onClick={()=>setSelected(item)}>{item}{selected&&<small>Selected: {selected}</small>}</button>)}</div>}
export function MediaPicker({onSelect}:{onSelect?:(id:string)=>void}){return <div className={styles.mediaPicker}><strong>Select media</strong><MediaGrid/><button type="button" className={styles.secondary} onClick={()=>onSelect?.("")}>Choose existing asset</button></div>}
