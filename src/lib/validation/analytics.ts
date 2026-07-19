import { z } from "zod";

export const analyticsSchema = z.object({
  pageViews: z.number().int().min(0),
  qrScans: z.number().int().min(0),
  linkClicks: z.number().int().min(0),
});
