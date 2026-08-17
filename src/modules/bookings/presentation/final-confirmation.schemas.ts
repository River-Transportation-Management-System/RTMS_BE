import { z } from "zod";

const positiveId = z.coerce.number().int().positive();

export const finalConfirmationSchema = z.object({
  port_id: positiveId,
  confirmation_note: z.string().trim().max(2000).optional().nullable(),
});

export type FinalConfirmationInput = z.infer<typeof finalConfirmationSchema>;
