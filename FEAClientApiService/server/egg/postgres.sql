CREATE ROLE indrachahallahuahaskuahllykuana
LOGIN
PASSWORD 'fealty';


-- Create database
CREATE DATABASE fea_nix_source
    WITH
    OWNER = indrachahallahuahaskuahllykuana
    ENCODING = 'UTF8'
    TEMPLATE = template0;

-- Optional: create application user
CREATE USER fea_nix_nest
    WITH PASSWORD 'Phoenix44!';

-- Create role
CREATE ROLE fea_nix_nest LOGIN PASSWORD 'indrachahallahuahaskuahllykuana';

-- Allow connecting to DB
GRANT CONNECT ON DATABASE fea_nix_source TO fea_nix_nest;

-- Allow using schema
GRANT USAGE ON SCHEMA public TO fea_nix_nest;

-- Remove direct table access
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM fea_nix_nest;

-- Grant execute on all existing functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO fea_nix_nest;

-- Grant execute on all future functions
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT EXECUTE ON FUNCTIONS TO fea_nix_nest;
