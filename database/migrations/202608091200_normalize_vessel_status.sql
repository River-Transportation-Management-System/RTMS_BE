BEGIN;

ALTER TABLE vessel
  DROP CONSTRAINT IF EXISTS chk_vessel_status;

ALTER TABLE vessel
  ALTER COLUMN vessel_status DROP DEFAULT;

-- Preserve the meaning of existing values while reducing the status set.
UPDATE vessel
SET vessel_status = CASE
  WHEN vessel_status IN ('AVAILABLE', 'ACTIVE') THEN 'ACTIVE'
  ELSE 'INACTIVE'
END;

-- A vessel assigned to an unfinished shipment cannot receive a new order.
UPDATE vessel AS v
SET vessel_status = 'INACTIVE'
WHERE EXISTS (
  SELECT 1
  FROM shipment AS s
  WHERE s.vessel_id = v.vessel_id
    AND s.shipment_status IN ('PLANNED', 'LOADING', 'IN_TRANSIT')
);

ALTER TABLE vessel
  ALTER COLUMN vessel_status SET DEFAULT 'ACTIVE',
  ALTER COLUMN vessel_status SET NOT NULL;

ALTER TABLE vessel
  ADD CONSTRAINT chk_vessel_status
  CHECK (vessel_status IN ('ACTIVE', 'INACTIVE'));

COMMIT;
