import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import { Search } from "lucide-react";
import styles from "./primitives.module.css";
export function OIIconButton({label,children,...props}:{label:string;children:ReactNode}&ButtonHTMLAttributes<HTMLButtonElement>){return <button className={styles.iconButton} aria-label={label} {...props}>{children}</button>;}
export function OIField({label,children,description,error}:{label:string;children:ReactNode;description?:string;error?:string}){return <label className={styles.field}><span>{label}</span>{children}{description&&<small className={styles.description}>{description}</small>}{error&&<small className={styles.error}>{error}</small>}</label>;}
export function OISearchInput(props:InputHTMLAttributes<HTMLInputElement>){return <div className={styles.search}><Search size={16} aria-hidden/><input aria-label="Search" placeholder="Search" {...props}/></div>;}
