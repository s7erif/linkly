import type { PlatformManagementRepository } from "@/repositories/platform-management.repository";
import { defaultPlatformSettings, type PlatformSettings } from "@/types/platform-settings";
import { platformSettingsSchema } from "@/validation/platform-settings";
import { parseUseCaseInput } from "@/use-cases/shared";
export class PlatformSettingsService {
 constructor(private readonly repository:PlatformManagementRepository){}
 async load():Promise<PlatformSettings>{const stored=await this.repository.getPlatformSettings();return stored?platformSettingsSchema.parse(stored):defaultPlatformSettings}
 async save(input:unknown):Promise<PlatformSettings>{const value=parseUseCaseInput(platformSettingsSchema,input);return this.repository.savePlatformSettings(value)}
}
