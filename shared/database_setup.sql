-- 1. Bookings Table
CREATE TABLE IF NOT EXISTS bookings
(
    id UUID NOT NULL PRIMARY KEY,
    parent_id UUID,
    offer_id UUID,
    group_id UUID,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITHOUT TIME ZONE,
    updated_at TIMESTAMP WITHOUT TIME ZONE,
    cancelled_at TIMESTAMP WITHOUT TIME ZONE,
    type VARCHAR(255), -- 'MONTH' or 'DAY'
    is_cancelled BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT FALSE,
    is_accepted BOOLEAN DEFAULT FALSE
);

-- 2. Ride Passengers Table
CREATE TABLE IF NOT EXISTS ride_passangers
(
    id UUID NOT NULL PRIMARY KEY,
    ride_id UUID,
    child_id UUID,
    booking_id UUID,
    date DATE,
    morning_attendance BOOLEAN DEFAULT TRUE,
    afternoon_attendance BOOLEAN DEFAULT TRUE
);


CREATE TABLE IF NOT EXISTS afternoon_otps
(
    id UUID NOT NULL PRIMARY KEY,
    group_id UUID NOT NULL,
    child_id UUID NOT NULL,
    pin VARCHAR(6) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE,
    active_date DATE NOT NULL,
    CONSTRAINT uc_afternoon_otps UNIQUE (group_id, child_id, active_date)
);

CREATE TABLE IF NOT EXISTS verification_logs
(
    id UUID NOT NULL PRIMARY KEY,
    verification_type VARCHAR(50), -- 'morning_otp', 'afternoon_otp', 'morning_qr', 'afternoon_qr'
    ride_id UUID,
    group_id UUID,
    child_id UUID, -- NULL for morning grouped verifications
    status VARCHAR(50),
    verified_at TIMESTAMP WITHOUT TIME ZONE,
    location_lat DECIMAL,
    location_lng DECIMAL
);
