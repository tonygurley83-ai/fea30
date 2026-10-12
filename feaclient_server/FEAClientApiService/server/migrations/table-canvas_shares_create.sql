CREATE TABLE canvas_shares
(
    canvas_id UUID NOT NULL,
    user_id UUID NOT NULL,
    permission VARCHAR(20) NOT NULL,

    PRIMARY KEY
    (
        canvas_id,
        user_id
    ),

    FOREIGN KEY
    (
        canvas_id
    )
    REFERENCES canvases(id)
    ON DELETE CASCADE,

    FOREIGN KEY
    (
        user_id
    )
    REFERENCES user(id)
    ON DELETE CASCADE
);
