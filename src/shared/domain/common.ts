export type EntityId = number;

export type Timestamp = Date;

export type Nullable<T> = T | null;

export type SoftDeleteTimestamps = {
  createdAt?: Nullable<Timestamp>;
  updatedAt?: Nullable<Timestamp>;
  deletedAt?: Nullable<Timestamp>;
};
