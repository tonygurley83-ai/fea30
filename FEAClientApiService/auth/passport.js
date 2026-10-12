const passport =
  require("passport");

const UserRepository =
  require(
    "../repositories/UserRepository"
  );

console.log(
  "Passport loaded:",
  !!passport
);

/*
 * SERIALIZE USER
 */

passport.serializeUser(
  (user, done) => {

    done(
      null,
      user.id
    );

  }
);

/*
 * DESERIALIZE USER
 */

passport.deserializeUser(
  async (id, done) => {

    try {

      const user =
        await UserRepository
          .findById(id);

      if (!user) {

        return done(
          new Error(
            `User not found: ${id}`
          )
        );

      }

      done(
        null,
        user
      );

    } catch (err) {

      done(err);

    }

  }
);

/*
 * OPTIONAL GOOGLE AUTH
 */

if (

  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET

) {

  console.log(
    "[AUTH] Loading Google strategy"
  );

  require("./google")(
    passport
  );

  console.log(
    "[AUTH] Strategies after Google:",
    Object.keys(
      passport._strategies
    )
  );

}
else {

  console.log(
    "[AUTH] Google strategy disabled"
  );

}

/*
 * OPTIONAL MICROSOFT AUTH
 */

if (

  process.env.MICROSOFT_CLIENT_ID &&
  process.env.MICROSOFT_CLIENT_SECRET

) {

  console.log(
    "[AUTH] Loading Microsoft strategy"
  );

  require("./microsoft")(
    passport
  );

  console.log(
    "[AUTH] Strategies after Microsoft:",
    Object.keys(
      passport._strategies
    )
  );

}
else {

  console.log(
    "[AUTH] Microsoft strategy disabled"
  );

}

console.log(
  "[AUTH] Final Strategies:",
  Object.keys(
    passport._strategies
  )
);

module.exports =
  passport;
