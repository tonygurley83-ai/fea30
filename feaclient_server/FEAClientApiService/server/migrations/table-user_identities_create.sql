CREATE TABLE user_identities (

    id UUID PRIMARY KEY,

    user_id UUID NOT NULL,

    provider VARCHAR(50) NOT NULL,

    provider_user_id VARCHAR(255) NOT NULL,

    provider_email VARCHAR(320),

    created_at TIMESTAMP NOT NULL
        DEFAULT NOW(),

    CONSTRAINT fk_user
        FOREIGN KEY(user_id)
        REFERENCES user(id),

    CONSTRAINT uq_provider_identity
        UNIQUE(
            provider,
            provider_user_id
        )
);
