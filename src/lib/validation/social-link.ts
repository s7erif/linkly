import { z } from "zod";
import { CONSTANTS } from "../constants";

export const socialLinkSchema = z.object({
  platform: z.enum(CONSTANTS.SUPPORTED_SOCIAL_PLATFORMS, {
    message: "Unsupported social platform"
  }),
  url: z.string().url("Invalid social platform URL").max(2000),
  order: z.number().int().min(0).default(0),
});

export const socialLinkUpdateSchema = socialLinkSchema.partial();

export const socialLinkArraySchema = z.array(socialLinkSchema);

export type SocialLinkInput = z.infer<typeof socialLinkSchema>;


