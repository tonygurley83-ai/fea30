CREATE TABLE canvas_share_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    canvas_id UUID NOT NULL
        REFERENCES canvases(id)
        ON DELETE CASCADE,

    token VARCHAR(128) NOT NULL UNIQUE,

    created_by UUID NOT NULL,

    expires_at TIMESTAMPTZ NULL,

    created_at TIMESTAMPTZ DEFAULT NOW()
);
