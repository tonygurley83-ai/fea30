const MicrosoftStrategy =
  require(
    "passport-microsoft"
  ).Strategy;

const AuthService =
  require(
    "../services/AuthService"
  );

module.exports =
  passport => {

    passport.use(

      new MicrosoftStrategy(

        {

          clientID:
            process.env
              .MICROSOFT_CLIENT_ID,

          clientSecret:
            process.env
              .MICROSOFT_CLIENT_SECRET,

          callbackURL:
            process.env
              .MICROSOFT_CALLBACK_URL,

          scope: [

            "user.read"

          ]

        },

        async (

          accessToken,

          refreshToken,

          profile,

          done

        ) => {

          try {

            const user =
              await AuthService
                .loginMicrosoft({

                  providerId:
                    profile.id,

                  email:
                    profile.emails?.[0]
                      ?.value,

                  displayName:
                    profile.displayName

                });

            return done(
              null,
              user
            );

          }
          catch (error) {

            return done(
              error
            );

          }

        }

      )

    );

  };
