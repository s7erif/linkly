import type { ReactNode } from "react";
import styles from "./primitives.module.css";
export function OIBadge({children,tone="neutral"}:{children:ReactNode;tone?:"neutral"|"success"|"warning"|"danger"|"info"}){return <span className={`${styles.badge} ${styles[tone]}`}>{children}</span>;}
export function OIAvatar({name,src}:{name:string;src?:string}){return src?<img className={styles.avatar} src={src} alt=""/>:<span className={styles.avatar} aria-label={name}>{name.trim().slice(0,2).toUpperCase()}</span>;}
export function OISkeleton({className=""}:{className?:string}){return <span className={`${styles.skeleton} ${className}`} aria-hidden/>;}
export function OIEmptyState({title,description,action}:{title:string;description:string;action?:ReactNode}){return <div className={styles.empty}><span className={styles.emptyMark} aria-hidden>—</span><h3>{title}</h3><p>{description}</p>{action}</div>;}
