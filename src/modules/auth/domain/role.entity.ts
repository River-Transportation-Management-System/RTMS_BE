import type { EntityId, Nullable } from "@/shared/domain/common";

export type RoleCode = "ADMIN" | "VESSEL_OWNER" | "CUSTOMER" | "PORT_STAFF" | string;

export interface RoleEntity {
  roleId: EntityId;
  roleName: Nullable<string>;
  roleCode: Nullable<RoleCode>;
}
