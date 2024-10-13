CREATE TABLE explorers (
    id UUID PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at VARCHAR(50),  -- ISO 8601 string for created time
    last_login VARCHAR(50)   -- ISO 8601 string for last login time
);

CREATE TABLE topics (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at VARCHAR(50),  -- ISO 8601 string for created time
    updated_at VARCHAR(50),  -- ISO 8601 string for updated time
    explorer_id UUID REFERENCES explorers(id) ON DELETE CASCADE
);

CREATE TABLE devices (
    id UUID PRIMARY KEY,
    explorer_id UUID REFERENCES explorers(id) ON DELETE CASCADE,
    device_name VARCHAR(255) NOT NULL,
    last_synced VARCHAR(50),  -- ISO 8601 string for last synced time
    created_at VARCHAR(50)    -- ISO 8601 string for created time
);