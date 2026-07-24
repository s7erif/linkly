import {CreateCardFlow} from "@/features/card-order/CreateCardFlow";
import styles from "@/features/marketing/marketing.module.css";
import {listActivePlans,platformSettingsService} from "@/lib/composition-root";
import {logger} from "@/lib/logger";

export const metadata={title:"Create Your Card",description:"Start your digital business card experience."};

function Unavailable({error=false}:{error?:boolean}){return <section className={styles.planUnavailable} role={error?"alert":"status"}><h2>{error?"Plans are temporarily unavailable.":"No subscription plans are currently available."}</h2><p>{error?"Please try again shortly.":"Please check back soon for available options."}</p></section>}

export default async function RegisterPage(){
 let data;
 try{const[plans,settings]=await Promise.all([listActivePlans.execute(),platformSettingsService.load()]);data={plans:plans.map(plan=>({...plan,currency:settings.general.currency})),currency:settings.general.currency}}
 catch(error){logger.error("Registration plans failed to load",error,{route:"/register"});return <main className={styles.publicPage}><header className={styles.pageHero}><span className={styles.pill}><i/> Start your Card</span><h1>Create a card that feels like you.</h1><p>Choose the plan that fits your needs.</p></header><Unavailable error/></main>}
 return <main className={styles.publicPage}><header className={styles.pageHero}><span className={styles.pill}><i/> Start your Card</span><h1>Create a card that feels like you.</h1><p>Choose the plan that fits your needs.</p></header>{data.plans.length?<CreateCardFlow plans={data.plans} currency={data.currency}/>:<Unavailable/>}</main>
}
