const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const UserRepository = require(
  "../repositories/UserRepository"
);

const ROLE_LEVELS = {
  Viewer: 1,
  Engineer: 2,
  Admin: 3
};

class AuthService {

  createToken(user) {

    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        identityHash:
          user.identity_hash
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "8h"
      }
    );

  }

  async getUser(
    userId
  ) {

    if (!userId) {

      throw new Error(
        "User ID required"
      );

    }

    return UserRepository
      .findById(
        userId
      );

  }

  async createUser({
    email,
    displayName,
    role = "Engineer"
  }) {

    const identityHash =
      crypto
        .createHash("sha256")
        .update(
          email
            .trim()
            .toLowerCase()
        )
        .digest("hex");

    const existingUser =
      await UserRepository
        .findByIdentityHash(
          identityHash
        );

    if (
      existingUser?.id
    ) {

      console.log(
        "[AUTH] Existing user found",
        existingUser.id
      );

      return existingUser;

    }

    const user =
      await UserRepository
        .createUser({
          id:
            crypto.randomUUID(),
          email,
          displayName,
          role,
          identityHash
        });

    console.log(
      "[AUTH] User created",
      user
    );

    return user;

  }

  async loginGoogle(
    profile
  ) {

    return this.loginProvider(
      "google",
      profile
    );

  }

  async loginMicrosoft(
    profile
  ) {

    return this.loginProvider(
      "microsoft",
      profile
    );

  }

  async loginProvider(
    provider,
    profile
  ) {

    console.log(
      "[AUTH PROFILE]"
    );

    console.dir(
      profile,
      { depth: null }
    );

    const providerUserId =
      profile.providerId ||
      profile.id;

    if (!providerUserId) {

      throw new Error(
        "No provider user ID found in OAuth profile."
      );

    }

    let identity =
      await UserRepository
        .findIdentity(
          provider,
          providerUserId
        );

    if (
      identity?.user_id
    ) {

      console.log(
        "[AUTH] Existing OAuth identity",
        identity
      );

      const user =
        await UserRepository
          .findById(
            identity.user_id
          );

      if (user?.id) {

        await UserRepository
          .updateLastLogin(
            user.id
          );

        return user;

      }

    }

    const identityHash =
      crypto
        .createHash("sha256")
        .update(
          profile.email
            .trim()
            .toLowerCase()
        )
        .digest("hex");

    let user =
      await UserRepository
        .findByIdentityHash(
          identityHash
        );

    if (
      !user?.id
    ) {

      console.log(
        "[AUTH] Creating user",
        profile.email
      );

      user =
        await UserRepository
          .createUser({
            id:
              crypto.randomUUID(),

            email:
              profile.email,

            displayName:
              profile.displayName,

            role:
              "Engineer",

            identityHash
          });

      console.log(
        "[AUTH] User created",
        user
      );

    }
    else {

      console.log(
        "[AUTH] Existing user found",
        user.id
      );

    }

    if (!user?.id) {

      throw new Error(
        "User creation failed"
      );

    }

    const createdIdentity =
      await UserRepository
        .createIdentity({
          id:
            crypto.randomUUID(),

          userId:
            user.id,

          provider,

          providerUserId,

          providerEmail:
            profile.email
        });

    console.log(
      "[AUTH] Identity created",
      createdIdentity
    );

    await UserRepository
      .updateLastLogin(
        user.id
      );

    return user;

  }

  authorize(
    minimumRole
  ) {

    return (
      req,
      res,
      next
    ) => {

      if (!req.user) {

        return res
          .status(401)
          .json({
            error:
              "Unauthorized"
          });

      }

      const userLevel =
        ROLE_LEVELS[
          req.user.role
        ] || 0;

      const requiredLevel =
        ROLE_LEVELS[
          minimumRole
        ] || 0;

      if (
        userLevel <
        requiredLevel
      ) {

        return res
          .status(403)
          .json({
            error:
              "Forbidden"
          });

      }

      next();

    };

  }

}

module.exports =
  new AuthService();
