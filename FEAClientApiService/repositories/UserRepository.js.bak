const db =
  require("../server/egg/postgres");

class UserRepository {

  async findById(
    userId
  ) {

    try {

      console.log(
        "[UserRepository.findById]",
        userId
      );

      const result =
        await db.query(
          `
          SELECT *
          FROM find_user_by_id(
            $1
          )
          `,
          [userId]
        );

      console.log(
        "[UserRepository.findById RESULT]",
        result.rows[0]
      );

      return result.rows[0];

    }
    catch (error) {

      console.error(
        "[UserRepository.findById ERROR]",
        error
      );

      throw error;

    }

  }

  async findByEmail(
    email
  ) {

    try {

      console.log(
        "[UserRepository.findByEmail]",
        email
      );

      const result =
        await db.query(
          `
          SELECT *
          FROM find_user_by_email(
            $1
          )
          `,
          [email]
        );

      console.log(
        "[UserRepository.findByEmail RESULT]",
        result.rows[0]
      );

      return result.rows[0];

    }
    catch (error) {

      console.error(
        "[UserRepository.findByEmail ERROR]",
        error
      );

      throw error;

    }

  }

  async findByIdentityHash(
    identityHash
  ) {

    try {

      console.log(
        "[UserRepository.findByIdentityHash]",
        identityHash
      );

      const result =
        await db.query(
          `
          SELECT *
          FROM find_user_by_identity_hash(
            $1
          )
          `,
          [identityHash]
        );

      console.log(
        "[UserRepository.findByIdentityHash RESULT]",
        result.rows[0]
      );

      return result.rows[0];

    }
    catch (error) {

      console.error(
        "[UserRepository.findByIdentityHash ERROR]",
        error
      );

      throw error;

    }

  }

  async findIdentity(
    provider,
    providerUserId
  ) {

    try {

      console.log(
        "[UserRepository.findIdentity]",
        provider,
        providerUserId
      );

      const result =
        await db.query(
          `
          SELECT *
          FROM find_identity(
            $1,
            $2
          )
          `,
          [
            provider,
            providerUserId
          ]
        );

      console.log(
        "[UserRepository.findIdentity RESULT]",
        result.rows[0]
      );

      return result.rows[0];

    }
    catch (error) {

      console.error(
        "[UserRepository.findIdentity ERROR]",
        error
      );

      throw error;

    }

  }

  async createUser(
    user
  ) {

    try {

      console.log(
        "[UserRepository.createUser INPUT]",
        user
      );

      console.log(
        "[UserRepository.createUser PARAMS]"
      );

      console.dir(
        [
          user.id,
          user.email,
          user.displayName,
          user.role,
          user.identityHash
        ],
        { depth: null }
      );

      const result =
        await db.query(
          `
          SELECT *
          FROM create_user(
            $1,
            $2,
            $3,
            $4,
            $5
          )
          `,
          [
            user.id,
            user.email,
            user.displayName,
            user.role,
            user.identityHash
          ]
        );

      console.log(
        "[UserRepository.createUser RAW RESULT]"
      );

      console.dir(
        result,
        { depth: null }
      );

      console.log(
        "[UserRepository.createUser ROW COUNT]",
        result.rowCount
      );

      console.log(
        "[UserRepository.createUser RESULT]",
        result.rows[0]
      );

      return result.rows[0];

    }
    catch (error) {

      console.error(
        "[UserRepository.createUser ERROR]"
      );

      console.error(
        error
      );

      throw error;

    }

  }

  async createIdentity(
    identity
  ) {

    try {

      console.log(
        "[UserRepository.createIdentity INPUT]",
        identity
      );

      const result =
        await db.query(
          `
          SELECT *
          FROM create_user_identity(
            $1,
            $2,
            $3,
            $4,
            $5
          )
          `,
          [
            identity.id,
            identity.userId,
            identity.provider,
            identity.providerUserId,
            identity.providerEmail
          ]
        );

      console.log(
        "[UserRepository.createIdentity RESULT]",
        result.rows[0]
      );

      return result.rows[0];

    }
    catch (error) {

      console.error(
        "[UserRepository.createIdentity ERROR]"
      );

      console.error(error);

      throw error;

    }

  }

  async updateLastLogin(
    userId
  ) {

    try {

      console.log(
        "[UserRepository.updateLastLogin]",
        userId
      );

      await db.query(
        `
        SELECT update_last_login(
          $1
        )
        `,
        [userId]
      );

      console.log(
        "[UserRepository.updateLastLogin SUCCESS]"
      );

    }
    catch (error) {

      console.error(
        "[UserRepository.updateLastLogin ERROR]"
      );

      console.error(error);

      throw error;

    }

  }

}

module.exports =
  new UserRepository();
