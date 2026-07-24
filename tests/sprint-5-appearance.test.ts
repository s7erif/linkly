import { describe,expect,it } from "vitest";
import { appearancePresets,copyPreset } from "@/features/appearance/presets";
import { appearanceSettingsSchema } from "@/validation/appearance";
describe("Sprint 5 appearance presets",()=>{it("defines exactly the approved presets as valid appearance values",()=>{expect(appearancePresets.map(p=>p.name)).toEqual(["Default","Minimal","Dark","Luxury","Coffee","Ocean","Sunset"]);for(const preset of appearancePresets)expect(appearanceSettingsSchema.safeParse(preset.settings).success).toBe(true)});it("copies nested values before applying a preset",()=>{const first=copyPreset(appearancePresets[0]);first.colors.primary="#000000";expect(appearancePresets[0].settings.colors.primary).toBe("#1d4ed8")})});
