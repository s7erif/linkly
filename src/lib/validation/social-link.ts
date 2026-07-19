import { z } from "zod";
import { CONSTANTS } from "../constants";
import { urlValidator } from "./common";

export const socialLinkSchema = z.object({
  platform: z.enum(CONSTANTS.SUPPORTED_SOCIAL_PLATFORMS, {
    errorMap: () => ({ message: "Unsupported social platform" })
  }),
  url: urlValidator.refine((val) => val !== "", {
    message: "URL cannot be empty for a social link"
  }),
  order: z.number().int().min(0).default(0),
});

export const socialLinkUpdateSchema = socialLinkSchema.partial();
