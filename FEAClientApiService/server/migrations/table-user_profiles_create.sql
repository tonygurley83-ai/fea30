CREATE TABLE user_profiles (

    user_id UUID
        PRIMARY KEY
        REFERENCES user(id)
        ON DELETE CASCADE,

    display_name VARCHAR(255)
        NOT NULL,

    first_name VARCHAR(128),

    last_name VARCHAR(128),

    company VARCHAR(255),

    title VARCHAR(255),

    phone VARCHAR(50),

    avatar_url TEXT,

    profile_complete BOOLEAN
        NOT NULL
        DEFAULT FALSE,

    updated_at TIMESTAMP
        NOT NULL
        DEFAULT NOW()

);
