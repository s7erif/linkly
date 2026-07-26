import {CreateCardFlow} from "@/features/card-order/CreateCardFlow";
import mStyles from "@/features/marketing/marketing.module.css";
import styles from "@/features/card-order/create-card-flow.module.css";
import {listActivePlans,platformSettingsService} from "@/lib/composition-root";
import {logger} from "@/lib/logger";

export const metadata={title:"Create Your Card",description:"Start your digital business card experience."};

function Unavailable({error=false}:{error?:boolean}){return <section className={styles.planUnavailable} role={error?"alert":"status"}><h2>{error?"Plans are temporarily unavailable.":"No subscription plans are currently available."}</h2><p>{error?"Please try again shortly.":"Please check back soon for available options."}</p></section>}

export default async function RegisterPage(){
 let data;
 try{const[plans,settings]=await Promise.all([listActivePlans.execute(),platformSettingsService.load()]);data={plans:plans.map(plan=>({...plan,currency:settings.general.currency})),currency:settings.general.currency}}
 catch(error){logger.error("Registration plans failed to load",error,{route:"/register"});return (
      <main className={mStyles.landing}>
        <div className={mStyles.auroraBg} aria-hidden="true" />
        <div className="relative z-10">
          <header className={styles.pageHero}>
            <h1 className={styles.headline}>Let&apos;s build your digital identity.</h1>
            <p className={styles.subtitle}>Set up your profile, choose your card, and launch your premium presence.</p>
          </header>
          <Unavailable error />
        </div>
      </main>
    );}
 return (
    <main className={mStyles.landing}>
      <div className={mStyles.auroraBg} aria-hidden="true" />
      <div className="relative z-10">
        <header className={styles.pageHero}>
          <h1 className={styles.headline}>Let&apos;s build your digital identity.</h1>
          <p className={styles.subtitle}>Set up your profile, choose your card, and launch your premium presence.</p>
        </header>
        {data.plans.length ? <CreateCardFlow plans={data.plans} currency={data.currency} /> : <Unavailable />}
      </div>
    </main>
  );
}
