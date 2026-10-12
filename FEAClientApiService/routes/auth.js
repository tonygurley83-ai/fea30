const router =
  require("express").Router();

const passport =
  require("passport");

const AuthService =
  require("../services/AuthService");

const requireAuth =
  require("../middleware/requireAuth");

/*
 * HEALTH / DEBUG
 */

router.get(
  "/auth/debug",
  (req, res) => {

    res.json({
      working: true,
      strategies:
        Object.keys(
          passport._strategies
        )
    });

  }
);

router.get(
  "/auth/failure",
  (req, res) => {

    res.status(401).json({
      success: false,
      message:
        "Authentication failed"
    });

  }
);

/*
 * GOOGLE LOGIN
 */

router.get(
  "/auth/google",
  passport.authenticate(
    "google",
    {
      scope: [
        "profile",
        "email"
      ],
      session: false
    }
  )
);

/*
 * GOOGLE CALLBACK
 */

router.get(
  "/auth/google/callback",
  passport.authenticate(
    "google",
    {
      failureRedirect:
        "/auth/failure",
      session: false
    }
  ),
  (req, res) => {

    try {

      console.log(
        "[AUTH] Google login success:",
        req.user?.email
      );

      const token =
        AuthService.createToken(
          req.user
        );

      console.log(
        "[AUTH] JWT created"
      );

      res.redirect(
        `http://localhost:5000/login-success?token=${token}`
      );

    }
    catch (err) {

      console.error(
        "[AUTH CALLBACK ERROR]"
      );

      console.error(err);

      res.status(500).json({
        error:
          err.message
      });

    }

  }
);

/*
 * CURRENT USER
 */

router.get(
  "/auth/user",
  requireAuth,
  async (req, res) => {

    try {

      console.log(
        "[AUTH USER JWT]"
      );

      console.dir(
        req.user,
        { depth: null }
      );

      const userId =
        req.user?.userId ||
        req.user?.id;

      console.log(
        "[AUTH USER ID]",
        userId
      );

      const user =
        await AuthService.getUser(
          userId
        );

      console.log(
        "[AUTH USER DB]"
      );

      console.dir(
        user,
        { depth: null }
      );

      if (!user) {

        return res
          .status(404)
          .json({
            error:
              "User not found",
            userId,
            jwtUser:
              req.user
          });

      }

      res.json(user);

    }
    catch (err) {

      console.error(
        "[AUTH USER ERROR]"
      );

      console.error(err);

      res.status(500).json({
        error:
          err.message
      });

    }

  }
);

/*
 * CURRENT USER (NEW UI)
 */

router.get(
  "/auth/me",
  requireAuth,
  async (req, res) => {

    try {

      const userId =
        req.user?.userId ||
        req.user?.id;

      const user =
        await AuthService.getUser(
          userId
        );

      if (!user) {

        return res
          .status(404)
          .json({
            error:
              "User not found",
            userId
          });

      }

      res.json(user);

    }
    catch (err) {

      console.error(
        "[AUTH ME ERROR]"
      );

      console.error(err);

      res.status(500).json({
        error:
          err.message
      });

    }

  }
);

/*
 * USER BY ID
 */

router.get(
  "/auth/user/:id",
  requireAuth,
  async (req, res) => {

    try {

      const user =
        await AuthService.getUser(
          req.params.id
        );

      if (!user) {

        return res
          .status(404)
          .json({
            error:
              "User not found",
            userId:
              req.params.id
          });

      }

      res.json(user);

    }
    catch (err) {

      console.error(
        "[AUTH USERS ID ERROR]"
      );

      console.error(err);

      res.status(500).json({
        error:
          err.message
      });

    }

  }
);

/*
 * LOGOUT
 */

router.get(
  "/auth/logout",
  (req, res) => {

    req.logout(
      err => {

        if (err) {

          return res
            .status(500)
            .json({
              error:
                err.message
            });

        }

        res.json({
          success: true
        });

      }
    );

  }
);

module.exports =
  router;

