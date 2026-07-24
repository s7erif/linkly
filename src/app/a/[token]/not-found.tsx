import Link from "next/link";
import styles from "@/features/activation/activation.module.css";
export default function ActivationNotFound() { return <main className={styles.page}><section className={styles.unavailable}><h1>Activation link unavailable</h1><p>This activation link is invalid, expired, cancelled, or already used.</p><Link href="/">Return home</Link></section></main>; }
