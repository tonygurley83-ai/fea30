CREATE TABLE canvases (

    id UUID PRIMARY KEY
        DEFAULT gen_random_uuid(),

    name VARCHAR(255) NOT NULL,

    owner_id UUID NOT NULL
        REFERENCES user(id)
        ON DELETE CASCADE,

    current_version INTEGER NOT NULL
        DEFAULT 1,

    created_at TIMESTAMPTZ NOT NULL
        DEFAULT NOW()
);
