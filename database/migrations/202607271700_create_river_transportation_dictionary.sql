BEGIN;

-- 1) Role
CREATE TABLE IF NOT EXISTS role (
  role_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  role_name VARCHAR(100),
  role_code VARCHAR(50)
);

-- 2) User
CREATE TABLE IF NOT EXISTS "user" (
  user_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_name VARCHAR(120),
  user_pwd VARCHAR(255),
  user_phone VARCHAR(30),
  user_email VARCHAR(150),
  user_status VARCHAR(30),
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  role_id INTEGER NOT NULL REFERENCES role(role_id)
);

CREATE INDEX IF NOT EXISTS idx_user_role_id ON "user"(role_id);
CREATE INDEX IF NOT EXISTS idx_user_email ON "user"(user_email);

-- 3) Vessel
CREATE TABLE IF NOT EXISTS vessel (
  vessel_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  vessel_owner_name VARCHAR(150),
  vessel_status VARCHAR(30),
  vessel_capacity DECIMAL(14, 2),
  vessel_cargo_type VARCHAR(80),
  user_id INTEGER UNIQUE REFERENCES "user"(user_id)
);

CREATE INDEX IF NOT EXISTS idx_vessel_status ON vessel(vessel_status);

-- 5) Route
CREATE TABLE IF NOT EXISTS route (
  route_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  route_code VARCHAR(80),
  updated_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);

-- 6) Port
CREATE TABLE IF NOT EXISTS port (
  port_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  port_name VARCHAR(150),
  port_geo GEOGRAPHY(Point, 4326),
  user_id INTEGER REFERENCES "user"(user_id)
);

CREATE INDEX IF NOT EXISTS idx_port_geo ON port USING GIST (port_geo);

-- 4) Booking
CREATE TABLE IF NOT EXISTS booking (
  booking_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  booking_date TIMESTAMPTZ,
  receive_date TIMESTAMPTZ,
  expected_date TIMESTAMPTZ,
  expired_date TIMESTAMPTZ,
  booking_status VARCHAR(40),
  cargo_type VARCHAR(80),
  cargo_capacity DECIMAL(14, 2),
  user_id INTEGER REFERENCES "user"(user_id),
  route_id INTEGER REFERENCES route(route_id)
);

CREATE INDEX IF NOT EXISTS idx_booking_user_id ON booking(user_id);
CREATE INDEX IF NOT EXISTS idx_booking_route_id ON booking(route_id);
CREATE INDEX IF NOT EXISTS idx_booking_status ON booking(booking_status);

-- 9) BookingReview
CREATE TABLE IF NOT EXISTS booking_review (
  review_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  booking_id INTEGER REFERENCES booking(booking_id),
  port_id INTEGER REFERENCES port(port_id),
  review_status VARCHAR(40),
  review_date TIMESTAMPTZ,
  CONSTRAINT uq_booking_review_booking_port UNIQUE (booking_id, port_id)
);

CREATE INDEX IF NOT EXISTS idx_booking_review_status ON booking_review(review_status);

-- 7) Shipment
CREATE TABLE IF NOT EXISTS shipment (
  shipment_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  shipment_status VARCHAR(40),
  shipment_date TIMESTAMPTZ,
  vessel_id INTEGER REFERENCES vessel(vessel_id),
  review_id INTEGER REFERENCES booking_review(review_id)
);

CREATE INDEX IF NOT EXISTS idx_shipment_vessel_id ON shipment(vessel_id);

-- 8) RoutePort
CREATE TABLE IF NOT EXISTS route_port (
  routeport_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  route_id INTEGER REFERENCES route(route_id),
  port_id INTEGER REFERENCES port(port_id),
  CONSTRAINT uq_route_port UNIQUE (route_id, port_id)
);

CREATE INDEX IF NOT EXISTS idx_route_port_route_id ON route_port(route_id);
CREATE INDEX IF NOT EXISTS idx_route_port_port_id ON route_port(port_id);

-- 10) VesselMatch
CREATE TABLE IF NOT EXISTS vessel_match (
  match_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  vessel_id INTEGER REFERENCES vessel(vessel_id),
  booking_id INTEGER REFERENCES booking(booking_id)
);

CREATE INDEX IF NOT EXISTS idx_vessel_match_vessel_id ON vessel_match(vessel_id);
CREATE INDEX IF NOT EXISTS idx_vessel_match_booking_id ON vessel_match(booking_id);

COMMIT;
