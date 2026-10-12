const { Pool } = require("pg");

const pool = new Pool({
  host: "127.0.0.1",
  port: 5431,
  database: "fea_nix_source",
  user: "fea_nix_nest",
  password: "m0lot0v c0ckt41ls"
});

module.exports = pool;
