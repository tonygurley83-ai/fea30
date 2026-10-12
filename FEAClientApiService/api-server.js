const express = require("express");
const cors = require("cors");
const crypto = require("crypto");

require("dotenv").config();

const NETWORK_ID =
  crypto.randomUUID();

const app = express();

app.use(
  cors({
    origin:
      "http://localhost:5000",
    credentials: true
  })
);

app.use(express.json());

app.get(
  "/health",
  (req, res) => {
    res.json({
      ok: true,
      service: "api",
      networkId: NETWORK_ID,
      timestamp:
        new Date().toISOString(),
      uptime:
        process.uptime()
    });
  }
);

app.listen(6700, () => {

  console.log(
    "API Server running on 6700",
    NETWORK_ID
  );

});

