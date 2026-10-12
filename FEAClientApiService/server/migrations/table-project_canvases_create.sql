CREATE TABLE project_canvases (
    project_id UUID NOT NULL
        REFERENCES projects(id)
        ON DELETE CASCADE,

    canvas_id UUID NOT NULL
        REFERENCES canvases(id)
        ON DELETE CASCADE,

    PRIMARY KEY (
        project_id,
        canvas_id
    )
);
