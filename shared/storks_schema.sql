CREATE TABLE assets
(
    asset_id  UUID NOT NULL,
    type      VARCHAR(255),
    asset_url VARCHAR(255),
    CONSTRAINT pk_assets PRIMARY KEY (asset_id)
);

CREATE TABLE cards
(
    card_id          UUID         NOT NULL,
    card_number      VARCHAR(255) NOT NULL,
    card_holder_name VARCHAR(255) NOT NULL,
    active           BOOLEAN      NOT NULL,
    is_primary       BOOLEAN      NOT NULL,
    parent_id        UUID,
    CONSTRAINT pk_cards PRIMARY KEY (card_id)
);

CREATE TABLE chat_room_participants
(
    id         UUID NOT NULL,
    room_id    UUID NOT NULL,
    user_id    UUID NOT NULL,
    joined_at  TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_removed BOOLEAN DEFAULT FALSE,
    CONSTRAINT pk_chat_room_participants PRIMARY KEY (id)
);

CREATE TABLE chat_rooms
(
    room_id        UUID    NOT NULL,
    chat_room_type VARCHAR(255),
    offer_id       UUID,
    created_at     TIMESTAMP WITHOUT TIME ZONE,
    updated_at     TIMESTAMP WITHOUT TIME ZONE,
    deleted_at     TIMESTAMP WITHOUT TIME ZONE,
    is_deleted     BOOLEAN NOT NULL,
    CONSTRAINT pk_chat_rooms PRIMARY KEY (room_id)
);

CREATE TABLE child_groups
(
    group_id                    UUID NOT NULL,
    parent_id                   UUID,
    pickup_location_id          UUID,
    default_dropoff_location_id UUID,
    ride_id                     UUID,
    CONSTRAINT pk_child_groups PRIMARY KEY (group_id)
);

CREATE TABLE children
(
    child_id       UUID NOT NULL,
    parent_id      UUID,
    first_name     VARCHAR(255),
    last_name      VARCHAR(255),
    preferred_name VARCHAR(255),
    pronouns       VARCHAR(255),
    grade          VARCHAR(255),
    group_id       UUID,
    qr_hash        VARCHAR(255),
    CONSTRAINT pk_children PRIMARY KEY (child_id)
);

CREATE TABLE driver_licences
(
    license_id     UUID NOT NULL,
    license_number VARCHAR(255),
    created_at     TIMESTAMP WITHOUT TIME ZONE,
    updated_at     TIMESTAMP WITHOUT TIME ZONE,
    driver_id      UUID,
    CONSTRAINT pk_driver_licences PRIMARY KEY (license_id)
);

CREATE TABLE driver_secondary_phones
(
    driver_id    UUID         NOT NULL,
    country_code VARCHAR(255) NOT NULL,
    number       VARCHAR(255) NOT NULL,
    "primary"    BOOLEAN,
    is_validated BOOLEAN,
    added_at     TIMESTAMP WITHOUT TIME ZONE,
    updated_at   TIMESTAMP WITHOUT TIME ZONE
);

CREATE TABLE drivers
(
    user_id      UUID         NOT NULL,
    country_code VARCHAR(255) NOT NULL,
    number       VARCHAR(255) NOT NULL,
    "primary"    BOOLEAN      NOT NULL,
    is_validated BOOLEAN      NOT NULL,
    added_at     TIMESTAMP WITHOUT TIME ZONE,
    updated_at   TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT pk_drivers PRIMARY KEY (user_id)
);

CREATE TABLE locations
(
    location_id UUID    NOT NULL,
    address     VARCHAR(255),
    is_verified BOOLEAN NOT NULL,
    latitude    DECIMAL NOT NULL,
    longitude   DECIMAL NOT NULL,
    nickname    VARCHAR(255),
    CONSTRAINT pk_locations PRIMARY KEY (location_id)
);

CREATE TABLE message_read_by
(
    message_id UUID NOT NULL,
    user_id    UUID NOT NULL
);

CREATE TABLE messages
(
    message_id UUID    NOT NULL,
    room_id    UUID,
    sent_at    TIMESTAMP WITHOUT TIME ZONE,
    sender_id  UUID,
    content    VARCHAR(255),
    is_deleted BOOLEAN NOT NULL,
    deleted_at TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT pk_messages PRIMARY KEY (message_id)
);

CREATE TABLE offer_destinations
(
    location_id UUID NOT NULL,
    offer_id    UUID NOT NULL
);

CREATE TABLE offers
(
    offer_id                     UUID             NOT NULL,
    driver_id                    UUID,
    vehicle_id                   UUID,
    is_using_intelligent_pricing BOOLEAN          NOT NULL,
    price_per_month              DOUBLE PRECISION NOT NULL,
    price_per_day                DOUBLE PRECISION NOT NULL,
    CONSTRAINT pk_offers PRIMARY KEY (offer_id)
);

CREATE TABLE parent_secondary_phones
(
    parent_id    UUID         NOT NULL,
    country_code VARCHAR(255) NOT NULL,
    number       VARCHAR(255) NOT NULL,
    "primary"    BOOLEAN,
    is_validated BOOLEAN,
    added_at     TIMESTAMP WITHOUT TIME ZONE,
    updated_at   TIMESTAMP WITHOUT TIME ZONE
);

CREATE TABLE parents
(
    user_id           UUID         NOT NULL,
    payment_preferred VARCHAR(255),
    country_code      VARCHAR(255) NOT NULL,
    number            VARCHAR(255) NOT NULL,
    "primary"         BOOLEAN      NOT NULL,
    is_validated      BOOLEAN      NOT NULL,
    added_at          TIMESTAMP WITHOUT TIME ZONE,
    updated_at        TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT pk_parents PRIMARY KEY (user_id)
);

CREATE TABLE ride_legs
(
    id         UUID NOT NULL,
    ride_id    UUID,
    type       SMALLINT,
    start_time TIMESTAMP WITHOUT TIME ZONE,
    end_time   TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT pk_ride_legs PRIMARY KEY (id)
);

CREATE TABLE rides
(
    ride_id   UUID         NOT NULL,
    driver_id UUID,
    status    VARCHAR(255) NOT NULL,
    offer_id  UUID,
    CONSTRAINT pk_rides PRIMARY KEY (ride_id)
);

CREATE TABLE schedules
(
    schedule_id         UUID NOT NULL,
    date                date,
    dropoff_location_id UUID,
    pickup_location_id  UUID,
    child_id            UUID,
    CONSTRAINT pk_schedules PRIMARY KEY (schedule_id)
);

CREATE TABLE users
(
    user_id          UUID         NOT NULL,
    user_type        VARCHAR(31)  NOT NULL,
    email            VARCHAR(255),
    first_name       VARCHAR(255),
    last_name        VARCHAR(255),
    provider_type    VARCHAR(255) NOT NULL,
    provider_user_id VARCHAR(255) NOT NULL,
    role             VARCHAR(255),
    created_at       TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at       TIMESTAMP WITHOUT TIME ZONE,
    last_logged_in   TIMESTAMP WITHOUT TIME ZONE,
    is_deleted       BOOLEAN      NOT NULL,
    CONSTRAINT pk_users PRIMARY KEY (user_id)
);

CREATE TABLE vehicle_assets
(
    asset_id   UUID NOT NULL,
    vehicle_id UUID NOT NULL
);

CREATE TABLE vehicles
(
    vehicle_id    UUID         NOT NULL,
    nickname      VARCHAR(255),
    license_plate VARCHAR(255) NOT NULL,
    driver_id     UUID,
    CONSTRAINT pk_vehicles PRIMARY KEY (vehicle_id)
);

ALTER TABLE vehicle_assets
    ADD CONSTRAINT uc_2d747ca0e53e8ffc3f989cd46 UNIQUE (asset_id);

ALTER TABLE schedules
    ADD CONSTRAINT uc_b56927d06adf4f2378c3f79fe UNIQUE (child_id, date);

ALTER TABLE cards
    ADD CONSTRAINT uc_cards_cardnumber UNIQUE (card_number);

ALTER TABLE driver_licences
    ADD CONSTRAINT uc_driver_licences_driver UNIQUE (driver_id);

ALTER TABLE offer_destinations
    ADD CONSTRAINT uc_offer_destinations_location UNIQUE (location_id);

ALTER TABLE offers
    ADD CONSTRAINT uc_offers_driver UNIQUE (driver_id);

ALTER TABLE offers
    ADD CONSTRAINT uc_offers_vehicle UNIQUE (vehicle_id);

ALTER TABLE vehicles
    ADD CONSTRAINT uc_vehicles_driver UNIQUE (driver_id);

ALTER TABLE vehicles
    ADD CONSTRAINT uc_vehicles_licenseplate UNIQUE (license_plate);

ALTER TABLE cards
    ADD CONSTRAINT FK_CARDS_ON_PARENT FOREIGN KEY (parent_id) REFERENCES parents (user_id);

ALTER TABLE chat_rooms
    ADD CONSTRAINT FK_CHAT_ROOMS_ON_OFFER FOREIGN KEY (offer_id) REFERENCES offers (offer_id);

ALTER TABLE children
    ADD CONSTRAINT FK_CHILDREN_ON_GROUP FOREIGN KEY (group_id) REFERENCES child_groups (group_id);

ALTER TABLE children
    ADD CONSTRAINT FK_CHILDREN_ON_PARENT FOREIGN KEY (parent_id) REFERENCES parents (user_id);

ALTER TABLE child_groups
    ADD CONSTRAINT FK_CHILD_GROUPS_ON_DEFAULT_DROPOFF_LOCATION FOREIGN KEY (default_dropoff_location_id) REFERENCES locations (location_id);

ALTER TABLE child_groups
    ADD CONSTRAINT FK_CHILD_GROUPS_ON_PARENT FOREIGN KEY (parent_id) REFERENCES parents (user_id);

ALTER TABLE child_groups
    ADD CONSTRAINT FK_CHILD_GROUPS_ON_PICKUP_LOCATION FOREIGN KEY (pickup_location_id) REFERENCES locations (location_id);

ALTER TABLE child_groups
    ADD CONSTRAINT FK_CHILD_GROUPS_ON_RIDE FOREIGN KEY (ride_id) REFERENCES rides (ride_id);

ALTER TABLE drivers
    ADD CONSTRAINT FK_DRIVERS_ON_USERID FOREIGN KEY (user_id) REFERENCES users (user_id);

ALTER TABLE driver_licences
    ADD CONSTRAINT FK_DRIVER_LICENCES_ON_DRIVER FOREIGN KEY (driver_id) REFERENCES drivers (user_id);

ALTER TABLE messages
    ADD CONSTRAINT FK_MESSAGES_ON_ROOM FOREIGN KEY (room_id) REFERENCES chat_rooms (room_id);

ALTER TABLE messages
    ADD CONSTRAINT FK_MESSAGES_ON_SENDER FOREIGN KEY (sender_id) REFERENCES users (user_id);

ALTER TABLE offers
    ADD CONSTRAINT FK_OFFERS_ON_DRIVER FOREIGN KEY (driver_id) REFERENCES drivers (user_id);

ALTER TABLE offers
    ADD CONSTRAINT FK_OFFERS_ON_VEHICLE FOREIGN KEY (vehicle_id) REFERENCES vehicles (vehicle_id);

ALTER TABLE parents
    ADD CONSTRAINT FK_PARENTS_ON_USERID FOREIGN KEY (user_id) REFERENCES users (user_id);

ALTER TABLE rides
    ADD CONSTRAINT FK_RIDES_ON_DRIVER FOREIGN KEY (driver_id) REFERENCES drivers (user_id);

ALTER TABLE rides
    ADD CONSTRAINT FK_RIDES_ON_OFFER FOREIGN KEY (offer_id) REFERENCES offers (offer_id);

ALTER TABLE ride_legs
    ADD CONSTRAINT FK_RIDE_LEGS_ON_RIDE FOREIGN KEY (ride_id) REFERENCES rides (ride_id);

ALTER TABLE schedules
    ADD CONSTRAINT FK_SCHEDULES_ON_CHILD FOREIGN KEY (child_id) REFERENCES children (child_id);

ALTER TABLE schedules
    ADD CONSTRAINT FK_SCHEDULES_ON_DROPOFF_LOCATION FOREIGN KEY (dropoff_location_id) REFERENCES locations (location_id);

ALTER TABLE schedules
    ADD CONSTRAINT FK_SCHEDULES_ON_PICKUP_LOCATION FOREIGN KEY (pickup_location_id) REFERENCES locations (location_id);

ALTER TABLE vehicles
    ADD CONSTRAINT FK_VEHICLES_ON_DRIVER FOREIGN KEY (driver_id) REFERENCES drivers (user_id);

ALTER TABLE chat_room_participants
    ADD CONSTRAINT fk_chat_room_participants_on_chat_room FOREIGN KEY (room_id) REFERENCES chat_rooms (room_id);

ALTER TABLE chat_room_participants
    ADD CONSTRAINT fk_chat_room_participants_on_user FOREIGN KEY (user_id) REFERENCES users (user_id);

ALTER TABLE driver_secondary_phones
    ADD CONSTRAINT fk_driver_secondary_phones_on_driver FOREIGN KEY (driver_id) REFERENCES drivers (user_id);

ALTER TABLE message_read_by
    ADD CONSTRAINT fk_mesreaby_on_message FOREIGN KEY (message_id) REFERENCES messages (message_id);

ALTER TABLE message_read_by
    ADD CONSTRAINT fk_mesreaby_on_user FOREIGN KEY (user_id) REFERENCES users (user_id);

ALTER TABLE offer_destinations
    ADD CONSTRAINT fk_offdes_on_location FOREIGN KEY (location_id) REFERENCES locations (location_id);

ALTER TABLE offer_destinations
    ADD CONSTRAINT fk_offdes_on_offer FOREIGN KEY (offer_id) REFERENCES offers (offer_id);

ALTER TABLE parent_secondary_phones
    ADD CONSTRAINT fk_parent_secondary_phones_on_parent FOREIGN KEY (parent_id) REFERENCES parents (user_id);

ALTER TABLE vehicle_assets
    ADD CONSTRAINT fk_vehass_on_assets FOREIGN KEY (asset_id) REFERENCES assets (asset_id);

ALTER TABLE vehicle_assets
    ADD CONSTRAINT fk_vehass_on_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles (vehicle_id);