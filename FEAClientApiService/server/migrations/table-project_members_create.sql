CREATE TABLE project_members (
    project_id UUID NOT NULL
        REFERENCES projects(id)
        ON DELETE CASCADE,

    user_id UUID NOT NULL,

    role VARCHAR(20) NOT NULL
        CHECK (
            role IN (
                'engineer',
                'admin'
            )
        ),

    PRIMARY KEY (
        project_id,
        user_id
    )
);
