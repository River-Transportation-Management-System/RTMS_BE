import { z } from "zod";

const positiveId = z.coerce.number().int().positive();

export const createPortReviewSchema = z.object({
  port_id: positiveId,
  review_status: z.enum(["PENDING", "APPROVED", "REJECTED", "REQUIRES_UPDATE"]),
  review_note: z.string().trim().max(2000).optional().nullable(),
});

export type CreatePortReviewInput = z.infer<typeof createPortReviewSchema>;
