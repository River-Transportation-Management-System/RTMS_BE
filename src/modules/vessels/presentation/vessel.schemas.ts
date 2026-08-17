import { z } from "zod";

import { VESSEL_STATUSES } from "@/modules/vessels/domain/vessel.entity";
import { DEFAULT_LIMIT, DEFAULT_PAGE, MAX_LIMIT } from "@/shared/http/pagination";

const positiveId = z.coerce.number().int().positive();
const vesselStatus = z.enum(VESSEL_STATUSES);
const capacity = z.union([z.number(), z.string()]);

export const createVesselSchema = z.object({
  vessel_owner_name: z.string().trim().min(1).max(150),
  vessel_capacity: capacity,
  vessel_cargo_type: z.string().trim().min(1).max(80),
  vessel_status: vesselStatus,
  user_id: positiveId,
});

export const updateVesselSchema = z
  .object({
    vessel_owner_name: z.string().trim().min(1).max(150).optional(),
    vessel_capacity: capacity.optional(),
    vessel_cargo_type: z.string().trim().min(1).max(80).optional(),
    vessel_status: vesselStatus.optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one editable field is required",
  });

export const listVesselsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(DEFAULT_PAGE),
  limit: z.coerce.number().int().positive().max(MAX_LIMIT).default(DEFAULT_LIMIT),
  vessel_status: vesselStatus.optional(),
  vessel_cargo_type: z.string().trim().min(1).max(80).optional(),
  user_id: positiveId.optional(),
});

export type CreateVesselInput = z.infer<typeof createVesselSchema>;
export type UpdateVesselInput = z.infer<typeof updateVesselSchema>;
export type ListVesselsQuery = z.infer<typeof listVesselsQuerySchema>;
