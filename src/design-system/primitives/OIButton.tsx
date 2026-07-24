import type { ButtonHTMLAttributes } from "react";
import styles from "./primitives.module.css";
type Variant="primary"|"secondary"|"ghost"|"danger";
export default function OIButton({variant="primary",size="md",className="",...props}:{variant?:Variant;size?:"sm"|"md"|"lg";className?:string}&ButtonHTMLAttributes<HTMLButtonElement>){return <button className={`${styles.button} ${styles[variant]} ${styles[size]} ${className}`} {...props}/>;}
