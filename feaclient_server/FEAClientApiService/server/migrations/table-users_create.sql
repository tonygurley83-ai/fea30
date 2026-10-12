CREATE TABLE user (
    id UUID PRIMARY KEY,

    email VARCHAR(320)
        UNIQUE NOT NULL,

    display_name VARCHAR(255)
        NOT NULL,

    role VARCHAR(50)
        NOT NULL
        DEFAULT 'Engineer',

    identity_hash CHAR(64)
        UNIQUE,

    created_at TIMESTAMP
        NOT NULL
        DEFAULT NOW(),

    last_login TIMESTAMP
);
