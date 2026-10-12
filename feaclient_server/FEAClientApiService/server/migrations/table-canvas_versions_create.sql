CREATE TABLE canvas_versions (

    id UUID PRIMARY KEY
        DEFAULT gen_random_uuid(),

    canvas_id UUID NOT NULL
        REFERENCES canvases(id)
        ON DELETE CASCADE,

    version_number INTEGER NOT NULL,

    content JSONB NOT NULL,

    created_at TIMESTAMPTZ NOT NULL
        DEFAULT NOW(),

    UNIQUE (
        canvas_id,
        version_number
    )
);
