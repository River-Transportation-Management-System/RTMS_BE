import { z } from "zod";

export const vesselMatchResponseSchema = z.object({
  response_status: z.enum(["ACCEPT", "REJECT"]),
  reason: z.string().trim().max(2000).optional().nullable(),
});

export type VesselMatchResponseInput = z.infer<typeof vesselMatchResponseSchema>;
