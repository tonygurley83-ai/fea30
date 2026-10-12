const express = require("express");
const session = require("express-session");
const passport = require("passport");

require("dotenv").config();

require("./auth/passport");

const userRoutes = require("./routes/user");
const canvasRoutes = require("./routes/canvases");

const app = express();

app.use(express.json());
app.use("/auth", require("./routes/auth"));


app.use(
  session({
    secret:
      process.env.SESSION_SECRET ||
      "local-dev-secret",

    resave: false,

    saveUninitialized: false,

    cookie: {
      httpOnly: true,
      secure: false, // true only behind HTTPS
      maxAge:
        1000 * 60 * 60 * 24 * 7 // 7 days
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(authRoutes);
app.use(userRoutes);
app.use(projectRoutes);
app.use(canvasRoutes);

app.get("/health", (req, res) => {
  res.json({
    ok: true
  });
});

app.listen(6700, () => {
  console.log(
    "Server running on port 6700"
  );

  console.log(
    "[AUTH] Google Client ID:",
    process.env.GOOGLE_CLIENT_ID
      ? "Loaded"
      : "Missing"
  );

  console.log(
    "[AUTH] Session Secret:",
    process.env.SESSION_SECRET
      ? "Loaded"
      : "Missing"
  );
});

