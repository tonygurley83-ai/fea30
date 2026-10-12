const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const crypto = require("crypto");

require("dotenv").config();
require("./passport");

const authRoutes = require("../routes/auth");
const projectRoutes = require("../routes/projects");
const canvasRoutes = require("../routes/canvases");

const app = express();

const NETWORK_ID = crypto.randomUUID();

/*
 * GLOBAL MIDDLEWARE
 */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: false
  })
);

app.use(
  session({
    secret:
      process.env.SESSION_SECRET ||
      "local-dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: "lax"
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.url}`);
  next();
});

/*
 * ROUTES
 */

app.use(authRoutes);
app.use("/auth/projects", projectRoutes);
app.use("/auth/canvases", canvasRoutes);

/*
 * HEALTH
 */

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    service: "fea-client-api",
    networkId: NETWORK_ID,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

/*
 * 404
 */

app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    method: req.method,
    path: req.originalUrl
  });
});

const PORT =
  process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(
    `FEA Client API running on ${PORT}`,
    NETWORK_ID
  );
});
