import type { EntityId, Nullable, SoftDeleteTimestamps } from "@/shared/domain/common";

export type UserStatus = "ACTIVE" | "INACTIVE" | "LOCKED" | string;

export interface UserEntity extends SoftDeleteTimestamps {
  userId: EntityId;
  userName: Nullable<string>;
  userPwd: Nullable<string>;
  userPhone: Nullable<string>;
  userEmail: Nullable<string>;
  userStatus: Nullable<UserStatus>;
  roleId: EntityId;
}
