import {listAllPlans,platformSettingsService} from "@/lib/composition-root";
import {PlansManager} from "@/features/admin/PlansManager";
export default async function PlansPage(){const[plans,settings]=await Promise.all([listAllPlans.execute(),platformSettingsService.load()]);return <PlansManager plans={plans} defaultCurrency={settings.general.currency}/>}
