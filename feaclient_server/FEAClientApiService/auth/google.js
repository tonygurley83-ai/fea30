const crypto =
  require("crypto");

const GoogleStrategy =
  require("passport-google-oauth20").Strategy;

const UserRepository =
  require("../repositories/UserRepository");

module.exports = passport => {

  passport.use(
    new GoogleStrategy(
      {
        clientID:
          process.env.GOOGLE_CLIENT_ID,

        clientSecret:
          process.env.GOOGLE_CLIENT_SECRET,

        callbackURL:
          "http://localhost:8080/auth/google/callback"
      },
      async (
        accessToken,
        refreshToken,
        profile,
        done
      ) => {

        try {

          const email =
            profile.emails?.[0]?.value;

          console.log(
            "[AUTH] Google Email:",
            email
          );

          let user =
            await UserRepository
              .findByEmail(email);

          console.log(
            "[AUTH] Existing User:",
            user
          );

          if (!user) {

            console.log(
              "[AUTH] Creating user..."
            );

            user =
              await UserRepository
                .createUser({
                  id:
                    crypto.randomUUID(),

                  email,

                  displayName:
                    profile.displayName,

                  role:
                    "Engineer",

                  identityHash:
                    profile.id
                });

            console.log(
              "[AUTH] Created User:",
              user
            );

          }

          if (!user) {

            return done(
              new Error(
                "Unable to create user"
              )
            );

          }

          return done(
            null,
            user
          );

        }
        catch (err) {

          console.error(
            "[AUTH GOOGLE ERROR]"
          );

          console.error(
            err
          );

          return done(
            err
          );

        }

      }
    )
  );

};
