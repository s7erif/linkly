import type { InputHTMLAttributes } from "react";
import styles from "./primitives.module.css";
export default function OIInput({label,error,className="",...props}:{label?:string;error?:string;className?:string}&InputHTMLAttributes<HTMLInputElement>){return <label className={`${styles.field} ${className}`}>{label&&<span>{label}</span>}<input className={styles.input} aria-invalid={Boolean(error)||undefined} {...props}/>{error&&<small className={styles.error}>{error}</small>}</label>;}
