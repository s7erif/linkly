import {CreateCardFlow} from "@/features/card-order/CreateCardFlow";
import mStyles from "@/features/marketing/marketing.module.css";
import styles from "@/features/card-order/create-card-flow.module.css";
import {logger} from "@/lib/logger";
import { getCurrentLocale } from "@/i18n/server";
import { getDictionary } from "@/i18n/dictionaries";
import {listActivePlans,platformSettingsService} from "@/lib/composition-root";

export async function generateMetadata() {
  const locale = await getCurrentLocale();
  const dict = await getDictionary(locale);
  return { 
    title: dict.registerPage?.headline || "Create Your Card",
    description: dict.registerPage?.subtitle || "Start your digital business card experience."
  };
}

function Unavailable({error=false, dict}:{error?:boolean, dict: any}){return <section className={styles.planUnavailable} role={error?"alert":"status"}><h2>{error?dict.registerPage?.unavailable?.errorTitle || "Plans are temporarily unavailable.":dict.registerPage?.unavailable?.emptyTitle || "No subscription plans are currently available."}</h2><p>{error?dict.registerPage?.unavailable?.errorDesc || "Please try again shortly.":dict.registerPage?.unavailable?.emptyDesc || "Please check back soon for available options."}</p></section>}

export default async function RegisterPage(){
  const locale = await getCurrentLocale();
  const dict = await getDictionary(locale);
 let data;
 try{const[plans,settings]=await Promise.all([listActivePlans.execute(),platformSettingsService.load()]);data={plans:plans.map(plan=>({...plan,currency:settings.general.currency})),currency:settings.general.currency}}
 catch(error){logger.error("Registration plans failed to load",error,{route:"/register"});return (
      <main className={mStyles.landing}>
        <div className={mStyles.auroraBg} aria-hidden="true" />
        <div className="relative z-10">
          <header className={styles.pageHero}>
            <h1 className={styles.headline}>{dict.registerPage?.headline || "Let's build your digital identity."}</h1>
            <p className={styles.subtitle}>{dict.registerPage?.subtitle || "Set up your profile, choose your card, and launch your premium presence."}</p>
          </header>
          <Unavailable error dict={dict} />
        </div>
      </main>
    );}
 return (
    <main className={mStyles.landing}>
      <div className={mStyles.auroraBg} aria-hidden="true" />
      <div className="relative z-10">
        <header className={styles.pageHero}>
          <h1 className={styles.headline}>{dict.registerPage?.headline || "Let's build your digital identity."}</h1>
          <p className={styles.subtitle}>{dict.registerPage?.subtitle || "Set up your profile, choose your card, and launch your premium presence."}</p>
        </header>
        {data.plans.length ? <CreateCardFlow plans={data.plans} currency={data.currency} /> : <Unavailable dict={dict} />}
      </div>
    </main>
  );
}
